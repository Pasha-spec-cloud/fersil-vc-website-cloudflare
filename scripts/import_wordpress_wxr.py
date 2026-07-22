#!/usr/bin/env python3
"""
Utility script that converts the WordPress WXR export from fersilcapital.com into
structured JSON content files for the new FerSil site.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Callable, Set

import xml.etree.ElementTree as ET

WP_NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
}
WP_TAG = '{http://wordpress.org/export/1.2/}'
CONTENT_TAG = '{http://purl.org/rss/1.0/modules/content/}'
EXCERPT_TAG = '{http://wordpress.org/export/1.2/excerpt/}'


class HTMLStripper(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._data: List[str] = []

    def handle_data(self, data: str) -> None:  # type: ignore[override]
        self._data.append(data)

    def get_data(self) -> str:
        return ' '.join(chunk.strip() for chunk in self._data if chunk.strip()).strip()


def strip_html(value: Optional[str]) -> str:
    if not value:
        return ''
    parser = HTMLStripper()
    parser.feed(value)
    return parser.get_data()


def normalize_bool(value: Optional[str]) -> bool:
    if not value:
        return False
    lowered = value.strip().lower()
    if lowered in {'1', 'true', 'yes', 'on'}:
        return True
    if lowered.startswith('a:') and 's:4:"true"' in lowered:
        return True
    return False


def parse_php_serialized_list(value: Optional[str]) -> List[str]:
    if not value:
        return []
    return re.findall(r's:\d+:"([^"]+)"', value)


def parse_int(value: Optional[str]) -> Optional[int]:
    if not value:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_logo(content: str, output_dir: Path, slug: str) -> str:
    ensure_dir(output_dir)
    filename = f'{slug}.svg'
    file_path = output_dir / filename
    file_path.write_text(content.strip(), encoding='utf-8')
    return f'/media/logos/{filename}'


def parse_links_from_html(markup: Optional[str]) -> List[Dict[str, str]]:
    if not markup:
        return []

    links: List[Dict[str, str]] = []

    class LinkParser(HTMLParser):
        def handle_starttag(self, tag: str, attrs: List[tuple[str, Optional[str]]]) -> None:  # type: ignore[override]
            if tag != 'a':
                return
            href = next((value for (name, value) in attrs if name == 'href'), None)
            self.current_href = href

        def handle_endtag(self, tag: str) -> None:  # type: ignore[override]
            if tag == 'a':
                self.current_href = None

        def handle_data(self, data: str) -> None:  # type: ignore[override]
            if getattr(self, 'current_href', None):
                label = data.strip()
                if label:
                    links.append({'label': label, 'url': self.current_href})  # type: ignore[arg-type]

    parser = LinkParser()
    parser.feed(markup)
    return [link for link in links if link['url']]


@dataclass
class WPItem:
    post_id: str
    post_type: str
    slug: str
    title: str
    status: str
    content: str
    excerpt: str
    date: str
    permalink: str
    meta: Dict[str, List[str]]


@dataclass
class AttachmentInfo:
    url: str
    relative_path: Optional[str]


AttachmentResolver = Callable[[Optional[str]], Optional[str]]


def load_items(xml_path: Path) -> List[WPItem]:
    root = ET.parse(xml_path).getroot()
    items: List[WPItem] = []
    for item_el in root.findall('.//item'):
        post_type = item_el.find(f'./{WP_TAG}post_type')
        post_id = item_el.find(f'./{WP_TAG}post_id')
        slug = item_el.find(f'./{WP_TAG}post_name')
        title = item_el.find('title')
        permalink_el = item_el.find('link')
        status = item_el.find(f'./{WP_TAG}status')
        date = item_el.find(f'./{WP_TAG}post_date')
        if date is None:
            date = item_el.find(f'./{WP_TAG}post_date_gmt')
        content = item_el.find(f'./{CONTENT_TAG}encoded')
        excerpt = item_el.find(f'./{EXCERPT_TAG}encoded')

        if None in (post_type, post_id, slug, title, status):
            continue

        meta: Dict[str, List[str]] = defaultdict(list)
        for meta_el in item_el.findall(f'./{WP_TAG}postmeta'):
            key_el = meta_el.find(f'./{WP_TAG}meta_key')
            val_el = meta_el.find(f'./{WP_TAG}meta_value')
            if key_el is None:
                continue
            meta[key_el.text].append(val_el.text if val_el is not None else '')

        items.append(
            WPItem(
                post_id=post_id.text or '',
                post_type=post_type.text or '',
                slug=slug.text or '',
                title=title.text or '',
                status=status.text or '',
                content=content.text if content is not None else '',
                excerpt=excerpt.text if excerpt is not None else '',
                date=date.text if date is not None else '',
                permalink=permalink_el.text if permalink_el is not None else '',
                meta=meta,
            )
        )
    return items


def resolve_attachment_url(item_el: ET.Element) -> str:
    attachment_url = item_el.find(f'./{WP_TAG}attachment_url')
    return attachment_url.text if attachment_url is not None else ''


def build_attachment_index(xml_path: Path) -> Dict[str, AttachmentInfo]:
    root = ET.parse(xml_path).getroot()
    attachments: Dict[str, AttachmentInfo] = {}
    for item_el in root.findall('.//item'):
        post_type = item_el.find(f'./{WP_TAG}post_type')
        if post_type is None or post_type.text != 'attachment':
            continue
        post_id_el = item_el.find(f'./{WP_TAG}post_id')
        if post_id_el is None:
            continue
        relative_path: Optional[str] = None
        for meta_el in item_el.findall(f'./{WP_TAG}postmeta'):
            key_el = meta_el.find(f'./{WP_TAG}meta_key')
            if key_el is not None and key_el.text == '_wp_attached_file':
                val_el = meta_el.find(f'./{WP_TAG}meta_value')
                relative_path = val_el.text if val_el is not None else None
                break
        attachments[post_id_el.text] = AttachmentInfo(
            url=resolve_attachment_url(item_el),
            relative_path=relative_path
        )
    return attachments


def sanitize_relative_path(value: str) -> Optional[Path]:
    path = Path(value)
    if path.is_absolute():
        return None
    if any(part == '..' for part in path.parts):
        return None
    return path


def create_attachment_resolver(
  attachments: Dict[str, AttachmentInfo],
  media_root: Optional[Path],
  uploads_dir: Path
) -> AttachmentResolver:
    copied: Set[str] = set()
    ensure_dir(uploads_dir)

    def resolver(attachment_id: Optional[str]) -> Optional[str]:
        if not attachment_id:
            return None
        info = attachments.get(attachment_id)
        if not info:
            return None
        if media_root and info.relative_path:
            relative_path = sanitize_relative_path(info.relative_path)
            if relative_path:
                source = media_root / relative_path
                if source.exists():
                    destination = uploads_dir / relative_path
                    ensure_dir(destination.parent)
                    rel_posix = relative_path.as_posix()
                    if rel_posix not in copied:
                        shutil.copy2(source, destination)
                        copied.add(rel_posix)
                    return f'/media/uploads/{rel_posix}'
        return info.url or None

    return resolver


def parse_company(item: WPItem, logos_dir: Path) -> Dict[str, Any]:
    meta = item.meta

    def first(key: str) -> Optional[str]:
        values = meta.get(key)
        return values[0] if values else None

    logo_markup = first('logo')
    logo_path: Optional[str] = None
    if logo_markup:
        logo_path = save_logo(logo_markup, logos_dir, item.slug)

    tagline = first('subtext')
    description_html = first('description') or ''
    description = strip_html(description_html)
    status_raw = (first('status') or 'current').strip().lower()
    status = 'exited' if 'exit' in status_raw else 'active'

    facts: List[Dict[str, Any]] = []
    founders: List[str] = []
    co_investors: List[str] = []
    office_locations: List[str] = []
    ceo: Optional[str] = None
    stage: Optional[str] = None
    first_investment_year: Optional[int] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    external_links: List[Dict[str, str]] = []

    block_index = 0
    while True:
        title_key = f'company_details_{block_index}_company_detail_title'
        title = first(title_key)
        if not title:
            # stop once we no longer find contiguous sections
            if not any(key.startswith(f'company_details_{block_index}_') for key in meta.keys()):
                break
            block_index += 1
            continue
        items: List[Dict[str, Any]] = []
        entry_index = 0
        while True:
            desc_key = f'company_details_{block_index}_company_details_block_{entry_index}_company_detail_description'
            desc_value = first(desc_key)
            if desc_value is None:
                break
            text = strip_html(desc_value)
            url_key = f'company_details_{block_index}_company_details_block_{entry_index}_company_url'
            url = first(url_key)
            item_entry: Dict[str, Any] = {'text': text}
            if url:
                item_entry['url'] = url
            items.append(item_entry)
            entry_index += 1

        if items:
            facts.append({'title': title, 'items': items})
            lowered = title.lower()
            if 'founder' in lowered:
                founders = [entry['text'] for entry in items if entry.get('text')]
            elif 'co-investor' in lowered:
                co_investors = [entry['text'] for entry in items if entry.get('text')]
            elif 'office' in lowered:
                office_locations = [entry['text'] for entry in items if entry.get('text')]
            elif 'ceo' in lowered and items:
                ceo = items[0].get('text')
            elif 'stage' in lowered and items:
                stage = items[0].get('text')
            elif ('year of first fersil investment' in lowered or 'year of 1st fersil investment' in lowered) and items:
                first_investment_year = parse_int(items[0].get('text'))
            elif 'links' in lowered:
                for entry in items:
                    label = entry.get('text', '')
                    url = entry.get('url')
                    if not url:
                        continue
                    link = {'label': label or 'Link', 'url': url}
                    external_links.append(link)
                    if 'website' in label.lower():
                        website = url
                    if 'linkedin' in label.lower():
                        linkedin = url
        block_index += 1

    return {
        'id': f'company-{item.post_id}',
        'slug': item.slug,
        'name': item.title,
        'status': status,
        'tagline': tagline,
        'descriptionHtml': description_html,
        'description': description,
        'stage': stage,
        'firstInvestmentYear': first_investment_year,
        'founders': founders,
        'ceo': ceo,
        'coInvestors': co_investors,
        'officeLocations': office_locations,
        'website': website,
        'linkedin': linkedin,
        'links': external_links,
        'facts': facts,
        'logo': logo_path,
    }


def parse_team_member(
    item: WPItem,
    resolve_attachment: AttachmentResolver,
    company_slug_by_id: Dict[str, str],
    news_slug_by_id: Dict[str, str]
) -> Dict[str, Any]:
    meta = item.meta

    def first(key: str) -> Optional[str]:
        values = meta.get(key)
        return values[0] if values else None

    headshot_url = resolve_attachment(first('_thumbnail_id'))
    hero_image_url = resolve_attachment(first('header_img'))
    role = first('m_status') or ''
    bio_html = item.content
    bio = strip_html(bio_html)

    stats: List[Dict[str, str]] = []
    social_links: List[Dict[str, str]] = []
    feature_links: List[Dict[str, str]] = []

    block_index = 0
    while True:
        text_title = first(f'flex_for_sidebar_{block_index}_flex_text_title')
        links_title = first(f'flex_for_sidebar_{block_index}_flex_links_title')
        if not text_title and not links_title:
            if not any(key.startswith(f'flex_for_sidebar_{block_index}_') for key in meta.keys()):
                break
            block_index += 1
            continue
        if text_title:
            content_value = first(f'flex_for_sidebar_{block_index}_flex_text_content')
            if content_value:
                stats.append({'label': text_title, 'value': strip_html(content_value)})
        elif links_title:
            links_value = first(f'flex_for_sidebar_{block_index}_flex_links_content')
            parsed_links = parse_links_from_html(links_value)
            if parsed_links:
                target = social_links if 'social' in links_title.lower() else feature_links
                for link in parsed_links:
                    target.append(link)
        block_index += 1

    company_links_raw = first('campanies_found')
    company_slugs: List[str] = []
    if company_links_raw:
        for company_id in parse_php_serialized_list(company_links_raw):
            slug = company_slug_by_id.get(company_id)
            if slug:
                company_slugs.append(slug)

    article_links_raw = first('articles')
    news_slugs: List[str] = []
    if article_links_raw:
        for news_id in parse_php_serialized_list(article_links_raw):
            slug = news_slug_by_id.get(news_id)
            if slug:
                news_slugs.append(slug)

    return {
        'id': f'team-{item.post_id}',
        'slug': item.slug,
        'name': item.title,
        'role': role,
        'bioHtml': bio_html,
        'bio': bio,
        'headshotUrl': headshot_url,
        'heroImageUrl': hero_image_url,
        'stats': stats,
        'socialLinks': social_links,
        'featureLinks': feature_links,
        'companySlugs': company_slugs,
        'newsSlugs': news_slugs,
    }


def parse_news(item: WPItem, resolve_attachment: AttachmentResolver) -> Dict[str, Any]:
    meta = item.meta

    def first(key: str) -> Optional[str]:
        values = meta.get(key)
        return values[0] if values else None

    external_url = first('external_url')
    press_release_date = first('press_release_date')
    published_at: Optional[str] = None
    if press_release_date:
        try:
            if len(press_release_date) == 8 and press_release_date.isdigit():
                published_at = datetime.strptime(press_release_date, '%Y%m%d').isoformat()
            else:
                published_at = datetime.fromisoformat(press_release_date).isoformat()
        except ValueError:
            published_at = None
    if not published_at and item.date:
        try:
            published_at = datetime.fromisoformat(item.date).isoformat()
        except ValueError:
            published_at = item.date

    featured = normalize_bool(first('featured_story'))
    image_url = resolve_attachment(first('_thumbnail_id'))

    return {
        'id': f'news-{item.post_id}',
        'slug': item.slug,
        'title': item.title,
        'summary': strip_html(item.excerpt) or strip_html(item.content),
        'bodyHtml': item.content or '',
        'link': external_url or item.permalink,
        'publishedAt': published_at or '',
        'featured': featured,
        'imageUrl': image_url,
        'logoPreference': first('logo_or_photo'),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Import fersilcapital.com WXR to JSON content.')
    parser.add_argument('--input', required=True, help='Path to the WordPress XML (WXR) export file.')
    parser.add_argument('--content-dir', default='content', help='Directory where JSON content files are stored.')
    parser.add_argument('--logos-dir', default='public/media/logos', help='Directory where extracted logos will be written.')
    parser.add_argument('--media-root', help='Path to the downloaded wp-content/uploads directory to pull binary assets from.')
    parser.add_argument('--uploads-dir', default='public/media/uploads', help='Directory where binary assets should be copied.')
    args = parser.parse_args()

    xml_path = Path(args.input).expanduser().resolve()
    if not xml_path.exists():
        print(f'Input file {xml_path} does not exist.', file=sys.stderr)
        sys.exit(1)

    content_dir = Path(args.content_dir)
    logos_dir = Path(args.logos_dir)
    media_root = Path(args.media_root).expanduser().resolve() if args.media_root else None
    uploads_dir = Path(args.uploads_dir)
    ensure_dir(content_dir)
    ensure_dir(logos_dir)
    if media_root and not media_root.exists():
        print(f'Media root {media_root} does not exist.', file=sys.stderr)
        sys.exit(1)

    items = load_items(xml_path)
    attachments = build_attachment_index(xml_path)
    resolve_attachment = create_attachment_resolver(attachments, media_root, uploads_dir)

    company_items = [item for item in items if item.post_type == 'companies']
    news_items = [item for item in items if item.post_type == 'news' and item.status == 'publish']
    team_items = [item for item in items if item.post_type == 'our-team' and item.status == 'publish']

    company_slug_by_id = {item.post_id: item.slug for item in company_items}
    news_slug_by_id = {item.post_id: item.slug for item in news_items}

    companies = [parse_company(item, logos_dir) for item in company_items]
    team = [parse_team_member(item, resolve_attachment, company_slug_by_id, news_slug_by_id) for item in team_items]
    news = [parse_news(item, resolve_attachment) for item in news_items]

    (content_dir / 'companies.json').write_text(json.dumps(companies, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (content_dir / 'team.json').write_text(json.dumps(team, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (content_dir / 'news.json').write_text(json.dumps(news, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    print(f'Wrote {len(companies)} companies, {len(team)} team members, and {len(news)} news entries.')


if __name__ == '__main__':
    main()

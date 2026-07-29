import { NewsItem } from '@/types/content';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

type NewsCardProps = {
  item: NewsItem;
  companyName?: string;
  variant?: 'default' | 'compact';
};

export function NewsCard({ item, companyName, variant = 'default' }: NewsCardProps) {
  const date = formatDate(item.publishedAt);
  const isLinkable = Boolean(item.link && item.link !== '#');
  const isExternal = Boolean(item.link && /^https?:/i.test(item.link));

  const content = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted">
        {companyName && <span className="text-primary">{companyName}</span>}
        <span>{date}</span>
      </div>
      <h3 className="font-display text-2xl text-white">{item.title}</h3>
      {item.summary && <p className="text-sm text-muted">{item.summary}</p>}
      {variant === 'default' && isLinkable && <p className="text-sm text-accent">Read story →</p>}
    </div>
  );

  return (
    <Card className="h-full rounded-3xl border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      {!isLinkable && content}
      {isLinkable &&
        (isExternal ? (
          <a href={item.link!} target="_blank" rel="noreferrer noopener" className="block">
            {content}
          </a>
        ) : (
          <a href={item.link as string} className="block">
            {content}
          </a>
        ))}
    </Card>
  );
}

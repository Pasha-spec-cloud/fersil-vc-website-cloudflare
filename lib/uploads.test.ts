import { describe, expect, it } from 'vitest';

import { buildUploadPath, getUploadFileExtension } from '@/lib/uploads';

describe('lib/uploads', () => {
  it('derives file extensions from name or mime type', () => {
    const namedFile = { name: 'logo.PNG', type: '' } as File;
    expect(getUploadFileExtension(namedFile)).toBe('.png');

    const mimeFile = { name: '', type: 'image/jpeg' } as File;
    expect(getUploadFileExtension(mimeFile)).toBe('.jpg');

    const fallback = { name: '', type: '' } as File;
    expect(getUploadFileExtension(fallback)).toBe('.bin');
  });

  it('builds upload paths with safe prefixes and date segments', () => {
    const now = new Date('2024-05-15T12:00:00Z');
    const { absolutePath, relativePath, directory } = buildUploadPath('.png', {
      prefix: '../logos',
      now,
      randomSuffix: 'abcdef'
    });

    expect(relativePath).toBe('/media/uploads/logos/2024/05/1715774400000-abcdef.png');
    expect(absolutePath.endsWith('public/media/uploads/logos/2024/05/1715774400000-abcdef.png')).toBe(true);
    expect(directory.endsWith('public/media/uploads/logos/2024/05')).toBe(true);
  });
});

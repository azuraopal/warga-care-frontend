export function formatImageUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '';
  }
  const cleanUrl = url.trim();

  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('blob:') ||
    cleanUrl.startsWith('data:')
  ) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith('/uploads')) {
    return cleanUrl;
  }
  if (!cleanUrl.startsWith('/')) {
    return `/uploads/${cleanUrl}`;
  }

  return cleanUrl;
}

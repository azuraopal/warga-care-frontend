export function getFileBaseUrl() {
  if (import.meta.env.VITE_FILE_BASE_URL) {
    return import.meta.env.VITE_FILE_BASE_URL.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.trim().replace(/\/+$/, '');
  }
  const apiUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  if (/^https?:\/\//i.test(apiUrl)) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return '';
    }
  }
  return '';
}

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

  const fileBase = getFileBaseUrl();
  const relativePath = cleanUrl.startsWith('/uploads')
    ? cleanUrl
    : cleanUrl.startsWith('/')
      ? `/uploads${cleanUrl}`
      : `/uploads/${cleanUrl}`;

  return fileBase ? `${fileBase}${relativePath}` : relativePath;
}

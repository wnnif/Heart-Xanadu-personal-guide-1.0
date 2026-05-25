import { getContent } from './content.service.js';

const SEAYA_WEB = 'https://api.seaya.link/web.php?type=file';
const SEAYA_WAP = 'https://api.seaya.link/wap.php?type=file';

export function pickWallpaperUrl(orientation = 'web') {
  const c = getContent({ includeAdmin: false });
  const isSeaya = c.wallpaperMode === 'seaya-anime' || (c.wallpaperMode === 'api-random' && (c.wallpaperApiProvider || '') === 'seaya-anime');
  if (isSeaya) return orientation === 'wap' ? SEAYA_WAP : SEAYA_WEB;
  if (c.wallpaperMode === 'gradient') return '';

  if (c.wallpaperMode === 'fixed') return c.wallpaperFixed || c.wallpaperApi || c.wallpapers?.[0] || SEAYA_WEB;

  let url = c.wallpaperApi || c.wallpaperDailyApi || c.wallpapers?.[0] || SEAYA_WEB;
  if (c.wallpaperMode === 'api-random') {
    const apis = (c.wallpaperApis || []).filter(Boolean);
    url = apis.length ? apis[Math.floor(Math.random() * apis.length)] : url;
    url += (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  }
  if (c.wallpaperMode === 'list' || c.wallpaperMode === 'upload') {
    return c.wallpaperFixed || c.wallpaperApi || c.wallpapers?.[0] || SEAYA_WEB;
  }
  return url;
}

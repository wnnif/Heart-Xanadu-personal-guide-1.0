import { getContent } from './content.service.js';
export function pickWallpaperUrl() {
  const c = getContent({ includeAdmin: false });
  let url = c.wallpaperApi || c.wallpaperDailyApi || c.wallpapers?.[0] || 'https://api.dujin.org/bing/1920.php';
  if (c.wallpaperMode === 'daily') url = c.wallpaperDailyApi || url;
  if (c.wallpaperMode === 'api-random') {
    const apis = (c.wallpaperApis || []).filter(Boolean);
    url = apis.length ? apis[Math.floor(Math.random() * apis.length)] : url;
    url += (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  }
  if (c.wallpaperMode === 'list' || c.wallpaperMode === 'upload') {
    const list = (c.wallpapers || []).filter(Boolean);
    url = list.length ? list[Math.floor(Math.random() * list.length)] : url;
  }
  return url;
}

import { getContent } from './content.service.js';
import { getVisitorIp } from '../utils/ip.js';
function weatherCodeZh(code, fallback = '') {
  const map = {113:'晴',116:'局部多云',119:'多云',122:'阴',143:'雾',176:'局部小雨',179:'局部小雪',182:'雨夹雪',185:'冻雨',200:'雷阵雨',227:'吹雪',230:'暴风雪',248:'雾',260:'冻雾',263:'局部小雨',266:'小雨',281:'冻毛毛雨',284:'大冻毛毛雨',293:'局部小雨',296:'小雨',299:'中雨',302:'大雨',305:'大雨',308:'暴雨',311:'冻雨',314:'大冻雨',317:'雨夹雪',320:'小雪',323:'局部小雪',326:'小雪',329:'中雪',332:'大雪',335:'大雪',338:'暴雪',350:'冰粒',353:'小阵雨',356:'中阵雨',359:'强阵雨',362:'雨夹雪阵雨',365:'雨夹雪阵雨',368:'小雪阵雪',371:'大雪阵雪',374:'冰粒阵雨',377:'冰粒阵雨',386:'局部雷雨',389:'雷雨',392:'雷雪',395:'大雪伴雷'};
  return map[parseInt(code)] || fallback || '未知天气';
}
export async function loadWeather(req) {
  const c = getContent({ includeAdmin: false });
  const fallbackUrl = c.weather?.api || 'https://wttr.in/?format=j1&lang=zh';
  const mode = c.weather?.mode || 'visitor-ip';
  let url = fallbackUrl;
  let geoLabel = '';
  if (mode === 'visitor-ip') {
    const ip = getVisitorIp(req);
    if (ip) {
      try {
        const geoResp = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,lat,lon&lang=zh-CN`, { signal: AbortSignal.timeout(3500) });
        const geo = await geoResp.json();
        if (geo.status === 'success' && geo.lat && geo.lon) { url = `https://wttr.in/${geo.lat},${geo.lon}?format=j1&lang=zh`; geoLabel = [geo.regionName, geo.city].filter(Boolean).join(' '); }
      } catch {}
    }
  }
  const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
  const data = await resp.json();
  if (geoLabel) { data.nearest_area = [{ areaName: [{ value: geoLabel }] }]; data.locationLabel = geoLabel; }
  if (data?.current_condition?.[0]) {
    const cur = data.current_condition[0];
    const zh = weatherCodeZh(cur.weatherCode, cur.weatherDesc?.[0]?.value);
    cur.weatherDesc = [{ value: zh }]; cur.weatherDescZh = zh;
  }
  return data;
}

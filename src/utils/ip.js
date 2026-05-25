export function getVisitorIp(req) {
  const xff = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(xff) ? xff[0] : xff || req.headers['x-real-ip'] || req.ip || '')
    .split(',')[0].trim().replace(/^::ffff:/, '');
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return '';
  return ip;
}
export function parseUa(ua='') {
  const lower = ua.toLowerCase();
  const device = /mobile|android|iphone|ipad|phone/.test(lower) ? '手机/平板' : '电脑';
  let os = '未知';
  if (/windows/.test(lower)) os = 'Windows'; else if (/iphone|ipad|ios/.test(lower)) os = 'iOS'; else if (/android/.test(lower)) os = 'Android'; else if (/mac os|macintosh/.test(lower)) os = 'macOS'; else if (/linux/.test(lower)) os = 'Linux';
  let browser = '未知';
  if (/edg\//.test(lower)) browser = 'Edge'; else if (/chrome\//.test(lower) && !/chromium/.test(lower)) browser = 'Chrome'; else if (/safari\//.test(lower) && !/chrome/.test(lower)) browser = 'Safari'; else if (/firefox\//.test(lower)) browser = 'Firefox'; else if (/micromessenger/.test(lower)) browser = '微信'; else if (/telegram/.test(lower)) browser = 'Telegram';
  return { device, os, browser };
}

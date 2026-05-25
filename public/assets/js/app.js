const ICONS = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.98c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9v2.83c0 .27.18.58.69.48A10.12 10.12 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  qq: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2.8 0-5 2.5-5 6.2 0 1.7.4 3.2 1.1 4.4-.7.8-1.5 2.2-1.8 3.7-.1.6.2 1 .8.9.5-.1 1.1-.5 1.7-.9.8.9 1.9 1.5 3.2 1.5s2.4-.6 3.2-1.5c.6.4 1.2.8 1.7.9.6.1.9-.3.8-.9-.3-1.5-1.1-2.9-1.8-3.7.7-1.2 1.1-2.7 1.1-4.4C17 4.5 14.8 2 12 2Zm-2 7.5c-.6 0-1-.6-1-1.3s.4-1.3 1-1.3 1 .6 1 1.3-.4 1.3-1 1.3Zm4 0c-.6 0-1-.6-1-1.3s.4-1.3 1-1.3 1 .6 1 1.3-.4 1.3-1 1.3ZM7.5 18.6C8.5 20.1 10 21 12 21s3.5-.9 4.5-2.4c-.9.5-2.5 1-4.5 1s-3.6-.5-4.5-1Z"/></svg>',
  wechat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4C5.9 4 3 6.4 3 9.4c0 1.7.9 3.2 2.4 4.2L4.8 16l2.5-1.3c.7.2 1.4.3 2.2.3.2 0 .4 0 .6-.02A5.2 5.2 0 0 1 10 13.8c0-2.9 2.7-5.2 6.1-5.2h.3C15.9 6 13 4 9.5 4Zm-2.2 4.7a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm4.4 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6ZM16.1 10c-2.8 0-5.1 1.9-5.1 4.3s2.3 4.3 5.1 4.3c.6 0 1.2-.1 1.8-.3L20 19.4l-.5-2c1.1-.8 1.8-1.9 1.8-3.2 0-2.3-2.3-4.2-5.2-4.2Zm-1.7 3.4a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm3.5 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 3 2.8 10.4c-1.1.4-1.1 1.1-.2 1.4l4.9 1.5L19 6.1c.5-.3 1-.1.6.3l-9.3 8.4-.4 5c.6 0 .9-.3 1.2-.6l2.9-2.8 4.8 3.5c.9.5 1.5.3 1.7-.8L23 4.2c.3-1.2-.4-1.7-1-1.2Z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
};

let content = null;
let wpIndex = 0;

async function init() {
  try {
    const res = await fetch('/api/content');
    content = await res.json();
  } catch(e) { return; }

  document.title = content.siteTitle || content.profile?.name || '个人导航';

  // Profile
  document.getElementById('avatar').src = content.profile.avatar;
  document.getElementById('profile-name').textContent = content.profile.name;
  document.getElementById('profile-bio').textContent = content.profile.bio;
  document.querySelector('#profile-location span').textContent = content.profile.location;

  // Contacts
  const contactsEl = document.getElementById('contacts');
  contactsEl.innerHTML = content.contacts.map(c => `
    <a class="contact-item" href="${c.url}" target="_blank" rel="noopener">
      <span class="contact-icon" style="color:${c.color}">${ICONS[(c.icon||'').toLowerCase()] || ICONS.link}</span>
      ${c.name}
    </a>
  `).join('');

  // Sites
  const sitesEl = document.getElementById('sites');
  sitesEl.innerHTML = content.sites.map(s => `
    <a class="site-card" href="${s.url}" target="_blank" rel="noopener">
      <div class="site-icon" style="background:${s.color}22;color:${s.color}">
        ${ICONS[(s.icon||'').toLowerCase()] || ICONS.link}
      </div>
      <div class="site-info">
        <div class="site-name">${s.name}</div>
        <div class="site-desc">${s.desc}</div>
        <div class="site-url">${s.url}</div>
      </div>
    </a>
  `).join('');

  // Footer
  const footer = document.getElementById('footer');
  let footerHtml = content.footer.copyright || '';
  if (content.footer.icp) footerHtml += ' | ' + content.footer.icp;
  footer.innerHTML = footerHtml;

  // Wallpaper
  if (isGradientWallpaper()) setGradientBackground();
  else setWallpaper(getWallpaperUrl(true), { eager: isSeayaWallpaper() || (content?.wallpaperMode === 'api-random') });

  // Weather
  loadWeather();

  // Stats
  loadStats();

  // Running days
  if (content.profile.startDate) {
    const days = Math.floor((Date.now() - new Date(content.profile.startDate).getTime()) / 86400000);
    document.getElementById('running-days').textContent = `🚀 已运行 ${days} 天`;
  }
}

function getScreenOrientation() {
  return window.matchMedia('(max-width: 768px) and (orientation: portrait)').matches ? 'wap' : 'web';
}

function isGradientWallpaper() {
  return content?.wallpaperMode === 'gradient';
}

function isSeayaWallpaper() {
  return content?.wallpaperMode === 'seaya-anime' || (content?.wallpaperMode === 'api-random' && (content?.wallpaperApiProvider || '') === 'seaya-anime');
}

function getSeayaUrl() {
  return getScreenOrientation() === 'wap'
    ? `https://api.seaya.link/wap.php?type=file&_t=${Date.now()}`
    : `https://api.seaya.link/web.php?type=file&_t=${Date.now()}`;
}

function applyWallpaperLayout() {
  const bg = document.getElementById('bg');
  const portrait = getScreenOrientation() === 'wap';
  bg.classList.toggle('bg-portrait', portrait);
  bg.classList.toggle('bg-landscape', !portrait);
}

function setGradientBackground() {
  const bg = document.getElementById('bg');
  applyWallpaperLayout();
  bg.classList.remove('bg-gradient-light', 'bg-gradient-dark');
  bg.classList.add((content?.gradientTheme || 'dark') === 'light' ? 'bg-gradient-light' : 'bg-gradient-dark');
  bg.style.backgroundImage = '';
}

function getWallpaperUrl(first=false) {
  const mode = content?.wallpaperMode || 'gradient';
  if (isSeayaWallpaper()) return getSeayaUrl();
  if (mode === 'api-random') return '/api/wallpaper';
  if (mode === 'fixed' || mode === 'list' || mode === 'upload') return content?.wallpaperFixed || content?.wallpaperApi || (content?.wallpapers || []).filter(Boolean)[0] || '/api/wallpaper';
  return content?.wallpaperApi || '/api/wallpaper';
}

function setWallpaper(url, options = {}) {
  const bg = document.getElementById('bg');
  applyWallpaperLayout();
  if (!url) return;
  const img = new Image();
  if (options.eager) {
    bg.style.backgroundImage = `url(${url})`;
  }
  img.onload = () => {
    bg.style.backgroundImage = `url(${url})`;
    applyWallpaperLayout();
  };
  img.onerror = () => {
    if (!bg.style.backgroundImage || bg.style.backgroundImage.includes('gradient')) {
      bg.style.backgroundImage = 'linear-gradient(135deg,#172554,#111827)';
    }
  };
  img.src = url;
}

function switchWallpaper() {
  if (!content) return;
  if (isGradientWallpaper()) return setGradientBackground();
  setWallpaper(getWallpaperUrl(false), { eager: isSeayaWallpaper() || (content?.wallpaperMode === 'api-random') });
}

let lastOrientation = getScreenOrientation();
window.addEventListener('resize', () => {
  if (!content) return;
  const next = getScreenOrientation();
  if (next === lastOrientation) {
    applyWallpaperLayout();
    return;
  }
  lastOrientation = next;
  if (isSeayaWallpaper()) setWallpaper(getWallpaperUrl(false), { eager: true });
  else if (isGradientWallpaper()) setGradientBackground();
  else applyWallpaperLayout();
});

async function loadWeather() {
  try {
    const res = await fetch('/api/weather');
    const data = await res.json();
    if (data.current_condition) {
      const cur = data.current_condition[0];
      const area = data.nearest_area?.[0]?.areaName?.[0]?.value || '';
      const emoji = getWeatherEmoji(cur.weatherCode);
      document.getElementById('weather-text').textContent = `${area} ${cur.temp_C}°C ${cur.weatherDesc[0].value}`;
      document.querySelector('.weather-icon').textContent = emoji;
    }
  } catch(e) {
    document.getElementById('weather-text').textContent = '天气加载失败';
  }
}

function getWeatherEmoji(code) {
  code = parseInt(code);
  if (code === 113) return '☀️';
  if (code === 116) return '⛅';
  if ([119,122].includes(code)) return '☁️';
  if ([176,263,266,293,296,299,302,305,308,311,314,317,353,356,359].includes(code)) return '🌧️';
  if ([200,386,389,392,395].includes(code)) return '⛈️';
  if ([227,230,320,323,326,329,332,335,338,350,362,365,368,371,374,377].includes(code)) return '❄️';
  return '🌤️';
}

async function loadStats() {
  try {
    await fetch('/api/visit', { method: 'POST' });
    const res = await fetch('/api/stats');
    const stats = await res.json();
    document.getElementById('stats').textContent = `访客 ${stats.todayVisitors || 0} | 今日浏览 ${stats.todayPv || stats.today || 0} | 总浏览 ${stats.total}`;
  } catch(e) {}
}

// Clock
function updateTime() {
  const now = new Date();
  document.getElementById('time').textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  document.getElementById('date').textContent = now.toLocaleDateString('zh-CN', opts);
}
updateTime();
setInterval(updateTime, 1000);

init();

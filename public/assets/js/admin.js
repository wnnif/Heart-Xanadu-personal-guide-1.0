let content = null;

function showPwd(id, show) {
  const el = document.getElementById(id);
  if (!el || el.dataset.locked === '1') return;
  el.type = show ? 'text' : 'password';
}
function togglePwd(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  const locked = el.dataset.locked === '1';
  if (locked) {
    el.dataset.locked = '0';
    el.type = 'password';
    btn.textContent = '👁';
  } else {
    el.dataset.locked = '1';
    el.type = 'text';
    btn.textContent = '🙈';
  }
}

async function doLogin() {
  const pwd = document.getElementById('pwd').value;
  const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({password:pwd}) });
  const d = await res.json();
  if (d.ok) { loadAdmin(); }
  else { showMsg('login-msg','密码错误','err'); }
}

async function doLogout() {
  await fetch('/api/admin/logout', {method:'POST'});
  location.reload();
}

async function loadAdmin() {
  const res = await fetch('/api/admin/content');
  if (!res.ok) return;
  content = await res.json();
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('admin-page').style.display = 'block';

  // Fill profile
  const siteTitle = content.siteTitle || '个人导航';
  document.title = '后台管理 - ' + siteTitle;
  const titlePill = document.getElementById('admin-title-pill');
  if (titlePill) titlePill.textContent = siteTitle;
  document.getElementById('f-site-title').value = content.siteTitle || '';
  document.getElementById('f-name').value = content.profile.name;
  document.getElementById('f-location').value = content.profile.location;
  document.getElementById('f-avatar').value = content.profile.avatar;
  document.getElementById('f-bio').value = content.profile.bio;
  document.getElementById('f-startDate').value = content.profile.startDate;

  // Wallpaper
  let wallpaperMode = content.wallpaperMode || 'gradient';
  if (wallpaperMode === 'list' || wallpaperMode === 'upload') wallpaperMode = 'fixed';
  if (wallpaperMode === 'api-random' && content.wallpaperApiProvider === 'seaya-anime') wallpaperMode = 'seaya-anime';
  document.getElementById('f-wallpaper-mode').value = wallpaperMode;
  document.getElementById('f-gradient-theme').value = content.gradientTheme || 'dark';
  document.getElementById('f-wallpaper-apis').value = (content.wallpaperApis || []).join('\n');

  // Weather
  document.getElementById('f-weather-mode').value = content.weather?.mode || 'visitor-ip';
  document.getElementById('f-weather-api').value = content.weather?.api || '';

  // Footer
  document.getElementById('f-copyright').value = content.footer?.copyright || '';
  document.getElementById('f-icp').value = content.footer?.icp || '';

  // Contacts
  renderContacts();
  // Sites
  renderSites();
  // Wallpapers
  renderWps();
  updateWallpaperUi();
  // Stats
  loadAdminStats();
}

function renderContacts() {
  const el = document.getElementById('contacts-list');
  el.innerHTML = content.contacts.map((c,i) => `
    <div class="item-row">
      <input value="${esc(c.name)}" placeholder="名称" onchange="content.contacts[${i}].name=this.value">
      <input value="${esc(c.icon)}" placeholder="图标，如 qq/wechat" onchange="content.contacts[${i}].icon=this.value.toLowerCase()" style="max-width:130px">
      <input value="${esc(c.url)}" placeholder="链接" onchange="content.contacts[${i}].url=this.value">
      <input value="${esc(c.color)}" placeholder="颜色" onchange="content.contacts[${i}].color=this.value" style="max-width:80px">
      <button class="btn btn-sm btn-danger" onclick="content.contacts.splice(${i},1);renderContacts()">✕</button>
    </div>
  `).join('');
}

function addContact() {
  content.contacts.push({name:'',icon:'link',url:'',color:'#666'});
  renderContacts();
}

function renderSites() {
  const el = document.getElementById('sites-list');
  el.innerHTML = content.sites.map((s,i) => `
    <div class="item-row" style="flex-wrap:wrap">
      <input value="${esc(s.name)}" placeholder="名称" onchange="content.sites[${i}].name=this.value" style="flex:1;min-width:100px">
      <input value="${esc(s.desc)}" placeholder="描述" onchange="content.sites[${i}].desc=this.value" style="flex:2;min-width:150px">
      <input value="${esc(s.url)}" placeholder="URL" onchange="content.sites[${i}].url=this.value" style="flex:2;min-width:150px">
      <input value="${esc(s.icon)}" placeholder="图标" onchange="content.sites[${i}].icon=this.value.toLowerCase()" style="max-width:100px">
      <input value="${esc(s.color)}" placeholder="颜色" onchange="content.sites[${i}].color=this.value" style="max-width:80px">
      <button class="btn btn-sm btn-danger" onclick="content.sites.splice(${i},1);renderSites()">✕</button>
    </div>
  `).join('');
}

function addSite() {
  content.sites.push({name:'',desc:'',url:'',icon:'globe',color:'#0066ff'});
  renderSites();
}

function updateWallpaperUi() {
  const mode = document.getElementById('f-wallpaper-mode')?.value || 'gradient';
  const gradientPanel = document.getElementById('wallpaper-gradient-panel');
  const apiPanel = document.getElementById('wallpaper-api-panel');
  const fixedPanel = document.getElementById('wallpaper-fixed-panel');
  if (gradientPanel) gradientPanel.style.display = mode === 'gradient' ? 'block' : 'none';
  if (apiPanel) apiPanel.style.display = mode === 'api-random' ? 'block' : 'none';
  if (fixedPanel) fixedPanel.style.display = mode === 'fixed' ? 'block' : 'none';
}

function renderWps() {
  const el = document.getElementById('wp-list');
  const selected = content.wallpaperFixed || content.wallpaperApi || '';
  el.innerHTML = (content.wallpapers||[]).map((w,i) => `
    <div class="item-row">
      <input type="radio" name="fixed-wallpaper" ${w === selected ? 'checked' : ''} onchange="content.wallpaperFixed=content.wallpapers[${i}]" style="width:auto;flex:0;margin:0">
      <input value="${esc(w)}" placeholder="图片 URL" onchange="content.wallpapers[${i}]=this.value;if(this.previousElementSibling.checked)content.wallpaperFixed=this.value">
      <button class="btn btn-sm btn-danger" onclick="content.wallpapers.splice(${i},1);if(content.wallpaperFixed==='${esc(w)}')content.wallpaperFixed='';renderWps()">✕</button>
    </div>
  `).join('');
}

function addWp() {
  if(!content.wallpapers) content.wallpapers=[];
  content.wallpapers.push('');
  document.getElementById('f-wallpaper-mode').value = 'fixed';
  updateWallpaperUi();
  renderWps();
}

async function loadAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const s = await res.json();
    document.getElementById('s-visitors').textContent = s.todayVisitors || 0;
    document.getElementById('s-today').textContent = s.todayPv || s.today || 0;
    document.getElementById('s-total').textContent = s.total;
    if(content.profile.startDate) {
      const days = Math.floor((Date.now()-new Date(content.profile.startDate).getTime())/86400000);
      document.getElementById('s-days').textContent = days;
    }
  } catch(e){}
}

async function saveAll() {
  // Gather profile fields
  content.siteTitle = document.getElementById('f-site-title').value || '个人导航';
  content.profile.name = document.getElementById('f-name').value;
  content.profile.location = document.getElementById('f-location').value;
  content.profile.avatar = document.getElementById('f-avatar').value;
  content.profile.bio = document.getElementById('f-bio').value;
  content.profile.startDate = document.getElementById('f-startDate').value;
  const selectedWallpaperMode = document.getElementById('f-wallpaper-mode').value;
  content.wallpaperMode = selectedWallpaperMode;
  content.gradientTheme = document.getElementById('f-gradient-theme').value || 'dark';
  content.wallpaperApiProvider = selectedWallpaperMode === 'seaya-anime' ? 'seaya-anime' : 'custom';
  content.wallpaperApis = document.getElementById('f-wallpaper-apis').value.split('\n').map(x=>x.trim()).filter(Boolean);
  content.wallpapers = (content.wallpapers || []).map(x=>String(x||'').trim()).filter(Boolean);
  if (selectedWallpaperMode === 'fixed') {
    content.wallpaperFixed = content.wallpaperFixed || content.wallpapers[0] || '';
    content.wallpaperApi = content.wallpaperFixed;
  } else {
    content.wallpaperApi = content.wallpaperApis[0] || '';
  }
  content.wallpaperDailyApi = content.wallpaperDailyApi || '';
  content.weather = { enabled: true, mode: document.getElementById('f-weather-mode').value, api: document.getElementById('f-weather-api').value };
  content.footer = { copyright: document.getElementById('f-copyright').value, icp: document.getElementById('f-icp').value };

  const res = await fetch('/api/admin/content', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(content) });
  const d = await res.json();
  if(d.ok) {
    showMsg('save-msg','✅ 保存成功，正在刷新页面','ok');
    setTimeout(()=>location.reload(), 800);
  }
  else showMsg('save-msg','保存失败: '+d.error,'err');
}

async function uploadWallpaper() {
  const input = document.getElementById('wallpaper-file');
  if(!input.files.length) return showMsg('save-msg','请选择图片','err');
  const fd = new FormData();
  fd.append('file', input.files[0]);
  const res = await fetch('/api/admin/upload', { method:'POST', body: fd });
  const d = await res.json();
  if(d.ok) {
    if(!content.wallpapers) content.wallpapers=[];
    content.wallpapers.push(d.url);
    content.wallpaperFixed = d.url;
    content.wallpaperMode = 'fixed';
    document.getElementById('f-wallpaper-mode').value = 'fixed';
    updateWallpaperUi();
    renderWps();
    showMsg('save-msg','✅ 上传成功，已选择为固定壁纸，记得点底部保存','ok');
  } else showMsg('save-msg','上传失败: '+d.error,'err');
}

async function changePwd() {
  const oldP = document.getElementById('f-oldpwd').value;
  const newP = document.getElementById('f-newpwd').value;
  const res = await fetch('/api/admin/password', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({oldPassword:oldP,newPassword:newP}) });
  const d = await res.json();
  if(d.ok) {
    showMsg('save-msg','✅ 密码已修改，请使用新密码重新登录','ok');
    setTimeout(async()=>{
      await fetch('/api/admin/logout', {method:'POST'});
      location.reload();
    }, 800);
  }
  else showMsg('save-msg','修改失败: '+d.error,'err');
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.style.display = 'block';
  el.textContent = text;
  el.className = 'msg msg-' + type;
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(()=>{
    el.style.display='none';
    el.className='msg';
  }, 3000);
}

function esc(s) { return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

// Try auto-login (if session cookie exists)
fetch('/api/admin/content').then(r => { if(r.ok) loadAdmin(); });

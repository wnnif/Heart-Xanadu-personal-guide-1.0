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

function moveArrayItem(arr, from, to) {
  if (!Array.isArray(arr) || from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
}

function dragAttrs(type, index) {
  return `draggable="true" ondragstart="handleDragStart(event,'${type}',${index})" ondragover="handleDragOver(event)" ondrop="handleDrop(event,'${type}',${index})" ondragend="handleDragEnd(event)"`;
}

function handleDragStart(event, type, index) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', JSON.stringify({ type, index }));
  event.currentTarget.classList.add('dragging');
}
function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}
function handleDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
}
function handleDrop(event, type, index) {
  event.preventDefault();
  let data;
  try { data = JSON.parse(event.dataTransfer.getData('text/plain') || '{}'); } catch { return; }
  if (data.type !== type) return;
  if (type === 'contacts') { moveArrayItem(content.contacts, data.index, index); normalizeContactSort(); renderContacts(); }
  if (type === 'categories') { moveArrayItem(content.siteCategories, data.index, index); normalizeCategorySort(); renderCategories(); renderSites(); }
  if (type === 'sites') { moveArrayItem(content.sites, data.index, index); normalizeSiteSort(); renderSites(); }
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
  document.getElementById('f-ui-template').value = content.uiTemplate || 'scheme-a';
  syncTemplateRadios();
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
  document.getElementById('f-github-label').value = content.footer?.githubLabel || 'GitHub';
  document.getElementById('f-github-url').value = content.footer?.githubUrl || '';

  // Contacts
  renderContacts();
  // Sites
  renderCategories();
  renderSites();
  // Wallpapers
  renderWps();
  updateWallpaperUi();
  // Stats
  loadAdminStats();
}

function normalizeContactSort() {
  content.contacts = (content.contacts || []).map((contact, i) => ({ ...contact, order: i }));
}

function moveContact(i, dir) {
  const next = i + dir;
  if (next < 0 || next >= content.contacts.length) return;
  moveArrayItem(content.contacts, i, next);
  normalizeContactSort();
  renderContacts();
}

function renderContacts() {
  if (!content.contacts) content.contacts = [];
  normalizeContactSort();
  const el = document.getElementById('contacts-list');
  el.innerHTML = content.contacts.map((c,i) => `
    <div class="item-row" ${dragAttrs('contacts', i)}>
      <span class="drag-handle" title="拖动排序">⋮⋮</span>
      <input value="${esc(c.name)}" placeholder="名称" onchange="content.contacts[${i}].name=this.value">
      <input value="${esc(c.icon)}" placeholder="图标，如 apple/qq/wechat" onchange="content.contacts[${i}].icon=this.value.toLowerCase()" style="max-width:150px">
      <input value="${esc(c.url)}" placeholder="链接" onchange="content.contacts[${i}].url=this.value">
      <input value="${esc(c.color)}" placeholder="颜色" onchange="content.contacts[${i}].color=this.value" style="max-width:80px">
      <div class="sort-actions">
        <button class="btn btn-sm" onclick="moveContact(${i},-1)" ${i===0?'disabled':''}>↑</button>
        <button class="btn btn-sm" onclick="moveContact(${i},1)" ${i===content.contacts.length-1?'disabled':''}>↓</button>
        <button class="btn btn-sm btn-danger" onclick="content.contacts.splice(${i},1);normalizeContactSort();renderContacts()">✕</button>
      </div>
    </div>
  `).join('');
}

function addContact() {
  content.contacts.push({name:'',icon:'link',url:'',color:'#666',order:content.contacts.length});
  renderContacts();
}

function normalizeSiteSort() {
  content.sites = (content.sites || []).map((site, i) => ({ ...site, order: i }));
}

function normalizeCategorySort() {
  content.siteCategories = (content.siteCategories || []).map((cat, i) => ({ ...cat, order: i }));
}

function moveSite(i, dir) {
  const next = i + dir;
  if (next < 0 || next >= content.sites.length) return;
  [content.sites[i], content.sites[next]] = [content.sites[next], content.sites[i]];
  normalizeSiteSort();
  renderSites();
}

function moveCategory(i, dir) {
  const next = i + dir;
  if (next < 0 || next >= content.siteCategories.length) return;
  [content.siteCategories[i], content.siteCategories[next]] = [content.siteCategories[next], content.siteCategories[i]];
  normalizeCategorySort();
  renderCategories();
  renderSites();
}

function categoryOptions(selected = '') {
  const cats = content.siteCategories || [];
  return `<option value="">不分类</option>` + cats.map(c => `<option value="${esc(c.id)}" ${selected === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
}

function renderCategories() {
  if (!content.siteCategories) content.siteCategories = [];
  normalizeCategorySort();
  const el = document.getElementById('site-categories-list');
  if (!el) return;
  el.innerHTML = content.siteCategories.map((c,i) => `
    <div class="item-row sort-row" ${dragAttrs('categories', i)}>
      <span class="drag-handle" title="拖动排序">⋮⋮</span>
      <input value="${esc(c.name)}" placeholder="分类名称，如 AI工具 / 常用服务" onchange="content.siteCategories[${i}].name=this.value;renderSites()">
      <div class="sort-actions">
        <button class="btn btn-sm" onclick="moveCategory(${i},-1)" ${i===0?'disabled':''}>↑</button>
        <button class="btn btn-sm" onclick="moveCategory(${i},1)" ${i===content.siteCategories.length-1?'disabled':''}>↓</button>
        <button class="btn btn-sm btn-danger" onclick="removeSiteCategory(${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function addSiteCategory() {
  if (!content.siteCategories) content.siteCategories = [];
  content.siteCategories.push({ id: 'cat-' + Date.now(), name: '', order: content.siteCategories.length });
  renderCategories();
  renderSites();
}

function removeSiteCategory(i) {
  const cat = content.siteCategories[i];
  if (cat) (content.sites || []).forEach(s => { if (s.category === cat.id) s.category = ''; });
  content.siteCategories.splice(i, 1);
  normalizeCategorySort();
  renderCategories();
  renderSites();
}

function renderSites() {
  if (!content.sites) content.sites = [];
  if (!content.siteCategories) content.siteCategories = [];
  normalizeSiteSort();
  const el = document.getElementById('sites-list');
  el.innerHTML = content.sites.map((s,i) => `
    <div class="item-row site-edit-row" style="flex-wrap:wrap" ${dragAttrs('sites', i)}>
      <span class="drag-handle" title="拖动排序">⋮⋮</span>
      <input value="${esc(s.name)}" placeholder="名称" onchange="content.sites[${i}].name=this.value" style="flex:1;min-width:100px">
      <input value="${esc(s.desc)}" placeholder="描述" onchange="content.sites[${i}].desc=this.value" style="flex:2;min-width:150px">
      <input value="${esc(s.url)}" placeholder="URL" onchange="content.sites[${i}].url=this.value" style="flex:2;min-width:150px">
      <input value="${esc(s.icon)}" placeholder="图标" onchange="content.sites[${i}].icon=this.value.toLowerCase()" style="max-width:100px">
      <input value="${esc(s.color)}" placeholder="颜色" onchange="content.sites[${i}].color=this.value" style="max-width:80px">
      <select onchange="content.sites[${i}].category=this.value" style="max-width:150px;margin-bottom:0">${categoryOptions(s.category || '')}</select>
      <div class="sort-actions">
        <button class="btn btn-sm" onclick="moveSite(${i},-1)" ${i===0?'disabled':''}>↑</button>
        <button class="btn btn-sm" onclick="moveSite(${i},1)" ${i===content.sites.length-1?'disabled':''}>↓</button>
        <button class="btn btn-sm btn-danger" onclick="content.sites.splice(${i},1);normalizeSiteSort();renderSites()">✕</button>
      </div>
    </div>
  `).join('');
}

function addSite() {
  content.sites.push({name:'',desc:'',url:'',icon:'globe',color:'#0066ff',category:'',order:content.sites.length});
  renderSites();
}

function syncTemplateRadios() {
  const value = document.getElementById('f-ui-template')?.value || 'scheme-a';
  const a = document.getElementById('tpl-a');
  const b = document.getElementById('tpl-b');
  if (a) a.checked = value === 'scheme-a';
  if (b) b.checked = value === 'scheme-b';
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
  content.uiTemplate = document.getElementById('f-ui-template')?.value || 'scheme-a';
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
  content.footer = {
    copyright: document.getElementById('f-copyright').value,
    icp: document.getElementById('f-icp').value,
    githubLabel: document.getElementById('f-github-label').value || 'GitHub',
    githubUrl: document.getElementById('f-github-url').value
  };
  normalizeContactSort();
  normalizeCategorySort();
  normalizeSiteSort();
  content.siteCategories = (content.siteCategories || []).map(c => ({ id: c.id, name: String(c.name || '').trim(), order: c.order })).filter(c => c.name);
  const validCategoryIds = new Set(content.siteCategories.map(c => c.id));
  content.sites = (content.sites || []).map(s => ({ ...s, category: validCategoryIds.has(s.category) ? s.category : '' }));

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

async function uploadAvatar() {
  const input = document.getElementById('avatar-file');
  if(!input.files.length) return showMsg('save-msg','请选择头像图片','err');
  const fd = new FormData();
  fd.append('file', input.files[0]);
  const res = await fetch('/api/admin/upload', { method:'POST', body: fd });
  const d = await res.json();
  if(d.ok) {
    content.profile.avatar = d.url;
    document.getElementById('f-avatar').value = d.url;
    showMsg('save-msg','✅ 头像上传成功，记得点底部保存','ok');
  } else showMsg('save-msg','头像上传失败: '+d.error,'err');
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



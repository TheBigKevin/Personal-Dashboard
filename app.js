const $=id=>document.getElementById(id);
const KEY='orbit-dashboard-v1';
const defaults={categories:[{id:'favorites',name:'Favorites',icon:'✦'},{id:'work',name:'Work',icon:'▣'},{id:'engineering',name:'Engineering',icon:'⌘'},{id:'gaming',name:'Gaming',icon:'◈'},{id:'media',name:'Media',icon:'▶'},{id:'tools',name:'Tools',icon:'⚙'}],active:'favorites',tiles:[
{id:'t1',name:'Google',url:'https://google.com',category:'favorites',icon:'G',description:'Search the web'},
{id:'t2',name:'YouTube',url:'https://youtube.com',category:'favorites',icon:'▶',description:'Videos and channels'},
{id:'t3',name:'GitHub',url:'https://github.com',category:'engineering',icon:'⌘',description:'Code and projects'},
{id:'t4',name:'ChatGPT',url:'https://chatgpt.com',category:'tools',icon:'✳',description:'AI workspace'},
{id:'t5',name:'Apple',url:'https://apple.com',category:'work',icon:'●',description:'Devices and services'},
{id:'t6',name:'Steam',url:'https://store.steampowered.com',category:'gaming',icon:'◉',description:'Game library'},
{id:'t7',name:'Reddit',url:'https://reddit.com',category:'media',icon:'◉',description:'Communities'},
{id:'t8',name:'Wikipedia',url:'https://wikipedia.org',category:'tools',icon:'W',description:'Reference library'}
],background:'',accent:'#79a9ff',notes:'',layout:'grid'};
let state=load(),editMode=false,dragged=null,supabaseClient=null;
function load(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));$('syncStatus').textContent=supabaseClient?'CLOUD SYNC CONNECTED':'LOCAL MODE · SAVED ON THIS DEVICE';if(supabaseClient)pushCloud();}
function uid(){return 'x'+Math.random().toString(36).slice(2,10)}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function domain(url){try{return new URL(url).hostname.replace(/^www\./,'')}catch{return url}}
function render(){
 document.documentElement.style.setProperty('--accent',state.accent||'#79a9ff');
 const bg=document.querySelector('.backdrop');; if(state.background){bg.style.backgroundImage=`linear-gradient(rgba(5,10,19,.55),rgba(5,10,19,.72)),url("${state.background.replace(/"/g,'')}")`;bg.classList.add('image')}else{bg.style.backgroundImage='';bg.classList.remove('image')}
 $('categoryNav').innerHTML=state.categories.map(c=>`<button class="nav-item ${state.active===c.id?'active':''}" data-cat="${esc(c.id)}"><span>${esc(c.icon)}</span>${esc(c.name)}</button>`).join('');
 $('categoryStrip').innerHTML=state.categories.map(c=>`<button class="category-pill ${state.active===c.id?'active':''}" data-cat="${esc(c.id)}">${esc(c.icon)} &nbsp;${esc(c.name)}</button>`).join('');
 const cat=state.categories.find(c=>c.id===state.active)||state.categories[0];$('sectionTitle').textContent=cat?.name||'Shortcuts';
 const query=$('search').value.trim().toLowerCase();
 const tiles=state.tiles.filter(t=>(t.category===state.active||query)&&(!query||`${t.name} ${t.description||''} ${t.url}`.toLowerCase().includes(query)));
 $('tileCount').textContent=`${tiles.length} SHORTCUT${tiles.length===1?'':'S'}`;
 $('tileGrid').classList.toggle('editing',editMode);
 $('tileGrid').innerHTML=tiles.map(t=>`<article class="tile glass" draggable="${editMode}" data-id="${esc(t.id)}"><button class="tile-edit" data-edit="${esc(t.id)}" title="Edit shortcut">✎</button><a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" class="tile-link" aria-label="Open ${esc(t.name)}"><div class="tile-top"><div class="tile-icon">${esc(t.icon||'↗')}</div><span class="tile-domain">${esc(domain(t.url))}</span></div><div><div class="tile-name">${esc(t.name)}</div><div class="tile-desc">${esc(t.description||'Open website')}</div></div></a></article>`).join('');
 document.querySelectorAll('.tile-link').forEach(a=>{a.style.cssText='position:absolute;inset:0;padding:17px 15px 14px;display:flex;flex-direction:column;justify-content:space-between;text-decoration:none;color:inherit'});
 $('emptyState').hidden=tiles.length>0;$('tileGrid').hidden=tiles.length===0;
 $('notes').value=state.notes||'';
}
function openTile(id){const t=state.tiles.find(x=>x.id===id);if(!t)return;$('modalTitle').textContent='Edit shortcut';$('tileId').value=t.id;$('tileName').value=t.name;$('tileUrl').value=t.url;$('tileCategory').value=t.category;$('tileIcon').value=t.icon||'';$('tileDescription').value=t.description||'';$('deleteTile').hidden=false;$('modalBackdrop').hidden=false}
function newTile(){$('modalTitle').textContent='Add shortcut';$('tileForm').reset();$('tileId').value='';$('deleteTile').hidden=true;$('tileCategory').innerHTML=state.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');$('tileCategory').value=state.active;$('modalBackdrop').hidden=false;$('tileName').focus()}
function refreshCategorySelect(){$('tileCategory').innerHTML=state.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
function tick(){const d=new Date();$('clock').textContent=d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});$('widgetTime').textContent=d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});$('dateLine').textContent=d.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'}).toUpperCase();$('widgetDate').textContent=d.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric',year:'numeric'});$('pageTitle').textContent=(d.getHours()<12?'Good morning.':d.getHours()<18?'Good afternoon.':'Good evening.')}
function toggleEdit(){editMode=!editMode;$('editModeBtn').classList.toggle('active',editMode);render();toast(editMode?'Edit mode enabled · drag to reorder':'Edit mode off')}
$('categoryNav').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(b){state.active=b.dataset.cat;$('search').value='';save();render()}});
$('categoryStrip').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(b){state.active=b.dataset.cat;$('search').value='';save();render()}});
$('tileGrid').addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b){e.preventDefault();openTile(b.dataset.edit)}});
$('tileGrid').addEventListener('dragstart',e=>{const el=e.target.closest('.tile');if(!el||!editMode)return;dragged=el.dataset.id;e.dataTransfer.effectAllowed='move'});
$('tileGrid').addEventListener('dragover',e=>{if(editMode)e.preventDefault()});
$('tileGrid').addEventListener('drop',e=>{e.preventDefault();const target=e.target.closest('.tile');if(!dragged||!target||target.dataset.id===dragged)return;const a=state.tiles.findIndex(t=>t.id===dragged),b=state.tiles.findIndex(t=>t.id===target.dataset.id);const [item]=state.tiles.splice(a,1);state.tiles.splice(b,0,item);dragged=null;save();render()});
$('addTile').onclick=newTile;$('emptyAdd').onclick=newTile;$('closeModal').onclick=$('cancelModal').onclick=()=>$('modalBackdrop').hidden=true;
$('tileForm').onsubmit=e=>{e.preventDefault();const id=$('tileId').value;const obj={id:id||uid(),name:$('tileName').value.trim(),url:$('tileUrl').value.trim(),category:$('tileCategory').value,icon:$('tileIcon').value.trim()||'↗',description:$('tileDescription').value.trim()};if(id)state.tiles=state.tiles.map(t=>t.id===id?obj:t);else state.tiles.push(obj);state.active=obj.category;$('modalBackdrop').hidden=true;save();render();toast('Shortcut saved')};
$('deleteTile').onclick=()=>{const id=$('tileId').value;state.tiles=state.tiles.filter(t=>t.id!==id);$('modalBackdrop').hidden=true;save();render();toast('Shortcut deleted')};
$('search').oninput=render;$('editModeBtn').onclick=toggleEdit;$('themeBtn').onclick=$('appearanceBtn').onclick=()=>{$('settingsBackdrop').hidden=false};
$('settingsBtn').onclick=()=>{$('settingsBackdrop').hidden=false;fillSettings()};
$('closeSettings').onclick=()=>$('settingsBackdrop').hidden=true;
function fillSettings(){$('backgroundUrl').value=state.background||'';$('accentColor').value=state.accent||'#79a9ff';$('supabaseUrl').value=localStorage.getItem('orbit-supa-url')||'';$('supabaseKey').value=localStorage.getItem('orbit-supa-key')||''}
$('backgroundUrl').onchange=e=>{state.background=e.target.value.trim();save();render()};
$('accentColor').oninput=e=>{state.accent=e.target.value;save();render()};
$('notes').oninput=e=>{state.notes=e.target.value;save()};
$('addCategory').onclick=()=>{const name=prompt('Name this category:');if(!name?.trim())return;const c={id:uid(),name:name.trim(),icon:'✦'};state.categories.push(c);state.active=c.id;save();render();toast('Category added')};
$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='orbit-dashboard-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!Array.isArray(x.tiles)||!Array.isArray(x.categories))throw Error();state={...structuredClone(defaults),...x};save();render();fillSettings();toast('Backup restored')}catch{toast('That backup file is not valid')}e.target.value=''};
$('search').addEventListener('keydown',e=>{if(e.key==='Escape'){$('search').value='';render()}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('search').focus()}if(e.key==='Escape'){$('modalBackdrop').hidden=true;$('settingsBackdrop').hidden=true}});
async function connectCloud(){const url=$('supabaseUrl').value.trim(),key=$('supabaseKey').value.trim();if(!url||!key){toast('Enter both Supabase values');return}if(!window.supabase){toast('Could not load Supabase library');return}localStorage.setItem('orbit-supa-url',url);localStorage.setItem('orbit-supa-key',key);supabaseClient=window.supabase.createClient(url,key);$('syncHelp').textContent='Connecting…';try{const {data,error}=await supabaseClient.from('dashboard_state').select('state').eq('id','main').maybeSingle();if(error)throw error;if(data?.state){state={...structuredClone(defaults),...data.state,notes:state.notes||''};localStorage.setItem(KEY,JSON.stringify(state));render()}else{await pushCloud()}$('syncHelp').textContent='Connected. This dashboard now shares one configuration across devices.';$('syncStatus').textContent='CLOUD SYNC CONNECTED';toast('Cloud sync connected')}catch(err){$('syncHelp').textContent='Connection failed: '+err.message;supabaseClient=null}}
async function pushCloud(){if(!supabaseClient)return;const sharedState={...state,notes:''};const {error}=await supabaseClient.from('dashboard_state').upsert({id:'main',state:sharedState,updated_at:new Date().toISOString()});if(error){$('syncStatus').textContent='CLOUD SYNC ERROR';console.warn(error)}}
$('connectSync').onclick=connectCloud;
$('disconnectSync').onclick=()=>{supabaseClient=null;localStorage.removeItem('orbit-supa-url');localStorage.removeItem('orbit-supa-key');$('syncHelp').textContent='Disconnected. Local storage is active.';$('syncStatus').textContent='LOCAL MODE · SAVED ON THIS DEVICE';toast('Cloud sync disconnected')};
async function initCloud(){const u=localStorage.getItem('orbit-supa-url'),k=localStorage.getItem('orbit-supa-key');if(u&&k&&window.supabase){supabaseClient=window.supabase.createClient(u,k);try{const {data,error}=await supabaseClient.from('dashboard_state').select('state').eq('id','main').maybeSingle();if(!error&&data?.state){state={...structuredClone(defaults),...data.state,notes:state.notes||''};localStorage.setItem(KEY,JSON.stringify(state));render();$('syncStatus').textContent='CLOUD SYNC CONNECTED'}}catch(e){console.warn(e)}}}
$('dailyTip').textContent=['Make the useful things easy to reach.','A clear workspace makes room for good ideas.','Small improvements compound.','Build a space that works the way you think.'][new Date().getDate()%4];
refreshCategorySelect();render();tick();setInterval(tick,15000);initCloud();

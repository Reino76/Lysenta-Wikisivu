// App JS for full site
const loadJSON = async (url) => {
  try{
    const r = await fetch(url);
    if(!r.ok) return [];
    return await r.json();
  }catch(e){
    return [];
  }
};

const renderPins = (places) => {
  const mapWrap = document.querySelector('.map-wrap');
  if(!mapWrap) return;
  // remove old pins
  mapWrap.querySelectorAll('.pin').forEach(n=>n.remove());
  places.forEach(p=>{
    if(typeof p.x !== 'number' || typeof p.y !== 'number') return;
    const el = document.createElement('button');
    el.className = 'pin';
    el.title = p.name;
    el.style.left = (p.x*100) + '%';
    el.style.top = (p.y*100) + '%';
    el.innerText = p.icon || '•';
    el.addEventListener('click', ()=> {
      // open detail page if exists, otherwise show a quick popup
      if(p.url) location.href = p.url;
      else alert(p.name + "\n\n" + (p.short||''));
    });
    mapWrap.appendChild(el);
  });
};

const renderGallery = (items, containerSelector, opts={})=>{
  const container = document.querySelector(containerSelector);
  if(!container) return;
  container.innerHTML = '';
  const filter = opts.filter || 'all';
  items.forEach(it=>{
    if(filter !== 'all' && it.type !== filter) return;
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h3>${it.name}</h3><small class="muted">${it.category || it.type || ''}</small><p>${it.short||''}</p><div style="margin-top:8px"><a class="btn" href="${it.url||'#'}">Open</a></div>`;
    container.appendChild(card);
  });
};

// Sessions localStorage
const sessionsKey = 'dnd_sessions_v2';
const loadSessions = ()=> {
  const raw = localStorage.getItem(sessionsKey);
  if(!raw) return [];
  try{return JSON.parse(raw);}catch(e){return [];}
};
const saveSessions = (s)=> localStorage.setItem(sessionsKey, JSON.stringify(s));

const renderSessions = (containerSelector)=>{
  const container = document.querySelector(containerSelector);
  if(!container) return;
  const list = loadSessions();
  container.innerHTML = '';
  list.slice().reverse().forEach(s=>{
    const el = document.createElement('div');
    el.className = 'event';
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${s.title}</strong><small class="muted">${s.date||''}</small></div><div>${s.notes||''}</div>`;
    container.appendChild(el);
  });
};

// Init
document.addEventListener('DOMContentLoaded', async ()=>{
  // Load JSON data
  const [places, chars] = await Promise.all([loadJSON('/data/places.json'), loadJSON('/data/characters.json')]);

  // World page
  if(document.body.dataset.page === 'world'){
    renderPins(places);
    renderGallery(places, '.gallery', {});
  }

  if(document.body.dataset.page === 'characters'){
    renderGallery(chars, '.gallery', {});
    const sel = document.getElementById('char-filter');
    if(sel){
      sel.addEventListener('change', ()=> renderGallery(chars, '.gallery', {filter: sel.value}));
    }
  }

  if(document.body.dataset.page === 'sessions'){
    const form = document.getElementById('session-form');
    renderSessions('.timeline');
    if(form){
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const title = document.getElementById('s-title').value || 'Untitled';
        const date = document.getElementById('s-date').value;
        const notes = document.getElementById('s-notes').value;
        const arr = loadSessions();
        arr.push({title,date,notes});
        saveSessions(arr);
        renderSessions('.timeline');
        form.reset();
      });
    }
    const exp = document.getElementById('export-sessions');
    if(exp){
      exp.addEventListener('click', ()=>{
        const a = document.createElement('a');
        const data = JSON.stringify(loadSessions(), null, 2);
        const blob = new Blob([data], {type:'application/json'});
        a.href = URL.createObjectURL(blob);
        a.download = 'sessions-export.json';
        document.body.appendChild(a); a.click(); a.remove();
      });
    }
  }
});

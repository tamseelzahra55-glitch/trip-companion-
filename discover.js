/* Discover (v23) — Tinder-style deck of must-sees, new openings, parties, hidden gems and events on your dates.
   Swipe right (or ♥) to save, left (or ✕) to skip. Saved places for a city on your route also flow into that
   city's day plan; saved dated events land on the right evening. Loaded after getting.js, before app.js. */

const DK_KINDS = [['all','All','✦'],['must','Must','🔥'],['new','New','✨'],['party','Party','🎉'],['gem','Gems','💎'],['event','Events','📅']];
const DK_TYPE_IC = {spot:'📍',cafe:'☕',food:'🍜',view:'🌇',market:'🏮',experience:'🎟',nature:'🌿',party:'🎉',event:'🎆',shopping:'🛍'};
const DK_GRAD = {spot:['#f97316','#db2777'],cafe:['#a16207','#f59e0b'],food:['#dc2626','#f97316'],view:['#4f46e5','#06b6d4'],market:['#b91c1c','#f59e0b'],
  experience:['#7c3aed','#ec4899'],nature:['#047857','#22c55e'],party:['#9333ea','#f43f5e'],event:['#0f766e','#2563eb'],shopping:['#be185d','#f472b6']};
const DK_TYPE_TAGS = {party:['Nightlife','Social'],cafe:['Cafe','Food'],food:['Food'],market:['Food','Shopping','Social'],view:['Culture','Relax'],
  nature:['Nature','Adventure'],experience:['Culture','Social'],shopping:['Shopping'],spot:['Culture'],event:['Culture','Social']};
let dk = {city:'route', kind:'all', hist:[], q:null, qKey:''};

/* ---------- swipes ---------- */
function swipes(){ return appData().swipes || {}; }
function setSwipe(id, v){ const d = appData(); d.swipes = d.swipes || {}; if(v) d.swipes[id] = v; else delete d.swipes[id]; saveApp(d); }
function dkCard(id){ return (TD.deck||[]).find(c=>c.id===id); }
function savedCards(){ const s = swipes(); return (TD.deck||[]).filter(c=>s[c.id]==='y'); }

/* ---------- event helpers ---------- */
function dkDates(c){
  if(!c.from) return c.kind==='event' ? 'Dates TBC' : '';
  const f = d=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'});
  return c.to && c.to!==c.from ? `${f(c.from)} – ${f(c.to)}` : f(c.from);
}
function dkOnTrip(c){ const {start,end} = tripDates(); return c.from && c.from<=end && (c.to||c.from)>=start; }
function dkThere(c){ if(!c.from) return false; const row = routeSchedule().find(x=>x.city===c.city); return !!row && c.from<row.to && (c.to||c.from)>=row.from; }

/* ---------- the deck ---------- */
function dkRank(c){
  if(c.kind==='event') return dkThere(c) ? 0 : dkOnTrip(c) ? 4 : 9;
  return {must:1,new:2,party:3,gem:3}[c.kind] ?? 5;
}
function dkCities(){
  const r = myRoute(), all = Object.keys(TD.cities);
  if(dk.city==='route') return r;
  if(dk.city==='all') return [...r, ...all.filter(c=>!r.includes(c))];
  return [dk.city];
}
function deckList(){
  const s = swipes();
  const pass = c => !s[c.id] && (dk.kind==='all' || c.kind===dk.kind) && !(c.kind==='event' && c.from && (c.to||c.from) < tripDates().start);
  const lists = dkCities().map(city=>(TD.deck||[]).filter(c=>c.city===city && pass(c)).sort((a,b)=>dkRank(a)-dkRank(b)));
  const out = [];   // round-robin so the deck mixes cities like a feed
  for(let i=0; lists.some(l=>l[i]); i++) lists.forEach(l=>{ if(l[i]) out.push(l[i]); });
  return out;
}
/* The order is fixed when you pick a filter, so the card peeking behind is always the next one. */
function dkQueue(){
  const key = dk.city+'|'+dk.kind+'|'+myRoute().join(',');
  if(!dk.q || dk.qKey!==key){ dk.q = deckList().map(c=>c.id); dk.qKey = key; }
  const s = swipes(); dk.q = dk.q.filter(id=>!s[id] && dkCard(id));
  return dk.q.map(dkCard);
}
function setDeckCity(c){ dk.city = c; dk.q = null; renderDiscover(); }
function setDeckKind(k){ dk.kind = k; dk.q = null; renderDiscover(); }
function pickDeckCity(){ openCitySheet({mode:'pick', title:'Discover in…', current:dk.city, onPick:c=>setDeckCity(c)}); }

/* ---------- photos (Wikipedia, when the place has an article) ---------- */
const WIKI_KEY = 'tripWikiImgV1';
let wikiMem = null;
function wikiStore(){ if(!wikiMem){ try{ wikiMem = JSON.parse(localStorage.getItem(WIKI_KEY)||'{}'); }catch(e){ wikiMem = {}; } } return wikiMem; }
async function wikiImg(title){
  const st = wikiStore(); if(title in st) return st[title];
  try{
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g,'_'))}`);
    if(!r.ok) throw 0;
    const j = await r.json(); let u = '';
    if(j.originalimage && j.originalimage.width<=1400 && !/\.svg/i.test(j.originalimage.source)) u = j.originalimage.source;
    else if(j.thumbnail?.source) u = j.thumbnail.source.replace(/\/\d+px-/, '/800px-');
    st[title] = u; try{ localStorage.setItem(WIKI_KEY, JSON.stringify(st)); }catch(e){}
    return u;
  }catch(e){ return null; }
}
async function dkLoadPhoto(el, c){
  if(!c.wiki || !navigator.onLine) return;
  const u = await wikiImg(c.wiki); if(!u || !el.isConnected) return;
  const img = new Image(); img.alt = ''; img.className = 'dc-img'; img.referrerPolicy = 'no-referrer';
  img.onload = ()=>el.classList.add('has-img'); img.onerror = ()=>img.remove();
  img.src = u; el.prepend(img);
}

/* ---------- rendering ---------- */
function dkKindBadge(c){
  if(c.kind==='event') return `<span class="dk-b ev">📅 ${esc(dkDates(c))}</span>${dkThere(c)?'<span class="dk-b ok">✓ you’re there</span>':''}`;
  if(c.kind==='new') return `<span class="dk-b new">✨ NEW${c.opened?' · '+esc(c.opened):''}</span>`;
  return {must:'<span class="dk-b must">🔥 DON’T MISS</span>', party:'<span class="dk-b party">🎉 PARTY</span>', gem:'<span class="dk-b gem">💎 HIDDEN GEM</span>'}[c.kind]||'';
}
function dkIgUrl(c){ return c.igh ? `https://www.instagram.com/${c.igh}/` : c.ig ? `https://www.instagram.com/explore/tags/${encodeURIComponent(c.ig)}/` : null; }
function dkCardHTML(c, depth){
  const g = DK_GRAD[c.type] || DK_GRAD.spot, o = cityObj(c.city);
  const ig = dkIgUrl(c);
  return `<article class="dc-card${depth===0?' top':''}" data-id="${esc(c.id)}" style="--d:${depth};--g1:${g[0]};--g2:${g[1]}">
    <div class="dc-photo"><span class="dc-emoji">${DK_TYPE_IC[c.type]||'📍'}</span>
      <div class="dc-badges">${dkKindBadge(c)}</div>
      <div class="dc-where">${TD.countries[o.country].flag} ${esc(c.city)}</div>
      <div class="dc-stamp yes">WANT</div><div class="dc-stamp no">SKIP</div>
    </div>
    <div class="dc-body">
      <h3>${esc(c.name)}</h3>
      ${c.hook?`<p class="dc-hook">${esc(c.hook)}</p>`:''}
      <div class="dc-meta">${c.when?`<span>🕒 ${esc(c.when)}</span>`:''}${c.price?`<span>💵 ${esc(c.price)}</span>`:''}${c.halal&&!c.alc?`<span class="dc-halal">☪︎ ${esc(c.halal)}</span>`:''}${c.alc?'<span class="dc-alc">🍸 Alcohol-centric</span>':''}</div>
      ${c.tip?`<p class="dc-tip">💡 ${esc(c.tip)}</p>`:''}
      <div class="dc-links">${ig?`<a href="${esc(ig)}" target="_blank" rel="noopener">${c.igh?'Instagram':'#'+esc(c.ig)} ↗</a>`:''}<a href="${esc(gmapsSearch(c.maps))}" target="_blank" rel="noopener">Google Maps ↗</a></div>
    </div></article>`;
}
function renderDiscover(){
  const stage = document.getElementById('dcStage'); if(!stage) return;
  const r = myRoute();
  const cityRow = document.getElementById('dcCities');
  if(cityRow) cityRow.innerHTML = `<button class="dc-scope ${dk.city==='route'?'on':''}" onclick="setDeckCity('route')">All stops</button>`
    + r.map(c=>`<button class="dc-city ${dk.city===c?'on':''}" onclick="setDeckCity('${jsq(c)}')" aria-label="${esc(c)}">${cityObj(c).emoji}<small>${esc(dotLabel(c))}</small></button>`).join('')
    + `<button class="dc-scope more ${dk.city!=='route'&&!r.includes(dk.city)?'on':''}" onclick="pickDeckCity()">${dk.city!=='route'&&!r.includes(dk.city)&&TD.cities[dk.city]?esc(dotLabel(dk.city)):'More'} ▾</button>`;
  const kinds = document.getElementById('dcKinds');
  if(kinds) kinds.innerHTML = DK_KINDS.map(([k,l,ic])=>`<button class="${dk.kind===k?'on':''}" onclick="setDeckKind('${k}')"><span>${ic}</span>${l}</button>`).join('');
  const n = savedCards().length, sv = document.getElementById('dcSavedBtn'); if(sv) sv.innerHTML = `♥ Saved <b>${n}</b>`;
  const list = dkQueue();
  const left = document.getElementById('dcLeft'); if(left) left.textContent = list.length ? `${list.length} to swipe` : '';
  if(!list.length){
    const skipped = (TD.deck||[]).filter(c=>dkCities().includes(c.city) && (dk.kind==='all'||c.kind===dk.kind) && swipes()[c.id]==='n').length;
    stage.innerHTML = `<div class="dc-empty"><b>You’ve seen everything here 🎉</b><p>Try another city or filter${n?', or open your saved list':''}.</p>
      ${skipped?`<button onclick="dkResetSkips()">Show the ${skipped} you skipped again</button>`:''}</div>`;
    return;
  }
  stage.innerHTML = list.slice(0,3).map((c,i)=>dkCardHTML(c,i)).reverse().join('');
  stage.querySelectorAll('.dc-card').forEach(el=>dkLoadPhoto(el.querySelector('.dc-photo'), dkCard(el.dataset.id)));
  const top = stage.querySelector('.dc-card.top'); if(top) dkBindDrag(top);
}
function dkTop(){ return document.querySelector('#dcStage .dc-card.top'); }

/* ---------- gestures ---------- */
function dkBindDrag(card){
  let sx=0, sy=0, dx=0, dy=0, t0=0, on=false;
  card.addEventListener('pointerdown', e=>{
    if(e.target.closest('a,button')) return;
    on = true; sx = e.clientX; sy = e.clientY; dx = dy = 0; t0 = Date.now();
    try{ card.setPointerCapture(e.pointerId); }catch(_){}
    card.style.transition = 'none';
  });
  card.addEventListener('pointermove', e=>{
    if(!on) return;
    dx = e.clientX-sx; dy = e.clientY-sy;
    card.style.transform = `translate(${dx}px,${dy*0.25}px) rotate(${dx/16}deg)`;
    card.style.setProperty('--yes', Math.max(0, Math.min(1, dx/90)));
    card.style.setProperty('--no', Math.max(0, Math.min(1, -dx/90)));
  });
  const end = ()=>{
    if(!on) return; on = false;
    const v = Math.abs(dx)/Math.max(1, Date.now()-t0);
    if(Math.abs(dx)>100 || (Math.abs(dx)>45 && v>0.6)) dkFly(card, dx>0 ? 'y' : 'n', dy);
    else { card.style.transition = 'transform .25s ease'; card.style.transform = ''; card.style.setProperty('--yes',0); card.style.setProperty('--no',0); }
  };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
}
function dkFly(card, v, dy=0){
  if(!card || card.dataset.gone) return; card.dataset.gone = '1';
  const w = window.innerWidth*1.4*(v==='y'?1:-1);
  card.style.transition = 'transform .32s ease-out, opacity .32s';
  card.style.transform = `translate(${w}px,${dy*0.25+40}px) rotate(${v==='y'?28:-28}deg)`; card.style.opacity = '0';
  card.style.setProperty(v==='y'?'--yes':'--no', 1);
  setTimeout(()=>dkCommit(card.dataset.id, v), 260);
}
function dkSwipe(v){ dkFly(dkTop(), v); }
function dkCommit(id, v){
  const c = dkCard(id); setSwipe(id, v); dk.hist.push(id);
  if(v==='y' && c){
    const onRoute = myRoute().includes(c.city);
    showToast(c.kind==='event' && dkThere(c) ? `♥ Saved — it’s on your ${c.city} day plan for ${dkDates(c)}` : onRoute ? `♥ Saved — it’ll show up in your ${c.city} day plan` : '♥ Saved to your list');
  }
  renderDiscover();
}
function dkUndo(){
  const id = dk.hist.pop(); if(!id){ showToast('Nothing to undo'); return; }
  setSwipe(id, null); if(dk.q) dk.q.unshift(id); renderDiscover();
}
function dkResetSkips(){
  const d = appData(), s = d.swipes||{};
  (TD.deck||[]).forEach(c=>{ if(dkCities().includes(c.city) && (dk.kind==='all'||c.kind===dk.kind) && s[c.id]==='n') delete s[c.id]; });
  saveApp(d); dk.q = null; renderDiscover();
}

/* ---------- saved list ---------- */
function openSaved(){ renderSaved(); openModal('dcSavedModal'); }
function renderSaved(){
  const el = document.getElementById('dcSavedBody'); if(!el) return;
  const list = savedCards();
  if(!list.length){ el.innerHTML = '<div class="empty-state">Nothing saved yet — swipe right on anything you’d like to do.</div>'; return; }
  const r = myRoute(), cities = [...r.filter(c=>list.some(x=>x.city===c)), ...[...new Set(list.map(x=>x.city))].filter(c=>!r.includes(c))];
  el.innerHTML = cities.map(city=>`<div class="sv-city"><h4>${cityObj(city).emoji} ${esc(city)}${r.includes(city)?'':' <small>not on your route</small>'}</h4>${
    list.filter(x=>x.city===city).sort((a,b)=>dkRank(a)-dkRank(b)).map(c=>{
      const ig = dkIgUrl(c);
      return `<div class="sv-row"><span class="sv-ic">${DK_TYPE_IC[c.type]||'📍'}</span><div class="sv-copy"><b>${esc(c.name)}</b><small>${c.kind==='event'?'📅 '+esc(dkDates(c))+' · ':''}${esc(c.hook||'')}</small>
        <div class="sv-acts"><button class="go" onclick="closeModal('dcSavedModal');openDirections('${jsq(c.maps)}',{city:'${jsq(c.city)}',label:'${jsq(c.name)}'})">Go</button><a href="${esc(gmapsSearch(c.maps))}" target="_blank" rel="noopener">Maps</a>${ig?`<a href="${esc(ig)}" target="_blank" rel="noopener">Instagram</a>`:''}<button onclick="setSwipe('${jsq(c.id)}',null);renderSaved();renderDiscover()">Remove</button></div></div></div>`;
    }).join('')}</div>`).join('');
}

/* ---------- day-plan hooks (used by planner.js) ---------- */
function likedDeckFor(city){
  return memoData('liked:'+city, ()=>{
    const s = swipes();
    return (TD.deck||[]).filter(c=>c.city===city && s[c.id]==='y' && c.kind!=='event').map(c=>{
      const txt = `${c.name} ${c.when||''} ${c.hook||''}`;
      return {name:c.name, city, why:c.hook, when:c.when, q:c.maps, tags:DK_TYPE_TAGS[c.type]||['Culture'], liked:true, sig:true,
        keys:nameKeys(c.name), days:allowedDays(`${c.name} ${c.when||''}`), bucket:c.type==='party'?'night':bucketOf(txt),
        outdoor:['nature','view'].includes(c.type) || /beach|island|waterfall|park|hike|viewpoint|canyon/i.test(txt),
        long:/day trip|full[- ]day/i.test(txt)};
    });
  });
}
/* A saved event goes on ONE evening: the first day you're in its city while it's on (multi-week festivals too). */
function likedEventDay(c){
  const {start, end} = tripDates();
  for(let x = c.from>start ? c.from : start; x<=(c.to||c.from) && x<=end; x = addDays(x,1)) if(cityOnDate(x)===c.city) return x;
  return null;
}
function likedEventsOn(date){
  const s = swipes();
  return (TD.deck||[]).filter(c=>c.kind==='event' && s[c.id]==='y' && c.from && likedEventDay(c)===date);
}

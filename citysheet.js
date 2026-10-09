/* City sheet — one consistent way to choose a place.
   Your route first (in order, with dates), then Malaysia / Thailand tabs, search across both, and "Use my location".
   Used by: Home "Where are you now?", Top picks, "All 21 places", and every city field in forms. */

let csState = null;

function citySwitchHTML(c, onclick, opts={}){
  const o = cityObj(c); if(!o) return '';
  const r = myRoute(), i = r.indexOf(c), row = routeSchedule().find(x=>x.city===c);
  const dy = typeof dayFor==='function' ? dayFor(todayISO()) : null;
  const isToday = dy && (dy.city===c || dy.to===c);
  const sub = row ? `Stop ${i+1} of ${r.length} · ${shortDate(row.from)} – ${shortDate(row.to)}` : `${o.region} · not on your route`;
  return `<button class="city-switch" style="--accent:${o.accent}" onclick="${onclick}">
    <span class="sw-emoji">${o.emoji}</span>
    <span class="sw-main"><small>${TD.countries[o.country].flag} ${TD.countries[o.country].name.toUpperCase()}${isToday?' · TODAY':''}</small><b>${esc(c)}</b><em>${esc(sub)}</em></span>
    <span class="sw-change">${opts.label||'Change'}</span></button>`;
}
const DOT_LABEL = {'Kuala Lumpur':'KL','Cameron Highlands':'Cameron','Kota Kinabalu':'K. Kinabalu','Perhentian Islands':'Perhentian','Koh Phi Phi':'Phi Phi','Koh Samui':'Samui','Koh Phangan':'Phangan','Kanchanaburi':'Kanchana.'};
function dotLabel(c){ return DOT_LABEL[c] || c; }
function routeDotsHTML(current, fn){
  const r = myRoute(), dy = typeof dayFor==='function' ? dayFor(todayISO()) : null;
  if(r.length<2) return '';
  return `<div class="route-dots ${r.length>7?'many':''}" role="tablist" aria-label="Your route">${r.map((c,i)=>{
    const now = dy && (dy.city===c || dy.to===c);
    return `${i?'<i class="rd-line"></i>':''}<button class="rd ${c===current?'on':''} ${now?'now':''}" style="--accent:${cityObj(c).accent}" onclick="${fn}('${jsq(c)}')" aria-label="${esc(c)}"><span class="rd-ic">${cityObj(c).emoji}</span><span class="rd-lb">${esc(dotLabel(c))}</span></button>`;
  }).join('')}</div>`;
}

/* ---------- sheet ---------- */
function openCitySheet(opts={}){
  const cur = opts.current ?? (opts.select ? opts.select.value : guideCity);
  csState = {
    mode: opts.mode || 'go', title: opts.title || (opts.mode==='browse' ? 'All 21 places' : 'Where are you?'),
    current: cur, select: opts.select || null, allowed: opts.allowed || null, extras: opts.extras || [],
    country: TD.cities[cur]?.country || TD.cities[guideCity]?.country || 'MY', q: '', detail: null, onPick: opts.onPick || null
  };
  if(opts.country) csState.country = opts.country;
  if(csState.mode==='field' && csState.select){
    const vals = [...csState.select.options].map(o=>({value:o.value, text:o.text}));
    csState.allowed = vals.filter(v=>TD.cities[v.value]).map(v=>v.value);
    csState.extras = vals.filter(v=>!TD.cities[v.value]).map(v=>({value:v.value, label:v.value==='Home'?'🏠 Home':v.text||'Not set'}));
  }
  document.getElementById('csTitle').textContent = csState.title;
  const s = document.getElementById('csSearch'); s.value = '';
  s.placeholder = `Search ${csCities().length} places…`;
  document.getElementById('csLocate').classList.toggle('hidden', csState.extras.some(x=>x.value==='Home'));
  document.getElementById('csMain').classList.remove('hidden');
  document.getElementById('csDetail').classList.add('hidden');
  renderCitySheet(); openModal('citySheet');
}
function csCities(){ let l = Object.keys(TD.cities); if(csState?.allowed) l = l.filter(c=>csState.allowed.includes(c)); return l; }
function csSearch(v){ if(!csState) return; csState.q = v; renderCitySheet(); }
function csSetCountry(cc){ csState.country = cc; renderCitySheet(); }
function csTile(c, routeIdx){
  const o = cityObj(c), row = routeIdx>=0 ? routeSchedule().find(x=>x.city===c) : null;
  const dy = typeof dayFor==='function' ? dayFor(todayISO()) : null, now = dy && (dy.city===c || dy.to===c);
  const sub = row ? `${shortDate(row.from)} – ${shortDate(row.to)}` : o.region;
  return `<button class="cs-tile ${c===csState.current?'active':''}" style="--accent:${o.accent}" onclick="csPick('${jsq(c)}')">
    <span class="cs-badge">${routeIdx>=0?routeIdx+1:o.emoji}</span>
    <span class="cs-txt"><b>${routeIdx>=0?o.emoji+' ':''}${esc(c)}</b><small>${esc(sub)}</small></span>
    ${now?'<em class="cs-now">Today</em>':c===csState.current?'<em class="cs-cur">✓</em>':''}</button>`;
}
function renderCitySheet(){
  const el = document.getElementById('csGrid'); if(!el || !csState) return;
  const all = csCities(), route = myRoute().filter(c=>all.includes(c)), q = csState.q.trim().toLowerCase();
  const extras = csState.extras.length ? `<div class="cs-grid">${csState.extras.map(x=>`<button class="cs-tile cs-extra ${x.value===csState.current?'active':''}" onclick="csPickValue('${jsq(x.value)}')"><span class="cs-txt"><b>${esc(x.label)}</b></span></button>`).join('')}</div>` : '';
  if(q){
    const hits = all.filter(c=>{ const o = cityObj(c); return [c, o.region, o.tagline, TD.countries[o.country].name, ...(o.famous||[])].join(' ').toLowerCase().includes(q); });
    el.innerHTML = hits.length ? `<div class="cs-label">Results</div><div class="cs-grid">${hits.map(c=>csTile(c, myRoute().indexOf(c))).join('')}</div>`
      : `<p class="hint cs-empty">No match for “${esc(csState.q)}”. Try a city or a thing like “beach”, “lanterns”, “street food”.</p>`;
    return;
  }
  const rest = all.filter(c=>!route.includes(c));
  const counts = {}; rest.forEach(c=>{ const k = cityObj(c).country; counts[k] = (counts[k]||0)+1; });
  const ccs = Object.keys(TD.countries).filter(k=>counts[k]);
  if(!ccs.includes(csState.country) && ccs.length) csState.country = ccs[0];
  const tabs = ccs.length>1 ? `<div class="cs-tabs">${ccs.map(k=>`<button class="${k===csState.country?'on':''}" onclick="csSetCountry('${k}')">${TD.countries[k].flag} ${TD.countries[k].name} <small>${counts[k]}</small></button>`).join('')}</div>` : '';
  const more = rest.filter(c=>cityObj(c).country===csState.country || ccs.length<=1);
  el.innerHTML = extras
    + (route.length ? `<div class="cs-label">Your route <small>in order</small></div><div class="cs-grid">${route.map(c=>csTile(c, myRoute().indexOf(c))).join('')}</div>` : '')
    + (rest.length ? `<div class="cs-label">${route.length?'More places':'Places'}</div>${tabs}<div class="cs-grid">${more.map(c=>csTile(c, -1)).join('')}</div>` : '')
    + `<div class="cs-legend"><span><i class="cs-dot nov-great"></i>great in Nov</span><span><i class="cs-dot nov-mixed"></i>showery</span><span><i class="cs-dot nov-wet"></i>rainy / closed</span></div>`;
}
function csPickValue(v){
  if(csState.mode==='field' && csState.select){
    csState.select.value = v; csState.select.dispatchEvent(new Event('change', {bubbles:true}));
  }
  closeModal('citySheet');
}
function csPick(c){
  const m = csState.mode;
  if(m==='browse'){ csShowDetail(c); return; }
  if(m==='field'){ csPickValue(c); return; }
  closeModal('citySheet');
  if(m==='pick'){ const f = csState.onPick; if(f) f(c); return; }
  if(m==='picks'){ setPicksCity(c); return; }
  if(c!==guideCity){ setGuideCity(c); showToast(`${cityObj(c).emoji} Showing ${c}`); }
}
async function csUseLocation(){
  showToast('Finding you…');
  try{
    const p = await getPosition();
    const here = [p.coords.latitude, p.coords.longitude];
    const best = csCities().map(c=>({c, m:haversine(here, [cityObj(c).coords.lat, cityObj(c).coords.lon])})).sort((a,b)=>a.m-b.m)[0];
    if(!best || best.m>120000){ showToast('You’re not near any place in the app yet'); return; }
    showToast(`📍 You’re in ${best.c}`);
    csPick(best.c);
  }catch(e){ showToast(geoErrorText(e)); }
}

/* ---------- detail view (All 21 places) ---------- */
function csShowDetail(c){
  csState.detail = c;
  const o = cityObj(c), on = myRoute().includes(c);
  document.getElementById('csMain').classList.add('hidden');
  const el = document.getElementById('csDetail'); el.classList.remove('hidden');
  el.innerHTML = `<button class="cs-back" onclick="csBack()">‹ All places</button>
    <div class="cs-detail" style="--accent:${o.accent}">
      <div class="browser-top"><div class="browser-emoji">${o.emoji}</div><div class="browser-copy"><b>${esc(c)}</b><small>${flagOf(c)} ${esc(o.region)}</small></div></div>
      <p class="cs-tag">${esc(o.tagline)}</p>
      <div class="snap-label">Famous for</div>
      <div class="famous-chips">${o.famous.map(f=>`<span>${esc(f)}</span>`).join('')}</div>
      ${o.getThere?`<div class="snap-label">Getting there</div><p class="cs-tag">${esc(o.getThere)}</p>`:''}
      <div class="browser-actions">
        <button class="go" onclick="goToCity('${jsq(c)}')">Go to ${esc(c)}</button>
        <button onclick="closeModal('citySheet');openCityTab('route','${jsq(c)}')">Read guide</button>
        <button class="${on?'on-route':''}" onclick="toggleRouteCity('${jsq(c)}');csShowDetail('${jsq(c)}')">${on?'✓ On my route':'＋ Add to route'}</button>
      </div>
    </div>`;
  el.scrollIntoView({block:'start'});
}
function csBack(){
  csState.detail = null;
  document.getElementById('csDetail').classList.add('hidden');
  document.getElementById('csMain').classList.remove('hidden');
  renderCitySheet();
}

/* ---------- turn plain city <select>s into tap-to-pick fields ---------- */
const _selValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
function cityFieldify(sel){
  if(!sel || sel.dataset.cf) return; sel.dataset.cf = '1';
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'city-field';
  sel.insertAdjacentElement('afterend', btn); sel.classList.add('cf-hidden');
  const label = ()=>{
    const v = _selValue.get.call(sel), o = TD.cities[v];
    const txt = v==='Home' ? '🏠 Home' : o ? `${o.emoji} ${esc(v)} <small>${TD.countries[o.country].flag}</small>` : esc(sel.options[sel.selectedIndex]?.text || 'Choose a city');
    btn.innerHTML = `<span>${txt}</span><span class="cf-caret">▾</span>`;
  };
  Object.defineProperty(sel, 'value', {configurable:true, get(){ return _selValue.get.call(this); }, set(v){ _selValue.set.call(this, v); label(); }});
  new MutationObserver(label).observe(sel, {childList:true, subtree:true});
  sel.addEventListener('change', label);
  sel.form?.addEventListener('reset', ()=>setTimeout(label, 0));
  const title = sel.closest('.field')?.querySelector('label')?.textContent?.trim() || 'Choose a city';
  btn.addEventListener('click', ()=>openCitySheet({mode:'field', select:sel, title}));
  label();
}
function wireCityFields(){
  ['arrivalCity','homeCity','bkFrom','bkTo','bkStayCity','bkOtherCity','planCity','expenseCity','rideCity','detailCity','noteCity','journeyStopCity']
    .forEach(id=>cityFieldify(document.getElementById(id)));
}

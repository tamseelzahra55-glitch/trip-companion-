/* v16 features: data-driven explore lists, editable route, city browser, city snapshot,
   key dates, first-timer essentials, phrasebook, currency converter, no-pork filter, journey for any route.
   Loaded before app.js; everything here is a function declaration called after app.js has set up its globals. */

const TD = window.TRIP_DATA;
const CITY_SHORT = {'Kuala Lumpur':'KL','Langkawi':'LGK','Phuket':'HKT','Bangkok':'BKK','Chiang Mai':'CNX','Penang':'PEN','Melaka':'MKZ','Ipoh':'IPH','Cameron Highlands':'CH','Kota Kinabalu':'BKI','Kuching':'KCH','Perhentian Islands':'PHN','Krabi':'KBV','Koh Phi Phi':'PHI','Koh Samui':'USM','Koh Phangan':'PGN','Koh Tao':'TAO','Pattaya':'PTY','Chiang Rai':'CEI','Pai':'PAI','Kanchanaburi':'KAN'};
const REC_ORDER = ['Stay areas','Food','Cafés','Massage','Social / night','Hidden / small','Big memory'];

function cityShort(c){return CITY_SHORT[c]||c.slice(0,3).toUpperCase()}
function cityObj(c){return TD.cities[c]||null}
function flagOf(c){const o=cityObj(c);return o?TD.countries[o.country].flag:''}
function jsq(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}

/* ---------- Route (editable) ---------- */
function myRoute(){
  const d=appData();
  const r=(Array.isArray(d.route)&&d.route.length?d.route:TD.route).filter(c=>TD.cities[c]);
  return r.length?r:TD.route.slice();
}
function saveRoute(r){const d=appData();d.route=r;saveApp(d)}
function isOnRoute(c){return myRoute().includes(c)}
function toggleRouteCity(c){
  let r=myRoute();
  if(r.includes(c)){ if(r.length<=1){showToast('Keep at least one city on your route');return} r=r.filter(x=>x!==c); showToast(c+' removed from your route'); }
  else { r.push(c); showToast(c+' added to your route ✓'); }
  saveRoute(r); afterRouteChange();
}
function moveRouteCity(i,dir){
  const r=myRoute(),j=i+dir; if(j<0||j>=r.length)return;
  [r[i],r[j]]=[r[j],r[i]]; saveRoute(r); afterRouteChange();
}
function resetRoute(){saveRoute(TD.route.slice());afterRouteChange();showToast('Route reset to the original 5 cities')}
function afterRouteChange(){
  renderRouteEditor(); renderCityPickers(); renderKeyDates(); refreshExploreMeta(); renderJourney();
  if(document.getElementById('cityBrowserModal')?.classList.contains('open'))renderCityBrowser();
}
/* Trip dates + nights per city → a simple schedule the rest of the app can reason about */
function tripDates(){const st=appData().settings||{};return {start:st.start||TD.tripDefaults.start,end:st.end||TD.tripDefaults.end}}
function ensureTripDates(){
  const d=appData(); d.settings=d.settings||{}; let ch=false;
  if(!d.settings.start){d.settings.start=TD.tripDefaults.start;ch=true}
  if(!d.settings.end){d.settings.end=TD.tripDefaults.end;ch=true}
  if(ch)saveApp(d);
}
function addDays(iso,n){const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function shortDate(iso){return new Date(iso+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'})}
function routeNights(){
  const saved=appData().routeNights||{}, out={};
  myRoute().forEach(c=>out[c]=Number.isFinite(saved[c])?saved[c]:(TD.defaultNights[c]??2));
  return out;
}
function setNights(c,delta){
  const d=appData(), cur=routeNights();
  d.routeNights=Object.assign({},d.routeNights||{},{[c]:Math.max(0,Math.min(30,cur[c]+delta))});
  saveApp(d); afterRouteChange();
}
function routeSchedule(){
  let cur=tripDates().start; const n=routeNights();
  return myRoute().map(c=>{const from=cur,to=addDays(cur,n[c]);cur=to;return {city:c,from,to,nights:n[c]}});
}
/* city you sleep in on a given night (null = outside the planned nights) */
function cityOnDate(iso){return routeSchedule().find(x=>iso>=x.from&&iso<x.to)?.city||null}
function eventDays(k){const out=[];for(let x=k.start;x<=k.end;x=addDays(x,1))out.push(x);return out}
function keyDateCheck(k){
  const {start,end}=tripDates();
  if(k.end<start)return {cls:'before',text:'before your trip'};
  if(k.start>end)return {cls:'after',text:'after your trip'};
  const where=[...new Set(eventDays(k).map(cityOnDate).filter(Boolean))];
  const hits=where.filter(c=>k.cities?k.cities.includes(c):TD.cities[c]?.country===k.country);
  if(hits.length)return {cls:'during',text:'✓ you’re in '+hits.join(' / ')+' then',ok:true};
  return {cls:'warn',text:where.length?'you’ll be in '+where.join(' / ')+' then':'during your trip',ok:false};
}
function renderRouteEditor(){
  const el=document.getElementById('routeEditor'); if(!el)return;
  const sched=routeSchedule(), {start,end}=tripDates(), avail=daysBetween(start,end);
  const total=sched.reduce((a,x)=>a+x.nights,0), r=myRoute();
  const lbl=document.getElementById('routeTripDates'); if(lbl)lbl.innerHTML=`${shortDate(start)} – ${shortDate(end)} · <button class="link-btn" onclick="openModal('tripSettingsModal')">edit</button>`;
  const rows=sched.map((x,i)=>{const o=cityObj(x.city);return `<div class="route-row">
    <span class="route-row-num" style="background:${o.accent}">${i+1}</span>
    <div class="route-row-copy"><b>${o.emoji} ${esc(x.city)}</b><small>${x.nights?`${shortDate(x.from)} – ${shortDate(x.to)}`:'day trip / not staying'} · ${novBadge(x.city,true)}</small></div>
    <div class="nights-stepper" aria-label="Nights in ${esc(x.city)}">
      <button aria-label="One night fewer" onclick="setNights('${jsq(x.city)}',-1)" ${x.nights<=0?'disabled':''}>−</button>
      <span><b>${x.nights}</b><small>night${x.nights===1?'':'s'}</small></span>
      <button aria-label="One night more" onclick="setNights('${jsq(x.city)}',1)">+</button>
    </div>
    <div class="route-row-actions">
      <button aria-label="Move up" onclick="moveRouteCity(${i},-1)" ${i===0?'disabled':''}>↑</button>
      <button aria-label="Move down" onclick="moveRouteCity(${i},1)" ${i===r.length-1?'disabled':''}>↓</button>
      <button aria-label="Remove" onclick="toggleRouteCity('${jsq(x.city)}')">✕</button>
    </div></div>`}).join('');
  const diff=total-avail;
  const status=diff===0?`<span class="ok">✓ ${total} of ${avail} nights planned</span>`
    :diff>0?`<span class="bad">${total} nights planned — ${diff} more than your ${avail}</span>`
    :`<span class="warn">${total} of ${avail} nights planned — ${-diff} still free</span>`;
  const checks=TD.keyDates.filter(k=>k.cities&&k.cities.some(c=>r.includes(c))).map(k=>{
    const c=keyDateCheck(k);
    return `<div class="route-check ${c.ok?'ok':'warn'}">${c.ok?'🏮':'⚠️'} <b>${esc(k.title)}</b> (${keyDateRange(k)}): ${esc(c.text)}${c.ok?'':' — shift nights so you’re in '+esc(k.cities[0])+' then.'}</div>`;
  }).join('');
  el.innerHTML=rows+`<div class="route-summary">${status}</div>`+checks;
}

/* ---------- November fit badge ---------- */
function novBadge(c,small=false){
  const o=cityObj(c); if(!o||!o.nov)return '';
  const f=TD.novFit[o.nov.fit]||TD.novFit.mixed;
  return `<span class="nov-badge nov-${f.cls}${small?' small':''}">${f.label}</span>`;
}
function novBox(c){
  const o=cityObj(c); if(!o||!o.nov)return '';
  const f=TD.novFit[o.nov.fit]||TD.novFit.mixed;
  return `<div class="nov-box nov-${f.cls}"><b>🌦 ${f.label}</b><span>${esc(o.nov.note)}</span></div>`;
}

/* ---------- City pickers (route chips + "more") ---------- */
function renderCityPickers(){
  const route=myRoute();
  const chips=fn=>{
    let list=route.slice(); if(!list.includes(guideCity))list.push(guideCity);
    return list.map(c=>`<button class="${c===guideCity?'active':''}${route.includes(c)?'':' off-route'}" onclick="${fn}('${jsq(c)}')">${cityObj(c)?.emoji||''} ${esc(c)}</button>`).join('')
      +`<button class="more-cities" onclick="openCityBrowser()">＋ More cities</button>`;
  };
  ['homeCityPicker','dayCityPicker','togetherCityPicker'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=chips('setGuideCity')});
  const ex=document.getElementById('exploreCityPicker'); if(ex)ex.innerHTML=chips('jumpRouteCity');
}

/* ---------- City browser modal ---------- */
let browserCountry='MY';
function openCityBrowser(country){
  browserCountry=country||cityObj(guideCity)?.country||'MY';
  renderCityBrowser(); openModal('cityBrowserModal');
}
function setBrowserCountry(cc){browserCountry=cc;renderCityBrowser()}
function renderCityBrowser(){
  const sw=document.getElementById('browserCountry'), el=document.getElementById('cityBrowserList'); if(!el)return;
  sw.innerHTML=Object.entries(TD.countries).map(([cc,v])=>`<button class="${cc===browserCountry?'on':''}" onclick="setBrowserCountry('${cc}')">${v.flag} ${v.name} <small>${CITIES.filter(c=>TD.cities[c].country===cc).length}</small></button>`).join('');
  const route=myRoute();
  const list=CITIES.filter(c=>TD.cities[c].country===browserCountry).sort((a,b)=>{
    const ra=route.indexOf(a),rb=route.indexOf(b);
    if(ra>=0&&rb>=0)return ra-rb; if(ra>=0)return -1; if(rb>=0)return 1; return 0;
  });
  el.innerHTML=list.map(c=>{const o=cityObj(c),on=route.includes(c);return `<div class="browser-city" style="--accent:${o.accent}">
    <div class="browser-top"><div class="browser-emoji">${o.emoji}</div>
      <div class="browser-copy"><b>${esc(c)}</b><small>${esc(o.region)}</small></div>${novBadge(c,true)}</div>
    <p>${esc(o.tagline)}</p>
    <div class="browser-famous">${o.famous.slice(0,4).map(f=>`<span>${esc(f)}</span>`).join('')}</div>
    <div class="browser-actions">
      <button class="go" onclick="goToCity('${jsq(c)}')">Go to ${esc(c)}</button>
      <button onclick="openCityTab('route','${jsq(c)}');closeModal('cityBrowserModal')">Read guide</button>
      <button class="${on?'on-route':''}" onclick="toggleRouteCity('${jsq(c)}')">${on?'✓ On my route':'＋ Add to route'}</button>
    </div></div>`}).join('');
}
function goToCity(c){closeModal('cityBrowserModal');setGuideCity(c);showTab('home',document.getElementById('navHome'))}

/* ---------- Home: city snapshot ---------- */
function renderGuide(){
  const el=document.getElementById('guideNow'); if(!el)return;
  const o=cityObj(guideCity); if(!o){el.innerHTML='';return}
  el.style.setProperty('--snap-accent',o.accent);
  el.innerHTML=`<div class="panel-head"><h3>${o.emoji} About ${esc(guideCity)}</h3><small>${flagOf(guideCity)} ${esc(o.region)}</small></div>
    <p class="snap-tagline">${esc(o.tagline)}</p>
    ${novBox(guideCity)}
    <div class="snap-label">Famous for</div>
    <div class="famous-chips">${o.famous.map(f=>`<span>${esc(f)}</span>`).join('')}</div>
    <details class="nested-help snap-tips"><summary>First-timer tips for ${esc(guideCity)}</summary>
      <ul>${o.getThere?`<li><b>Getting there:</b> ${esc(o.getThere)}</li>`:''}${o.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    </details>
    <div class="snap-actions">
      <button onclick="openCityTab('route','${jsq(guideCity)}')">Full guide</button>
      <button onclick="openCityTab('stayeats','${jsq(guideCity)}')">Food + stays</button>
      <button onclick="openCityTab('activities','${jsq(guideCity)}')">Things to do</button>
    </div>`;
}

/* ---------- Key dates ---------- */
function relevantKeyDates(){
  const today=todayISO(), route=myRoute(), {start,end}=tripDates();
  return TD.keyDates.filter(k=>k.end>=today&&k.end>=start&&k.start<=end).filter(k=>{
    if(k.country)return route.some(c=>TD.cities[c]?.country===k.country);
    return (k.cities||[]).some(c=>route.includes(c));
  });
}
function keyDateRange(k){
  const f=s=>new Date(s+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'});
  return k.start===k.end?f(k.start):`${f(k.start)} – ${f(k.end)}`;
}
function tripWindowTag(k){const c=keyDateCheck(k);return `<span class="kd-tag ${c.cls}">${esc(c.text)}</span>`}
function keyDateHTML(k){
  return `<div class="kd-item"><div class="kd-date">${keyDateRange(k)}</div><div><b>${esc(k.title)}</b> ${tripWindowTag(k)}<small>${esc(k.where)}</small><p>${esc(k.note)}</p></div></div>`;
}
function renderKeyDates(){
  const el=document.getElementById('keyDatesCard');
  if(el){
    const items=relevantKeyDates();
    el.classList.toggle('hidden',!items.length);
    el.innerHTML=items.length?`<div class="panel-head"><h3>📅 Heads-up for your dates</h3><small>festivals + holidays</small></div>${items.slice(0,3).map(keyDateHTML).join('')}
      <button class="mood-see-all" onclick="showTab('essentials',document.getElementById('navExplore'))">All essentials →</button>`:'';
  }
  const full=document.getElementById('keyDatesFull');
  if(full){
    const {start,end}=tripDates(); const items=TD.keyDates.filter(k=>k.end>=todayISO()&&k.end>=start&&k.start<=end);
    full.innerHTML=items.length?`<div class="panel-head"><h3>📅 Key dates</h3><small>${shortDate(tripDates().start)} – ${shortDate(tripDates().end)}</small></div>${items.map(keyDateHTML).join('')}`:'';
  }
}

/* ---------- Explore lists (rendered from data) ---------- */
let exploreScope=localStorage.getItem('tripExploreScope')||'route';
function exploreCityOrder(){
  const route=myRoute(), rest=CITIES.filter(c=>!route.includes(c));
  return [...route, ...rest.filter(c=>TD.cities[c].country==='MY'), ...rest.filter(c=>TD.cities[c].country==='TH')];
}
function stateBtns(){return `<div class="state-actions"><button class="yes" onclick="setState(this,'done')" aria-label="Done">✓</button><button class="no" onclick="setState(this,'skip')" aria-label="Skip">✕</button></div>`}
function cityAttrs(c){const o=cityObj(c);return `data-city="${esc(c)}" data-country="${o.country}"`}
function routeKicker(c){
  const i=myRoute().indexOf(c), o=cityObj(c);
  return i>=0?`STOP ${i+1} ON YOUR ROUTE`:`${TD.countries[o.country].name.toUpperCase()} · ${esc(o.region).toUpperCase()}`;
}
function renderRouteCard(c){
  const o=cityObj(c), i=myRoute().indexOf(c);
  const list=a=>a&&a.length?`<ul>${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="route-p muted">—</p>';
  const sigs=a=>`<div class="signatures">${a.map(x=>`<span class="sig">${esc(x)}</span>`).join('')}</div>`;
  return `<article class="route-card stateable" data-key="${esc('route|'+c)}" ${cityAttrs(c)} style="--accent:${o.accent}">
    <div class="route-top">
      <button class="route-expand" onclick="togglePanel(this)" aria-expanded="false">
        <div class="route-num" data-route-num>${i>=0?i+1:o.emoji}</div>
        <div><span class="kicker" data-route-kicker>${routeKicker(c)}</span><h3>${esc(c)}</h3><p>${esc(o.tagline)}</p></div>
        <span class="chev">⌄</span>
      </button>${stateBtns()}
    </div>
    <div class="route-body">
      <div class="route-badges"><span class="base-badge">📍 Best base: ${esc(o.base)}</span></div>
      ${novBox(c)}
      <div class="job"><span>WHY GO</span><strong>${esc(o.why)}</strong></div>
      <h4>Famous for</h4>${sigs(o.famous)}
      ${o.next?`<h4>Best use of your time</h4><p class="route-p">${esc(o.next)}</p>`:''}
      <h4>Other areas to stay</h4>${list(o.altBases)}
      ${o.signatures.length?`<h4>Signature experiences</h4>${sigs(o.signatures)}`:''}
      ${o.ownTime.length?`<h4>Give these their own time</h4>${list(o.ownTime)}`:''}
      ${o.getThere?`<h4>Getting there</h4><p class="route-p">${esc(o.getThere)}</p>`:''}
      ${o.tips.length?`<h4>First-timer tips</h4>${list(o.tips)}`:''}
      ${o.avoid?`<div class="avoid">✦ ${esc(o.avoid)}</div>`:''}
      <div class="guide-actions">
        <button class="secondary-btn" onclick="goToCity('${jsq(c)}')">I’m here now</button>
        <button class="ghost-btn" onclick="openCityTab('stayeats','${jsq(c)}')">Food + stays</button>
        <button class="ghost-btn" onclick="openCityTab('activities','${jsq(c)}')">Things to do</button>
        <button class="ghost-btn" data-route-toggle onclick="toggleRouteCity('${jsq(c)}')">${i>=0?'✓ On my route':'＋ Add to route'}</button>
      </div>
    </div>
  </article>`;
}
function dietBadge(d){return d==='halal'?'<span class="badge diet-halal">HALAL</span>':d==='pork'?'<span class="badge diet-pork">PORK</span>':''}
function renderRecCard(c){
  const o=cityObj(c);
  const secs=[...REC_ORDER.filter(k=>o.recs[k]&&o.recs[k].length),...Object.keys(o.recs).filter(k=>!REC_ORDER.includes(k)&&o.recs[k].length)];
  return `<article class="city-rec-card" ${cityAttrs(c)} style="--accent:${o.accent}">
    <button class="city-rec-head" onclick="toggleCity(this)" aria-expanded="false"><div><span class="kicker">${flagOf(c)} EXPLORE</span><h3>${o.emoji} ${esc(c)}</h3><p>${esc(o.base)}</p></div><span class="chev">⌄</span></button>
    <div class="city-rec-body">${secs.map(sec=>`<div class="rec-section">
      <button class="section-toggle" onclick="toggleRecSection(this)" aria-expanded="false"><span>${esc(sec)}</span><b>${o.recs[sec].length}</b><i>⌄</i></button>
      <div class="rec-list">${o.recs[sec].map(r=>`<div class="rec-item stateable" data-key="${esc(`rec|${c}|${sec}|${r.name}`)}" data-diet="${r.diet||''}">
        <div class="rec-copy"><strong>${esc(r.name)}</strong><div><span class="badge">${esc(r.badge)}</span>${dietBadge(r.diet)}${r.src?`<a href="${esc(r.src)}" target="_blank" rel="noopener">source ↗</a>`:''}<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name+' '+c)}" target="_blank" rel="noopener">map ↗</a></div><p>${esc(r.note)}</p></div>${stateBtns()}
      </div>`).join('')}</div></div>`).join('')}</div>
  </article>`;
}
function renderActivityCard(c){
  const o=cityObj(c);
  return `<article class="activity-city" ${cityAttrs(c)} style="--accent:${o.accent}">
    <button class="activity-head" onclick="toggleActivity(this)" aria-expanded="false"><div><span class="kicker">${flagOf(c)} ACTIVITY BANK</span><h3>${o.emoji} ${esc(c)}</h3><p>${o.activities.length} possibilities · ${novBadge(c,true)}</p></div><span class="chev">⌄</span></button>
    <div class="activity-body">${o.activities.map(a=>`<div class="activity-row stateable" data-key="${esc(`act|${c}|${a.name}`)}" data-search="${esc(`${a.name} ${a.kind} ${a.when} ${a.cost}`.toLowerCase())}">
      <div class="act-copy"><strong>${esc(a.name)}</strong><div><span class="cost ${a.costClass}">${esc(a.cost)}</span><span>${esc(a.kind)}</span></div><small>${esc(a.when)}</small></div>${stateBtns()}
    </div>`).join('')}</div>
  </article>`;
}
function renderClusterCard(c){
  const o=cityObj(c); if(!o.clusters.length)return '';
  return `<article class="cluster-card" ${cityAttrs(c)} style="--accent:${o.accent}"><h3>${o.emoji} ${esc(c)}</h3>${o.clusters.map((x,i)=>`<div class="cluster-row stateable" data-key="${esc(`cluster|${c}|${i}`)}"><span>${esc(x)}</span>${stateBtns()}</div>`).join('')}</article>`;
}
function renderExploreContent(){
  const order=exploreCityOrder();
  const put=(id,fn)=>{const el=document.getElementById(id);if(el)el.innerHTML=order.map(fn).join('')};
  put('routeList',renderRouteCard); put('stayeatsList',renderRecCard); put('activitiesList',renderActivityCard); put('clustersList',renderClusterCard);
  renderScopeChips(); applyExploreScope(); applyHidePork();
  const strip=document.getElementById('heroRouteStrip'); if(strip)strip.innerHTML=myRoute().map((c,i)=>`<span>${i+1}. ${esc(c)}</span>`).join('');
}
function paintAllStates(){
  document.querySelectorAll('.stateable').forEach(r=>paint(r,localStorage.getItem('trip3:'+r.dataset.key)||'open'));
  countAll();
}
/* Keep route numbers/kickers/buttons in sync without re-rendering (preserves open panels + states) */
function refreshExploreMeta(){
  const route=myRoute();
  document.querySelectorAll('#routeList .route-card').forEach(card=>{
    const c=card.dataset.city,i=route.indexOf(c);
    const num=card.querySelector('[data-route-num]'); if(num)num.textContent=i>=0?i+1:(cityObj(c)?.emoji||'');
    const k=card.querySelector('[data-route-kicker]'); if(k)k.textContent=routeKicker(c);
    const t=card.querySelector('[data-route-toggle]'); if(t)t.textContent=i>=0?'✓ On my route':'＋ Add to route';
  });
  // reorder cards to follow the route
  const order=exploreCityOrder();
  ['routeList','stayeatsList','activitiesList','clustersList'].forEach(id=>{
    const el=document.getElementById(id); if(!el)return;
    order.forEach(c=>{const card=el.querySelector(`[data-city="${CSS.escape(c)}"]`);if(card)el.appendChild(card)});
  });
  applyExploreScope();
  const strip=document.getElementById('heroRouteStrip'); if(strip)strip.innerHTML=route.map((c,i)=>`<span>${i+1}. ${esc(c)}</span>`).join('');
}
function renderScopeChips(){
  const opts=[['route','🗺 My route'],['MY','🇲🇾 Malaysia'],['TH','🇹🇭 Thailand'],['all','All 21']];
  document.querySelectorAll('.scope-chips').forEach(el=>{
    el.innerHTML=opts.map(([k,l])=>`<button class="${k===exploreScope?'on':''}" onclick="setExploreScope('${k}')">${l}</button>`).join('');
  });
}
function setExploreScope(s){exploreScope=s;localStorage.setItem('tripExploreScope',s);renderScopeChips();applyExploreScope()}
function cityInScope(c){
  if(exploreScope==='all')return true;
  if(exploreScope==='route')return myRoute().includes(c);
  return cityObj(c)?.country===exploreScope;
}
function applyExploreScope(){
  document.querySelectorAll('[data-city]').forEach(el=>{
    if(el.closest('#cityBrowserList'))return;
    el.classList.toggle('scope-out',!cityInScope(el.dataset.city));
  });
  countAll();
  const r=document.getElementById('activityResultCount'); if(r&&document.getElementById('activities').classList.contains('active'))applyActivityFilters();
}
function ensureCityInScope(c){
  if(!cityInScope(c))setExploreScope(myRoute().includes(c)?'route':cityObj(c).country);
}
function openCityTab(tab,c){
  ensureCityInScope(c);
  showTab(tab,document.getElementById('navExplore'));
  const box=document.getElementById({route:'routeList',stayeats:'stayeatsList',activities:'activitiesList',clusters:'clustersList'}[tab]);
  const card=box?.querySelector(`[data-city="${CSS.escape(c)}"]`); if(!card)return;
  const btn=card.querySelector('.route-expand,.city-rec-head,.activity-head'); btn?.setAttribute('aria-expanded','true');
  if(tab==='activities'){card.classList.remove('no-results')}
  setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'start'}),140);
}
function jumpRouteCity(city){openCityTab('route',city)}
function filterActivitiesByCity(city){openCityTab('activities',city)}

/* ---------- No-pork filter ---------- */
function setHidePork(on){localStorage.setItem('tripHidePork',on?'1':'0');applyHidePork()}
function applyHidePork(){
  const on=localStorage.getItem('tripHidePork')==='1';
  document.body.classList.toggle('hide-pork',on);
  const cb=document.getElementById('hidePork'); if(cb)cb.checked=on;
}

/* ---------- Essentials, phrasebook, currency ---------- */
let essCountry=null;
function setEssCountry(cc){essCountry=cc;renderEssentials()}
function renderEssentials(){
  if(!essCountry)essCountry=cityObj(guideCity)?.country||'MY';
  const sw=document.getElementById('essCountry');
  if(sw)sw.innerHTML=Object.entries(TD.countries).map(([cc,v])=>`<button class="${cc===essCountry?'on':''}" onclick="setEssCountry('${cc}')">${v.flag} ${v.name}</button>`).join('');
  const el=document.getElementById('essentialsList');
  if(el)el.innerHTML=(TD.essentials[essCountry]||[]).map(s=>`<div class="panel-card ess-card"><h3>${s.icon} ${esc(s.title)}</h3><ul>${s.items.map(i=>`<li>${i}</li>`).join('')}</ul>${s.links?`<div class="ess-links">${s.links.map(l=>`<a href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])} ↗</a>`).join('')}</div>`:''}</div>`).join('')
    +`<p class="hint">Entry rules change — always confirm on the official links before you fly. Checked October 2026.</p>`;
  renderPhrases(); renderKeyDates(); renderFx();
}
function renderPhrases(){
  const p=TD.phrases[essCountry]; const el=document.getElementById('phraseList'); if(!el||!p)return;
  document.getElementById('phraseLang').textContent=p.label;
  el.innerHTML=p.items.map((x,i)=>`<div class="phrase-row"><div><small>${esc(x[0])}</small><b>${esc(x[1])}</b>${x[2]!==x[1]?`<span class="native">${esc(x[2])}</span>`:''}</div><button aria-label="Say it" onclick="sayPhrase(${i})">🔊</button></div>`).join('');
}
function sayPhrase(i){
  const p=TD.phrases[essCountry]; const x=p.items[i];
  if(!('speechSynthesis' in window)){showToast('Your browser can’t speak — show the screen instead');return}
  const u=new SpeechSynthesisUtterance(x[2]); u.lang=p.lang; u.rate=.85;
  const v=speechSynthesis.getVoices().find(v=>v.lang&&v.lang.toLowerCase().startsWith(p.lang.slice(0,2)));
  if(v)u.voice=v; else showToast('No '+p.label.split(' ')[0]+' voice on this phone — showing the words is fine too');
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const FX_KEY='tripFxV1';
function fxCached(){try{return JSON.parse(localStorage.getItem(FX_KEY)||'null')}catch(e){return null}}
async function loadFx(force=false){
  const c=fxCached();
  if(c&&!force&&Date.now()-c.t<12*3600*1000)return c;
  try{
    const r=await fetch('https://open.er-api.com/v6/latest/USD',{cache:'no-store'});
    const j=await r.json(); if(j.result!=='success'||!j.rates)throw new Error('bad');
    const o={t:Date.now(),updated:j.time_last_update_utc,rates:{USD:1,MYR:j.rates.MYR,THB:j.rates.THB,PKR:j.rates.PKR,EUR:j.rates.EUR}};
    try{localStorage.setItem(FX_KEY,JSON.stringify(o))}catch(e){}
    return o;
  }catch(e){return c}
}
function fxConvert(amount,from,to,fx=fxCached()){
  if(!fx||!fx.rates[from]||!fx.rates[to])return null;
  return amount/fx.rates[from]*fx.rates[to];
}
function fxStamp(fx){
  if(!fx)return 'rates unavailable offline';
  const d=new Date(fx.updated||fx.t);
  return 'rates '+d.toLocaleDateString(undefined,{day:'numeric',month:'short'})+' · approx.';
}
async function renderFx(force=false){
  const el=document.getElementById('fxResult'); if(!el)return;
  const fx=await loadFx(force);
  document.getElementById('fxStamp').textContent=fxStamp(fx);
  const amt=Number(document.getElementById('fxAmount').value||0), from=document.getElementById('fxFrom').value, to=document.getElementById('fxTo').value;
  if(!fx){el.innerHTML='<span class="muted">Connect to the internet once to load exchange rates.</span>';return}
  const v=fxConvert(amt,from,to,fx);
  el.innerHTML=`<b>${money(amt)} ${from} ≈ ${money(Math.round(v*100)/100)} ${to}</b>`;
  const quick=document.getElementById('fxQuick');
  if(quick){
    const rows=[[10,'MYR'],[50,'MYR'],[100,'THB'],[500,'THB'],[1000,'THB']];
    quick.innerHTML=rows.map(([a,c])=>`<span>${c==='MYR'?'RM':'฿'}${a} ≈ <b>Rs ${money(Math.round(fxConvert(a,c,'PKR',fx)))}</b></span>`).join('');
  }
  renderWallet();
}
function swapFx(){const f=document.getElementById('fxFrom'),t=document.getElementById('fxTo');[f.value,t.value]=[t.value,f.value];renderFx()}
function approxHomeTotal(map){
  const fx=fxCached(); if(!fx)return null;
  const home=(appData().settings?.homeCurrency||'PKR').toUpperCase();
  if(!fx.rates[home])return null;
  let total=0;
  for(const [c,v] of Object.entries(map||{})){const x=fxConvert(Number(v),c,home,fx); if(x==null)return null; total+=x;}
  return {home,total,stamp:fxStamp(fx)};
}

/* ---------- Journey for any route ---------- */
function journeyOrder(j){const r=myRoute().slice();[...j.visited].forEach(c=>{if(!r.includes(c))r.push(c)});return r}
function journeyData(){
  let d=appData(),rows=journeyDoneRows(),plans=journeyCheckedPlans();
  let stopRows=[];
  Object.entries(d.journeyStops||{}).forEach(([date,arr])=>(arr||[]).forEach(s=>stopRows.push({
    city:s.city||'',name:s.place||'Stop',tags:classifyActivityText((s.type||'')+' '+(s.place||'')+' '+(s.note||'')),time:date+(s.time?'T'+s.time:'')
  })));
  // the same place can arrive via a ✓ mark, a checked-in plan and a logged stop — count it once
  const seen=new Set();
  let experiences=[...rows,...plans,...stopRows].filter(x=>{const k=(x.city+'|'+String(x.name||'').trim().toLowerCase());if(seen.has(k))return false;seen.add(k);return true});
  let byCity={}; CITIES.forEach(c=>byCity[c]={count:0,names:[],tags:{}});
  experiences.forEach(x=>{
    if(!byCity[x.city])return;
    byCity[x.city].count++;
    if(x.name&&!byCity[x.city].names.includes(x.name))byCity[x.city].names.push(x.name);
    (x.tags||[]).forEach(t=>byCity[x.city].tags[t]=(byCity[x.city].tags[t]||0)+1);
  });
  let visited=new Set();
  experiences.forEach(x=>{if(byCity[x.city])visited.add(x.city)});
  (d.rides||[]).forEach(x=>{if(byCity[x.city])visited.add(x.city)});
  (d.expenses||[]).forEach(x=>{if(byCity[x.city])visited.add(x.city)});
  let a=d.arrival;if(a?.city&&a.date&&a.date<=todayISO()&&byCity[a.city])visited.add(a.city);
  let mix={Adventure:0,Food:0,Social:0,Nightlife:0,Nature:0,Culture:0,Shopping:0,Cafe:0};
  experiences.forEach(x=>(x.tags||[]).forEach(t=>{if(t in mix)mix[t]++}));
  let activeDays=new Set();
  (d.expenses||[]).forEach(x=>x.date&&activeDays.add(x.date));
  (d.rides||[]).forEach(x=>x.date&&activeDays.add(x.date));
  Object.entries(d.dailyCheckins||{}).forEach(([date,s])=>{if((s.donePlans||[]).length||s.askedFood)activeDays.add(date)});
  Object.entries(d.journeyStops||{}).forEach(([date,arr])=>{if((arr||[]).length)activeDays.add(date)});
  return {d,experiences,byCity,visited,mix,activeDays};
}
function renderJourneyGraph(j){
  const el=document.getElementById('journeyGraph');if(!el)return;
  const order=journeyOrder(j), n=order.length, gap=96, W=Math.max(580,(n-1)*gap+96), y=48;
  const xs=order.map((_,i)=>n===1?W/2:48+i*((W-96)/(n-1)));
  let furthest=-1; order.forEach((c,i)=>{if(j.visited.has(c))furthest=Math.max(furthest,i)});
  const lineEnd=furthest>=0?xs[furthest]:xs[0];
  const nodes=order.map((c,i)=>{const v=j.visited.has(c),cnt=j.byCity[c]?.count||0;return `<g>
    <circle cx="${xs[i]}" cy="${y}" r="17" fill="${v?'#ffffff':'#334155'}" stroke="${v?'#ffffff':'#64748b'}" stroke-width="3"/>
    <text x="${xs[i]}" y="${y+4}" text-anchor="middle" font-size="9" font-weight="900" fill="${v?'#0f172a':'#cbd5e1'}">${cityShort(c)}</text>
    <text x="${xs[i]}" y="${y+36}" text-anchor="middle" font-size="9" font-weight="800" fill="#cbd5e1">${v?(cnt?cnt+' done':'visited'):'not yet'}</text></g>`}).join('');
  el.innerHTML=`<div class="journey-scroll"><svg viewBox="0 0 ${W} 102" style="min-width:${n>6?W*0.62:0}px" role="img" aria-label="Journey across your route">
    <line x1="${xs[0]}" y1="${y}" x2="${xs[n-1]}" y2="${y}" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
    <line x1="${xs[0]}" y1="${y}" x2="${lineEnd}" y2="${y}" stroke="#22c55e" stroke-width="5" stroke-linecap="round"/>${nodes}</svg></div>`;
}
function renderJourney(){
  renderDailyJourney();
  const root=document.getElementById('journeyGraph');if(!root)return;
  const j=journeyData(), route=myRoute(), order=journeyOrder(j);
  const onRouteVisited=route.filter(c=>j.visited.has(c)).length;
  document.getElementById('journeyCityCount').textContent=`${onRouteVisited} / ${route.length} cities`;
  document.getElementById('journeyPlaces').textContent=j.experiences.length;
  document.getElementById('journeyRides').textContent=j.d.rides.length;
  document.getElementById('journeyDays').textContent=j.activeDays.size;
  const h=document.getElementById('journeyHeadline'), vis=[...j.visited];
  if(!vis.length)h.textContent='Your journey is just getting started.';
  else if(onRouteVisited===route.length)h.textContent='You covered your whole route. Legends.';
  else if(vis.length<3)h.textContent=`You’ve started making ${vis.join(' + ')} yours.`;
  else h.textContent=`${vis.length} places in — your trip story is taking shape.`;
  renderJourneyGraph(j);
  const mixEl=document.getElementById('journeyMix');
  const mixRows=Object.entries(j.mix).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...mixRows.map(x=>x[1]));
  mixEl.innerHTML=mixRows.length?mixRows.map(([name,val])=>`<div class="journey-mix-row"><span>${esc(name)}</span><div class="journey-mix-track"><div class="journey-mix-fill" style="width:${Math.round(val/max*100)}%"></div></div><b>${val}</b></div>`).join(''):`<div class="empty-state">Mark activities ✓ as you do them and your experience mix will grow here.</div>`;
  document.getElementById('journeyCities').innerHTML=order.map(c=>{
    const x=j.byCity[c],visited=j.visited.has(c);
    const top=Object.entries(x.tags).sort((a,b)=>b[1]-a[1]).slice(0,3).map(t=>t[0]);
    return `<div class="journey-city-card ${visited?'visited':''}"><div class="journey-city-top"><strong>${cityObj(c).emoji} ${esc(c)}</strong><span class="journey-city-count">${visited?(x.count?x.count+' covered':'visited'):'not visited'}</span></div>
      <p>${x.names.length?`You logged: ${x.names.slice(0,3).map(esc).join(' · ')}`:visited?'You’ve reached this city. Mark things ✓ as you do them.':'Nothing logged here yet.'}${top.length?`<br>Mostly: ${top.map(esc).join(' · ')}`:''}</p></div>`;
  }).join('');
  const spend=spendMaps(j.d.expenses).all, approx=approxHomeTotal(spend);
  document.getElementById('journeySpend').innerHTML=`${esc(compactMoneyMap(spend,'Nothing logged yet'))}<small>${approx&&Object.keys(spend).length?`≈ ${approx.home} ${money(Math.round(approx.total))} (${approx.stamp}). `:''}Each currency is tracked separately; the converted total is only an estimate.</small>`;
}

/* ---------- Onboarding + selects ---------- */
function cityOptionsHTML(includeBlank){
  const route=myRoute(), rest=CITIES.filter(c=>!route.includes(c));
  const grp=(label,list)=>list.length?`<optgroup label="${esc(label)}">${list.map(c=>`<option>${esc(c)}</option>`).join('')}</optgroup>`:'';
  return (includeBlank?'<option value="">General / not set</option>':'')+grp('My route',route)+grp('More in Malaysia',rest.filter(c=>TD.cities[c].country==='MY'))+grp('More in Thailand',rest.filter(c=>TD.cities[c].country==='TH'));
}

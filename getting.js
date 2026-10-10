/* Getting around + tours + one-tap trip logging (v22).
   • "Getting around": every way between your stops (train, sleeper train, bus, overnight bus, ferry, speedboat,
     minivan, flight) with the operator's own booking link first, plus in-town options (Grab, Bolt, inDrive, metro…).
   • "Tours & day trips": real companies per city with WhatsApp / Instagram / Google Maps / booking links.
   • Trip logging: tapping any ride app, transit route or booking link remembers the trip. When you come back to the
     site it asks once — "Did you take it?" — and one tap logs the ride (Rides + Money + Journey) or adds the
     booking (Bookings + Money, and your plan follows it). Nothing is asked about booking codes or driver details.
   Loaded after routebuilder.js, before app.js. */

const MODE = {   // key → [icon, label, booking type used in Bookings]
  flight:['✈️','Flight','Flight'], train:['🚆','Train','Train'], 'sleeper-train':['🛏️','Sleeper train','Sleeper train'],
  bus:['🚌','Bus','Bus'], 'sleeper-bus':['🌙','Overnight bus','Sleeper bus'], ferry:['⛴️','Ferry','Ferry'],
  speedboat:['🚤','Speedboat','Speedboat'], minivan:['🚐','Minivan','Van'], taxi:['🚕','Taxi / Grab','Taxi']
};
const MODE_ICON = {Flight:'✈',Train:'🚆','Sleeper train':'🛏',Bus:'🚌','Sleeper bus':'🌙',Ferry:'⛴',Speedboat:'🚤',Van:'🚐',Taxi:'🚕'};
const LOCAL_ICON = {grab:'🚕',bolt:'🚗',indrive:'🚙',taxi:'🚖',metro:'🚇','airport-rail':'🚆',bus:'🚌',boat:'⛴️',songthaew:'🛻',tuktuk:'🛺','motorbike-taxi':'🛵',other:'🧭'};
const TOUR_ICON = {island:'🏝️',snorkel:'🤿',dive:'🤿',cruise:'⛵',trek:'🥾',culture:'🛕',food:'🍜',nature:'🌿',wildlife:'🐘',adventure:'🧗',class:'👩‍🍳'};
const BOLT_URL = 'https://bolt.eu/en/cities/';
const CUR_SYM = {MYR:'RM', THB:'฿'};
function curOf(city){ return TRAVEL_META[city]?.currency || 'MYR'; }
function curSym(city){ return CUR_SYM[curOf(city)] || curOf(city); }
function openUrl(u){ if(u) window.open(u, '_blank', 'noopener'); }
function gmapsSearch(q){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }

/* =====================================================================
   1. PENDING TRIP → "Did you take it?" on return
   ===================================================================== */
function setPendingTrip(p){
  const d = appData(); d.pendingTrip = Object.assign({id:uid(), at:new Date().toISOString(), date:todayISO()}, p); saveApp(d);
}
function pendingAgeMin(p){ return (Date.now() - new Date(p.at).getTime()) / 60000; }
function checkPendingTrip(){
  const d = appData(), p = d.pendingTrip; if(!p || !d.onboardingDone) return;
  const age = pendingAgeMin(p), maxAge = p.kind==='ride' ? 12*60 : 7*24*60;
  if(age > maxAge){ delete d.pendingTrip; saveApp(d); return; }
  if(age < 0.75) return;                                   // just switched apps for a second — ask next time
  if(document.getElementById('tripLogModal')?.classList.contains('open')) return;
  document.querySelectorAll('.modal-backdrop.open').forEach(m=>m.classList.remove('open'));   // back from Grab etc. — the ask sheet comes first
  renderTripLog(p); openModal('tripLogModal');
}
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') setTimeout(checkPendingTrip, 400); });
function tripTime(p){ return new Date(p.at).toTimeString().slice(0,5); }
function renderTripLog(p){
  const el = document.getElementById('tripLogBody'); if(!el) return;
  const sym = curSym(p.city||guideCity);
  if(p.kind==='ride'){
    const est = p.est ? `Estimate was ${p.est.cur}${p.est.lo}–${p.est.hi} — change it if you paid something else.` : 'Leave it empty if you don’t remember.';
    const mid = p.est ? Math.round((p.est.lo+p.est.hi)/2) : '';
    el.innerHTML = `<div class="tl-ic">${p.icon||'🚕'}</div>
      <h3>Did you take the ${esc(p.svc)}?</h3>
      <p class="tl-sub">${esc(p.from||'Your stay')} → ${esc(p.to||'…')} · ${tripTime(p)}</p>
      ${p.to?'':`<div class="field"><label>Where did you go?</label><input id="tlTo" placeholder="e.g. Petronas Twin Towers"></div>`}
      <div class="field"><label>Fare paid</label><div class="tl-money"><span>${sym}</span><input id="tlFare" type="number" inputmode="decimal" step="0.5" min="0" value="${mid}"></div></div>
      <small class="tl-hint">${esc(est)}</small>
      <button class="primary-btn full-btn" onclick="confirmTrip()">✓ Log it</button>
      <button class="on-skip" onclick="skipTrip()">No, I didn’t go</button>
      <p class="tl-foot">Goes to your rides, Money and today’s Journey map.</p>`;
  } else {
    const isTour = p.kind==='tour';
    el.innerHTML = `<div class="tl-ic">${isTour?'🎟':(MODE[p.mode]?.[0]||'🎫')}</div>
      <h3>Did you book ${isTour?'this tour':'it'}?</h3>
      <p class="tl-sub">${esc(p.title)}</p>
      <div class="compact-two">
        <div class="field"><label>${isTour?'Tour date':'Travel date'}</label><input id="tlDate" type="date" value="${p.travelDate||''}"></div>
        <div class="field"><label>Price paid (optional)</label><div class="tl-money"><span>${sym}</span><input id="tlFare" type="number" inputmode="decimal" min="0" placeholder="—"></div></div>
      </div>
      <button class="primary-btn full-btn" onclick="confirmTrip()">✓ Add to my bookings</button>
      <button class="on-skip" onclick="skipTrip()">Not yet</button>
      <p class="tl-foot">${isTour?'Shows in Bookings and Money.':'Your day plan follows it — no booking codes needed.'}</p>`;
  }
}
function skipTrip(){ const d = appData(); delete d.pendingTrip; saveApp(d); closeModal('tripLogModal'); }
function confirmTrip(){
  const d = appData(), p = d.pendingTrip; if(!p){ closeModal('tripLogModal'); return; }
  const amount = Number(document.getElementById('tlFare')?.value||0), city = p.city||guideCity, currency = curOf(city);
  if(p.kind==='ride'){
    const to = p.to || document.getElementById('tlTo')?.value.trim() || '';
    if(!to){ showToast('Where did you go?'); return; }
    const from = p.from || stayFor(city).label, date = p.date, time = tripTime(p), id = uid();
    d.rides.push({id, date, time, service:p.svc, city, from, to, fare:amount, currency, ref:'', paidBy:''});
    const stop = appendJourneyStopToData(d, date, city, to, 'Place', time, 'ride-log');
    if(stop && Number.isFinite(p.lat)){ stop.lat = p.lat; stop.lon = p.lon; }
    if(amount>0) d.expenses.push({id:uid(), date, city, category:'Ride', paidBy:'', title:`${p.svc}: ${from} → ${to}`, amount, currency, notes:'Logged after the ride', sourceKind:'rides', sourceId:id});
    delete d.pendingTrip; saveApp(d); closeModal('tripLogModal'); renderApp();
    showToast(`✓ ${p.svc} logged${amount>0?` · ${curSym(city)}${amount}`:''} — Money + Journey updated`);
    return;
  }
  const date = document.getElementById('tlDate')?.value;
  if(!date){ showToast('Pick the date'); return; }
  delete d.pendingTrip; saveApp(d);
  if(p.kind==='tour'){
    const d2 = appData();
    d2.tickets.push({id:uid(), kind:'other', type:'Activity', title:p.name, city, date, time:'', provider:p.op||'', amount, currency});
    if(amount>0) d2.expenses.push({id:uid(), date, city, category:'Activity', paidBy:'', title:p.name, amount, currency, notes:'Tour booking'});
    saveApp(d2); closeModal('tripLogModal'); renderApp(); showToast('✓ Tour added to your bookings');
    return;
  }
  addTravelBooking({type:MODE[p.mode]?.[2]||'Bus', from:p.from, to:p.to, date, provider:p.svc, amount, currency});
  closeModal('tripLogModal');
  if(document.getElementById('getting')?.classList.contains('active')) renderGetting();
}
/* Same as the booking form's travel path, without the form. */
function addTravelBooking({type, from, to, date, time='', provider='', amount=0, currency=''}){
  const prevSched = routeSchedule().map(x=>({...x}));
  const d = appData();
  const t = {id:uid(), kind:'travel', type, from, to, date, time, provider, amount, currency, title:`${placeName(from)} → ${placeName(to)}`};
  d.tickets.push(t);
  if(from===HOME) d.arrival = {city:to, date, time:'', airport:TRAVEL_META[to]?.airport||''};
  if(amount>0){ const city = to!==HOME ? to : from; d.expenses.push({id:uid(), date, city, category:'Flight / transport', paidBy:'', title:t.title, amount, currency:currency||curOf(city), notes:'Booking'}); }
  saveApp(d);
  const added = syncRouteWithBookings(prevSched);
  renderApp(); refreshExploreMeta();
  showToast(added.length ? `${added.join(', ')} added to your route — plan updated ✓` : `✓ ${type} booked — your day plan follows it`);
}

/* =====================================================================
   2. RIDES FROM THE DIRECTIONS SHEET
   ===================================================================== */
const RIDE_APPS = {
  grab:{svc:'Grab', icon:'🚕', url:c=>TRAVEL_META[c]?.grab},
  bolt:{svc:'Bolt', icon:'🚗', url:()=>BOLT_URL},
  indrive:{svc:'inDrive', icon:'🚙', url:c=>TRAVEL_META[c]?.indrive}
};
function dirPending(svc, icon, est){
  const st = dirState; if(!st) return;
  const b = st._b || null;
  setPendingTrip({kind:'ride', svc, icon, city:st.city, from:st.from==='here' ? 'Where you were' : stayFor(st.city).label,
    to:cleanPlace(st.label||st.dest), lat:b?.lat, lon:b?.lon, est});
}
/* Ride apps: copy the destination, open the app, remember the trip. */
function takeRideApp(key, est){
  const a = RIDE_APPS[key], st = dirState, name = st ? cleanPlace(st.label||st.dest) : '';
  if(name && navigator.clipboard) navigator.clipboard.writeText(name).catch(()=>{});
  if(st) dirPending(a.svc, a.icon, est); else setPendingTrip({kind:'ride', svc:a.svc, icon:a.icon, city:guideCity});
  showToast(name ? `“${name}” copied — paste it in ${a.svc}’s “Where to?”` : `Opening ${a.svc}…`);
  setTimeout(()=>openUrl(a.url(st?.city||guideCity)), 350);
}
/* Train / bus / walk: open Google Maps with the right travel mode, remember the trip (not for walking). */
function takeTransit(mode, label, icon, est){
  const st = dirState; if(!st) return;
  if(mode!=='walking') dirPending(label, icon, est);
  openUrl(st._o && st._b ? mapsLink(st._o, st._b, mode) : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((st.q||st.dest)+', '+st.city)}&travelmode=${mode}`);
}
/* No app needed (meter taxi, songthaew, tuk-tuk) — just remember it. */
function takeStreet(label, icon, est, tip){
  dirPending(label, icon, est); closeModal('dirModal');
  showToast(tip || `Have a good ride — we’ll ask about the fare when you’re back`);
}
/* Rows for the directions sheet, built from the fare estimates. */
function dirOptionRows(city, fares, walkMin, mode){
  const rows = [];
  const estOf = f => f ? {lo:f.range[0], hi:f.range[1], cur:f.cur} : null;
  const est = JSON.stringify.bind(JSON);
  fares.forEach(f=>{
    const e = est(estOf(f)).replace(/"/g,'&quot;');
    const price = `${f.cur}${f.range[0]}–${f.range[1]}`;
    if(f.app==='Grab') rows.push({ic:'🚕', name:'Grab', price, note:f.note, btn:'Open Grab', act:`takeRideApp('grab',${e})`});
    else if(f.app==='Bolt') rows.push({ic:'🚗', name:'Bolt', price, note:f.note, btn:'Open Bolt', act:`takeRideApp('bolt',${e})`});
    else if(/Train|BTS/.test(f.app)) rows.push({ic:'🚇', name:f.app, price, note:f.note, btn:'Route', act:`takeTransit('transit','${jsq(f.app.split(' (')[0])}','🚇',${e})`});
    else if(/taxi/i.test(f.app)) rows.push({ic:'🚖', name:f.app, price, note:f.note, btn:'Taking one', act:`takeStreet('Metered taxi','🚖',${e},'Say “meter please” — we’ll ask about the fare later')`});
    else if(/songthaew/i.test(f.app)) rows.push({ic:'🛻', name:f.app, price, note:f.note, btn:'Taking one', act:`takeStreet('Songthaew','🛻',${e},'Agree the price before you get in')`});
  });
  rows.splice(1, 0, {ic:'🚙', name:'inDrive', price:'you offer', note:'set your own price — drivers accept or counter', btn:'Open inDrive', act:`takeRideApp('indrive',null)`});
  if(walkMin<=30) rows.push({ic:'🚶', name:'Walk', price:fmtMin(walkMin), note:'free', btn:'Route', act:`takeTransit('walking','Walk','🚶',null)`});
  return `<div class="dir-ways"><div class="dir-fares-head">Ways to go <small>tap one — we’ll ask about the fare when you’re back</small></div>${rows.map(r=>`
    <div class="way-row"><span class="way-ic">${r.ic}</span><div class="way-copy"><b>${esc(r.name)}</b>${r.note?`<small>${esc(r.note)}</small>`:''}</div><em>${esc(r.price)}</em><button onclick="${r.act}">${esc(r.btn)}</button></div>`).join('')}
    <p class="dir-note">Estimates from published rates — the app shows the real price before you book.</p></div>`;
}

/* =====================================================================
   3. GETTING AROUND (between cities + in town)
   ===================================================================== */
let goTab = 'legs', goFocus = null, goOpen = {}, goShown = [];
function openGetting(from, to){
  goTab = 'legs'; goFocus = from && to ? from+'|'+to : null; if(goFocus) goOpen[goFocus] = true;
  showTab('getting', document.getElementById('navExplore')); renderGetting();
  if(goFocus) setTimeout(()=>document.querySelector(`[data-leg="${CSS.escape(goFocus)}"]`)?.scrollIntoView({behavior:'smooth', block:'start'}), 120);
}
function setGoTab(t){ goTab = t; renderGetting(); }
function legOptions(a, b){
  const L = TD.transport?.legs || [];
  let l = L.find(x=>x.a===a && x.b===b); if(l) return {o:l.o, rev:false};
  l = L.find(x=>x.a===b && x.b===a); if(l) return {o:l.o, rev:true};
  return null;
}
function airportLeg(city){ return (TD.transport?.legs||[]).find(x=>x.b===city && /airport|KLIA/i.test(x.a)); }
function bookedLeg(a, b){ return travelBookings().find(t=>t.from===a && t.to===b); }
function routeLegs(){
  const s = routeSchedule(), out = [];
  for(let i=1;i<s.length;i++) out.push({a:s[i-1].city, b:s[i].city, date:s[i].from});
  return out;
}
function optRowHTML(o, ref, rev){
  const m = MODE[o.m] || ['🧭', o.m, 'Bus'];
  const meta = [o.d, o.p, !rev && o.at ? 'from '+o.at : ''].filter(Boolean).join(' · ');
  const btn = o.u ? `<button class="go-book" onclick="goBook(${ref})">${o.off?'Book ↗':'Compare ↗'}</button>` : '';
  return `<div class="go-opt"><span class="go-ic">${m[0]}</span><div class="go-copy" onclick="this.classList.toggle('full')"><b>${esc(m[1])} · ${esc(o.n)}</b>${meta?`<small>${esc(meta)}</small>`:''}${o.tip?`<em>${esc(o.tip)}</em>`:''}${o.off?'':'<i class="go-agg">booking site, not the operator</i>'}</div>${btn}</div>`;
}
function legCardHTML(leg, n){
  const key = leg.a+'|'+leg.b, data = legOptions(leg.a, leg.b), bk = bookedLeg(leg.a, leg.b);
  const open = goOpen[key] ?? (!bk && !Object.keys(goOpen).length && n===1);
  let body;
  if(data){
    const opts = data.o.map((o,i)=>({o,i})).sort((x,y)=>(y.o.off?1:0)-(x.o.off?1:0));
    const more = goOpen[key+'|all'] ? opts : opts.slice(0,4);
    body = more.map(({o})=>{ goShown.push({o, a:leg.a, b:leg.b, date:leg.date}); return optRowHTML(o, goShown.length-1, data.rev); }).join('')
      + (opts.length>more.length ? `<button class="go-more" onclick="goOpen['${jsq(key)}|all']=true;renderGetting()">＋ ${opts.length-more.length} more ways</button>` : '')
      + (data.rev ? '<p class="go-rev">Same operators run this way too — departure piers/terminals differ, check on the booking page.</p>' : '');
  } else {
    const q = encodeURIComponent(`${leg.a} to ${leg.b}`);
    body = `<p class="go-none">No direct route on file for this pair.</p><div class="go-none-actions">
      <button onclick="openUrl('https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(leg.a)}&destination=${encodeURIComponent(leg.b)}&travelmode=transit')">Google Maps ↗</button>
      <button onclick="openUrl('https://12go.asia/en/search?q=${q}')">12Go ↗</button></div>`;
  }
  const count = data ? `${data.o.length} ways` : 'no data';
  return `<article class="go-leg ${open?'open':''}" data-leg="${esc(key)}">
    <button class="go-leg-head" onclick="goOpen['${jsq(key)}']=${!open};renderGetting()">
      <span class="go-n">${n}</span><div><b>${esc(leg.a)} → ${esc(leg.b)}</b><small>${leg.date?new Date(leg.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})+' · ':''}${count}</small></div>
      ${bk?`<span class="go-booked">✓ ${esc(bk.type||'booked')}</span>`:'<span class="chev">⌄</span>'}</button>
    ${open?`<div class="go-opts">${body}</div>`:''}</article>`;
}
function renderGetting(){
  const el = document.getElementById('goBody'); if(!el) return;
  document.querySelectorAll('#goTabs button').forEach(b=>b.classList.toggle('on', b.dataset.t===goTab));
  goShown = [];
  if(goTab==='town'){ el.innerHTML = townHTML(); return; }
  const legs = routeLegs(), first = routeSchedule()[0]?.city;
  const air = first ? airportLeg(first) : null;
  let html = '';
  if(air){
    const key = air.a+'|'+air.b, open = !!goOpen[key];
    html += `<article class="go-leg ${open?'open':''}" data-leg="${esc(key)}"><button class="go-leg-head" onclick="goOpen['${jsq(key)}']=${!open};renderGetting()"><span class="go-n">🛬</span><div><b>${esc(air.a)} → ${esc(air.b)}</b><small>when you land · ${air.o.length} ways</small></div><span class="chev">⌄</span></button>
      ${open?`<div class="go-opts">${air.o.map(o=>{ goShown.push({o, a:air.a, b:air.b, date:tripDates().start, airport:true}); return optRowHTML(o, goShown.length-1, false); }).join('')}</div>`:''}</article>`;
  }
  html += legs.length ? legs.map((l,i)=>legCardHTML(l, i+1)).join('') : '<div class="empty-state">Add a second city to your route to see ways between them.</div>';
  const others = (TD.transport?.legs||[]).filter(x=>!/airport|KLIA/i.test(x.a) && !legs.some(l=>(l.a===x.a&&l.b===x.b)||(l.a===x.b&&l.b===x.a)));
  html += `<details class="go-others"><summary>Other routes <small>${others.length}</small></summary>${others.map(x=>legCardHTML({a:x.a, b:x.b, date:''}, '·')).join('')}</details>`;
  el.innerHTML = html;
}
function goBook(i){
  const g = goShown[i]; if(!g) return;
  const o = g.o, m = MODE[o.m] || ['🧭', o.m];
  const isRide = g.airport || o.m==='taxi' || !TD.cities[g.a] || !TD.cities[g.b];
  if(isRide) setPendingTrip({kind:'ride', svc:o.n, icon:m[0], city:TD.cities[g.b]?g.b:g.a, from:g.a, to:g.b});
  else setPendingTrip({kind:'intercity', mode:o.m, svc:o.n, from:g.a, to:g.b, city:g.b, travelDate:g.date||'', title:`${m[1]} · ${o.n} · ${g.a} → ${g.b}`});
  openUrl(o.u);
}
const TOWN_KEYS = {'Kuala Lumpur':/Rapid KL|KLIA/i, 'Bangkok':/Bangkok|BKK|DMK|BTS|MRT|SRT|Chao Phraya/i, 'Phuket':/Phuket/i, 'Chiang Mai':/Chiang Mai/i,
  'Krabi':/Krabi|Ao Nang/i, 'Penang':/Penang/i, 'Melaka':/Melaka/i, 'Langkawi':/Langkawi/i};
function townHTML(){
  const c = guideCity, cc = cityObj(c).country;
  const list = (TD.transport?.local||[]).filter(l=>{
    if(l.c!==cc) return false;
    const hits = Object.entries(TOWN_KEYS).filter(([,re])=>re.test(l.n)).map(([k])=>k);
    return !hits.length || hits.includes(c);
  });
  const appKey = l => ({grab:'grab', bolt:'bolt', indrive:'indrive'})[l.m];
  return `<div class="go-town-head">${cityObj(c).emoji} <b>${esc(c)}</b> <button class="head-link" onclick="openCitySheet({mode:'go',title:'Getting around in…'})">Change</button></div>`
    + list.map((l,i)=>{
      const k = appKey(l);
      const btn = k ? `<button class="go-book" onclick="takeTownApp('${k}')">Open ↗</button>` : l.u ? `<button class="go-book ghost" onclick="openUrl('${jsq(l.u)}')">Info ↗</button>` : '';
      return `<div class="go-opt"><span class="go-ic">${LOCAL_ICON[l.m]||'🧭'}</span><div class="go-copy"><b>${esc(l.n)}</b>${l.fare?`<small>${esc(l.fare)}</small>`:''}${l.tip?`<em>${esc(l.tip)}</em>`:''}</div>${btn}</div>`;
    }).join('')
    + `<p class="go-rev">For a specific place, use <b>Where to?</b> on Home — it shows distance, fares and the easiest way from your stay.</p>`;
}
function takeTownApp(k){
  const a = RIDE_APPS[k];
  setPendingTrip({kind:'ride', svc:a.svc, icon:a.icon, city:guideCity, from:stayFor(guideCity).label});
  openUrl(k==='bolt' ? BOLT_URL : a.url(guideCity));
}

/* =====================================================================
   4. TOURS & DAY TRIPS
   ===================================================================== */
function renderTours(){
  const el = document.getElementById('toursBody'); if(!el) return;
  const c = xpCity(), list = TD.tours?.[c] || [];
  document.querySelectorAll('#tours .xp-picker').forEach(p=>{ p.innerHTML = citySwitchHTML(c,'pickExploreCity()',{label:'Change'}) + routeDotsHTML(c,'setExploreCity'); });
  if(!list.length){
    el.innerHTML = `<div class="empty-state">${cityObj(c)?.nov?.fit==='closed' ? `${esc(c)} is closed for the monsoon in November — boats and tours don’t run.` : `No tour companies on file for ${esc(c)} yet — see Things to do.`}</div>`;
    return;
  }
  el.innerHTML = list.map((t,i)=>{
    const wa = t.wa ? (/^\d+$/.test(t.wa) ? `https://wa.me/${t.wa}?text=${encodeURIComponent(`Hi! I'd like to ask about "${t.n}" for 2 people. Is it available on [date]?`)}` : t.wa) : null;
    const act = [
      wa ? `<a class="t-wa" href="${esc(wa)}" target="_blank" rel="noopener" onclick="tourPending('${jsq(c)}',${i})">WhatsApp</a>` : t.tel ? `<a class="t-tel" href="tel:${esc(t.tel)}" onclick="tourPending('${jsq(c)}',${i})">Call</a>` : '',
      t.ig ? `<a href="${esc(t.ig)}" target="_blank" rel="noopener">Instagram</a>` : '',
      `<a href="${esc(gmapsSearch(t.maps))}" target="_blank" rel="noopener">Google Maps</a>`,
      t.line ? `<a href="${esc(t.line)}" target="_blank" rel="noopener">LINE</a>` : '',
      t.web ? `<a href="${esc(t.web)}" target="_blank" rel="noopener" onclick="tourPending('${jsq(c)}',${i})">Website</a>` : '',
      t.book ? `<a class="t-book" href="${esc(t.book)}" target="_blank" rel="noopener" onclick="tourPending('${jsq(c)}',${i})">Book ↗</a>` : ''
    ].filter(Boolean).join('');
    return `<article class="tour">
      <div class="tour-top"><span class="tour-ic">${TOUR_ICON[t.k]||'🧭'}</span><div><b>${esc(t.n)}</b><small>${esc(t.op)}${t.r?` · ★ ${esc(t.r.replace('★',''))}`:''}</small></div></div>
      ${t.w?`<p class="tour-what">${esc(t.w)}</p>`:''}
      <div class="tour-meta">${t.d?`<span>⏱ ${esc(t.d)}</span>`:''}${t.p?`<span>💵 ${esc(t.p)}</span>`:''}${t.f?`<span>📍 ${esc(t.f)}</span>`:''}</div>
      ${t.h?`<div class="tour-halal">☪︎ ${esc(t.h)}</div>`:''}
      ${t.note?`<div class="tour-note">💡 ${esc(t.note)}</div>`:''}
      <div class="tour-actions">${act}</div></article>`;
  }).join('');
}
function tourPending(city, i){
  const t = TD.tours?.[city]?.[i]; if(!t) return;
  setPendingTrip({kind:'tour', city, name:t.n, op:t.op, title:`${t.n} · ${t.op}`, travelDate:''});
}
function toursCount(c){ return (TD.tours?.[c]||[]).length; }
window.addEventListener('load', ()=>setTimeout(checkPendingTrip, 1200));

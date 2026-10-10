/* Planner v18
   • Bookings (no flight numbers) → trip dates, route order and nights
   • Day-by-day plan built from the route: arrival/travel days stay light, weekly markets and festivals land on the right days
   • "Where to?" — distance from your stay, the easiest way for a tourist, fare estimates, one tap into Grab / Maps
   • Place search for stays (hotels, condos, apartments) with map pins
   • Review-ranked top picks
   Loaded after features.js + journey.js, before app.js. Everything runs at call time. */

const HOME = 'Home';
const PHOTON = 'https://photon.komoot.io/api/';
const OSRM = 'https://routing.openstreetmap.de';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const RAIL_CITIES = ['Kuala Lumpur','Bangkok'];
const ISLAND_PRICING = ['Phuket','Krabi','Koh Phi Phi','Koh Samui','Koh Phangan','Koh Tao'];
const NORTH_PRICING = ['Chiang Mai','Pai','Chiang Rai'];
const SLOT_LABEL = {morning:'Morning', afternoon:'Afternoon', evening:'Sunset & dinner', night:'Night'};
const SLOT_ICON = {morning:'🌅', afternoon:'☀️', evening:'🌇', night:'🌙'};

/* ---------- memo on stored data (cheap: recomputes only when saved data changes) ---------- */
const _memo = {};
function memoData(key, fn){
  const raw = localStorage.getItem(APP_KEY) || '';
  const m = _memo[key];
  if(m && m.raw === raw) return m.val;
  const val = fn(); _memo[key] = {raw, val}; return val;
}
const _static = {};
function memoStatic(key, fn){ return key in _static ? _static[key] : (_static[key] = fn()); }
function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return Math.abs(h); }
function placeName(x){ return x===HOME ? 'Home' : x; }
function fetchT(url, ms=7000, opts={}){
  const c = new AbortController(); const t = setTimeout(()=>c.abort(), ms);
  return fetch(url, {...opts, signal:c.signal}).finally(()=>clearTimeout(t));
}
function hourBucket(hhmm){
  if(!hhmm) return '';
  const h = parseInt(hhmm.split(':')[0],10);
  return h<12?'Morning':h<17?'Afternoon':h<21?'Evening':'Late night';
}

/* =====================================================================
   1. BOOKINGS → ROUTE
   ===================================================================== */
function travelBookings(){
  return memoData('tr', ()=> (appData().tickets||[]).filter(t=>t.kind==='travel'&&t.date&&t.from&&t.to)
    .sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))));
}
function stayBookings(){ return memoData('st', ()=> (appData().tickets||[]).filter(t=>t.kind==='stay'&&t.date&&t.city)); }
function bookingAnchors(){
  return memoData('anch', ()=>{
    const tr = travelBookings(), out = {start:null, end:null, arrive:{}, src:{}};
    const outb = tr.filter(t=>t.from===HOME&&t.to!==HOME), inb = tr.filter(t=>t.to===HOME&&t.from!==HOME);
    if(outb.length) out.start = outb[0].date;
    if(inb.length) out.end = inb[inb.length-1].date;
    tr.forEach(t=>{
      if(t.to===HOME || !TD.cities[t.to]) return;
      if(out.end && t.date>=out.end) return;          // same-day connection on the way home
      if(!out.arrive[t.to]){ out.arrive[t.to]=t.date; out.src[t.to]=t; }
    });
    [...stayBookings()].sort((a,b)=>a.date.localeCompare(b.date)).forEach(s=>{
      if(!out.arrive[s.city]){ out.arrive[s.city]=s.date; out.src[s.city]=s; }
    });
    return out;
  });
}
function computeSchedule(r){
  const {start, end, bookedEnd} = tripDates(), a = bookingAnchors(), n = routeNights();
  const rows = []; let cur = start;
  r.forEach(c=>{
    const from = a.arrive[c] || cur;
    rows.push({city:c, from, booked:!!a.arrive[c]});
    cur = addDays(from, n[c] ?? (TD.defaultNights[c] ?? 2));
  });
  rows.forEach((row,i)=>{
    const next = rows[i+1];
    if(next){ row.to = next.from; row.locked = next.booked; row.until = next.city; }
    else { row.to = bookedEnd ? end : addDays(row.from, n[row.city] ?? 2); row.locked = bookedEnd; row.until = bookedEnd ? HOME : null; }
    row.nights = daysBetween(row.from, row.to);
    row.conflict = row.nights < 0;
    if(row.conflict){ row.to = row.from; row.nights = 0; }
  });
  return rows;
}
/* The city you fly home from (unless you only connect through it that day) */
function homeDepartureCity(){
  const tr = travelBookings(), inb = tr.filter(t=>t.to===HOME && t.from!==HOME); if(!inb.length) return null;
  const last = inb[inb.length-1], transit = tr.some(t=>t.to===last.from && t.date===last.date);
  return transit ? null : last.from;
}
/* Put newly booked cities on the route and order everything by date.
   Unbooked cities keep the dates they had before this booking, so they move with their neighbours. */
function syncRouteWithBookings(prevSched){
  const a = bookingAnchors(); const r = myRoute().slice(); const added = [];
  Object.keys(a.arrive).forEach(c=>{ if(!r.includes(c)){ r.push(c); added.push(c); } });
  const prev = {}; (prevSched || computeSchedule(r)).forEach(x=>prev[x.city]=x.from);
  const homeFrom = homeDepartureCity();
  const items = r.map((c,i)=>{
    let key = a.arrive[c] || prev[c] || '9999';
    if(c===homeFrom) key = (a.arrive[c] && Object.values(a.arrive).every(d=>d<=a.arrive[c])) ? a.arrive[c] : '9999~';
    return {c, i, booked:!!a.arrive[c], key};
  });
  items.sort((x,y)=> x.key<y.key?-1 : x.key>y.key?1 : (x.booked!==y.booked ? (x.booked?-1:1) : x.i-y.i));
  const nr = items.map(x=>x.c);
  if(nr.join('|')!==myRoute().join('|')) saveRoute(nr);
  if(added.length){ const d = appData(); const cc = new Set(tripCountries()); added.forEach(c=>cc.add(TD.cities[c].country)); d.countries = [...cc]; rebalanceNights(d); saveApp(d); }
  return added;
}
function suggestNextLeg(){
  const a = bookingAnchors(), sched = routeSchedule(), {end} = tripDates();
  if(!sched.length) return {from:HOME, to:guideCity, date:tripDates().start};
  if(!a.start) return {from:HOME, to:sched[0].city, date:sched[0].from};
  for(let i=1;i<sched.length;i++) if(!sched[i].booked) return {from:sched[i-1].city, to:sched[i].city, date:sched[i].from};
  const last = sched[sched.length-1];
  return {from:last.city, to:HOME, date:a.end ? end : last.to};
}

/* ---------- onboarding helpers ---------- */
function suggestRoute(land, home){
  const R = TD.route, i = R.indexOf(land), j = R.indexOf(home);
  if(land===home) return [land];
  if(i>=0 && j>=0 && i<j) return R.slice(i, j+1);
  return [land, home];
}
function fitNights(route, total){
  const base = route.map(c=>TD.defaultNights[c] ?? 3), sum = base.reduce((a,b)=>a+b,0) || 1;
  const n = base.map(b=>Math.max(1, Math.round(b*total/sum)));
  let diff = total - n.reduce((a,b)=>a+b,0), guard = 0;
  while(diff!==0 && guard++<200){
    const i = n.indexOf(Math.max(...n));
    if(diff>0){ n[i]++; diff--; } else if(n[i]>1){ n[i]--; diff++; } else break;
  }
  const out = {}; route.forEach((c,i)=>out[c]=n[i]); return out;
}

/* ---------- booking modal ---------- */
let bookKind = 'travel';
function setBookKind(k){
  bookKind = k;
  document.querySelectorAll('#bookKinds button').forEach(b=>b.classList.toggle('on', b.dataset.kind===k));
  ['travel','stay','other'].forEach(x=>document.querySelectorAll('.bk-'+x).forEach(el=>el.classList.toggle('hidden', x!==k)));
}
function bookingCityOptions(withHome){
  return (withHome?`<option value="${HOME}">🏠 Home</option>`:'') + cityOptionsHTML(false);
}
function prepareBookingModal(pre){
  pre = pre || window._bookPrefill || null; window._bookPrefill = null;
  bkFrom.innerHTML = bookingCityOptions(true); bkTo.innerHTML = bookingCityOptions(true);
  bkStayCity.innerHTML = cityOptionsHTML(false); bkOtherCity.innerHTML = cityOptionsHTML(false);
  const g = pre && pre.kind!=='stay' && pre.kind!=='other' ? pre : suggestNextLeg();
  bkFrom.value = g.from; bkTo.value = g.to; bkDate.value = g.date || '';
  bkMode.value = 'Flight';
  bkGuess.textContent = pre ? '' : 'We filled in your next leg from the plan — change anything.';
  const sc = (pre && pre.city) || guideCity, sched = routeSchedule().find(x=>x.city===sc);
  bkStayCity.value = sc; bkPlace.value = (pre && pre.place) || ''; delete bkPlace.dataset.lat; delete bkPlace.dataset.lon;
  bkIn.value = sched ? sched.from : ''; bkOut.value = sched ? sched.to : '';
  bkOtherCity.value = sc; bkTitle.value = (pre && pre.title) || ''; bkOtherDate.value = (pre && pre.date) || todayISO();
  setBookKind(pre && pre.kind ? pre.kind : 'travel');
  delete bkDate.dataset.touched;
  if(!bkTo.dataset.wired){
    bkTo.dataset.wired = '1';
    bkTo.addEventListener('change', ()=>{
      if(bkDate.dataset.touched) return;
      const s = routeSchedule().find(x=>x.city===bkTo.value);
      if(bkTo.value===HOME) bkDate.value = tripDates().end; else if(s) bkDate.value = s.from;
    });
    bkDate.addEventListener('input', ()=>{ bkDate.dataset.touched = '1'; });
    bkStayCity.addEventListener('change', ()=>{
      const s = routeSchedule().find(x=>x.city===bkStayCity.value);
      bkIn.value = s ? s.from : ''; bkOut.value = s ? s.to : '';
      bkPlace.value = ''; delete bkPlace.dataset.lat; delete bkPlace.dataset.lon;
    });
  }
}
function openBookingFor(pre){ window._bookPrefill = pre; openModal('ticketModal'); }
function submitBooking(e){
  e.preventDefault();
  const prevSched = routeSchedule().map(x=>({...x}));
  const d = appData(), kind = bookKind;
  const amount = Number(ticketAmount.value||0), currency = (ticketCurrency.value||'').trim().toUpperCase(), time = ticketTime.value, provider = ticketProvider.value.trim();
  const t = {id:uid(), kind, time, provider, amount, currency};
  if(kind==='travel'){
    const from = bkFrom.value, to = bkTo.value, date = bkDate.value;
    if(!date){ showToast('Pick the travel date'); return; }
    if(from===to){ showToast('From and To are the same'); return; }
    Object.assign(t, {type:bkMode.value, from, to, date, title:`${placeName(from)} → ${placeName(to)}`});
    if(from===HOME) d.arrival = {city:to, date, time:hourBucket(time), airport:TRAVEL_META[to]?.airport||''};
  } else if(kind==='stay'){
    const city = bkStayCity.value, place = bkPlace.value.trim(), date = bkIn.value, out = bkOut.value;
    if(!place || !date){ showToast('Add the place and the check-in date'); return; }
    if(out && out<=date){ showToast('Check-out should be after check-in'); return; }
    const lat = parseFloat(bkPlace.dataset.lat), lon = parseFloat(bkPlace.dataset.lon), pinned = Number.isFinite(lat);
    Object.assign(t, {type:'Hotel', city, place, date, checkout:out||'', title:place}, pinned?{lat,lon}:{});
    const cs = d.citySetup[city] || {}; cs.stay = place; if(pinned){ cs.lat=lat; cs.lon=lon; } else { delete cs.lat; delete cs.lon; }
    d.citySetup[city] = cs;
  } else {
    const title = bkTitle.value.trim(), date = bkOtherDate.value;
    if(!title){ showToast('What is the ticket for?'); return; }
    Object.assign(t, {type:'Activity', title, city:bkOtherCity.value, date});
  }
  d.tickets.push(t);
  if(amount>0){
    const city = t.city || (t.to && t.to!==HOME ? t.to : t.from!==HOME ? t.from : '');
    d.expenses.push({id:uid(), date:t.date||todayISO(), city, category:kind==='stay'?'Stay':kind==='travel'?'Flight / transport':'Activity', paidBy:'', title:t.title, amount, currency:currency||TRAVEL_META[city||guideCity]?.currency||'', notes:'Auto-counted from booking', sourceKind:'tickets', sourceId:t.id});
  }
  saveApp(d);
  const added = kind==='other' ? [] : syncRouteWithBookings(prevSched);
  ticketForm.reset(); delete bkPlace.dataset.lat; delete bkPlace.dataset.lon;
  closeModal('ticketModal'); renderApp(); refreshExploreMeta();
  showToast(kind==='other' ? 'Ticket saved ✓' : added.length ? `${added.join(', ')} added to your route — plan updated ✓` : 'Saved — your day plan now follows it ✓');
}

/* =====================================================================
   2. DAY-BY-DAY PLAN
   ===================================================================== */
function tripDays(){
  return memoData('days', ()=>{
    const {start, end} = tripDates(), tr = travelBookings(), sched = routeSchedule();
    const n = Math.max(0, daysBetween(start, end)), days = [];
    const first = sched[0]?.city || null, last = sched.length ? sched[sched.length-1].city : null;
    for(let i=0;i<=n;i++){
      const date = addDays(start, i);
      const sleep = i<n ? cityOnDate(date) : null, prev = i>0 ? cityOnDate(addDays(date,-1)) : null;
      let kind = 'full';
      if(i===0) kind = 'arrive'; else if(i===n) kind = 'leave'; else if(!sleep) kind = 'free'; else if(prev && prev!==sleep) kind = 'move';
      const city = kind==='leave' ? (prev||last) : (sleep||prev||first);
      let leg = null;
      if(kind==='arrive') leg = tr.find(t=>t.date===date && t.from===HOME) || null;
      else if(kind==='leave') leg = tr.find(t=>t.date===date && t.to===HOME) || null;
      else if(kind==='move') leg = tr.find(t=>t.date===date && t.to===sleep) || null;
      days.push({date, dayNo:i+1, total:n+1, city, from:prev, to:sleep, kind, leg});
    }
    return days;
  });
}
function dayFor(date){ return tripDays().find(x=>x.date===date) || null; }
function arrivalBucket(day){
  if(day.leg?.time) return hourBucket(day.leg.time);
  const a = appData().arrival; if(a && a.city===day.city && a.time) return a.time;
  return 'Afternoon';
}
function slotsFor(day){
  if(day.kind==='arrive'){ const t = arrivalBucket(day); return t==='Morning'?['afternoon','evening'] : t==='Late night'?[] : t==='Evening'?['night'] : ['evening']; }
  if(day.kind==='leave') return ['morning'];
  if(day.kind==='move') return ['morning','evening'];
  if(day.kind==='free') return [];
  return ['morning','afternoon','evening','night'];
}
function bucketOf(text){
  const t = (text||'').toLowerCase();
  if(/after 9|late|club|bar\b|nightlife|after 10|10 pm|11 pm/.test(t)) return 'night';
  if(/night/.test(t) && !/night market/.test(t)) return 'night';
  if(/sunset|evening|dinner|night market|after dark|after sunset/.test(t)) return 'evening';
  if(/sunrise|morning|early|before 9|before 10|opening/.test(t)) return 'morning';
  if(/afternoon|midday|rain backup|indoor|shopping day|anytime/.test(t)) return 'afternoon';
  return 'flex';
}
const LONG_RX = /full day|dedicated|day trip|own day|half day|permits|overnight|3–4 days|in season only/i;
const DAYW = {sunday:0,sun:0,monday:1,mon:1,tuesday:2,tue:2,wednesday:3,wed:3,thursday:4,thu:4,friday:5,fri:5,saturday:6,sat:6};
function allowedDays(text){
  const t = String(text||'').toLowerCase();
  if(/weekend/.test(t)) return [0,6];
  const m = t.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*[–-]\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*/);
  if(m){ const a = DAYW[m[1]], b = DAYW[m[2]], out = []; for(let i=a, g=0; g<8; i=(i+1)%7, g++){ out.push(i); if(i===b) break; } return out; }
  const found = [...t.matchAll(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)s?\b/g)].map(x=>DAYW[x[1]]);
  return found.length ? found : null;
}
const KEY_STOP = /\b(the|one|a|an|day|days|sunrise|sunset|morning|evening|night|nights|trip|tour|time|block|visit|only|early|late)\b/g;
function nameKeys(name){
  return String(name).toLowerCase().replace(/\(.*?\)/g,'').split(/\s*(?:\+|\/|,|&|→|—| or | and )\s*/)
    .map(x=>x.replace(/[^a-z0-9' ]/g,'').replace(KEY_STOP,'').replace(/\s+/g,' ').trim()).filter(x=>x.length>=4);
}
function keysClash(a, b){
  return a.some(x=>b.some(y=>{
    if(x===y) return true;
    const [s1, l1] = x.length<=y.length ? [x,y] : [y,x];
    return s1.length>=5 && (l1.startsWith(s1+' ') || l1.endsWith(' '+s1));
  }));
}
function cityPool(city){
  return memoStatic('pool:'+city, ()=>{
    const o = cityObj(city); if(!o) return [];
    const seen = new Set(), items = [];
    const sigKeys = (o.signatures||[]).map(nameKeys);
    const push = (name, extra)=>{ const k = name.toLowerCase(); if(seen.has(k)) return; seen.add(k); items.push({name, city, ...extra}); };
    (o.picks||[]).forEach(p=>push(p.name, {why:p.why, kind:p.kind, when:p.why, tags:p.tags||[], sig:true, outdoorHint:p.weather==='outdoor', long:/day trip|full day|dedicated|half day/i.test(p.kind+' '+p.why)}));
    (o.activities||[]).forEach(a=>push(a.name, {why:'', kind:a.kind, when:a.when, cost:a.cost, tags:classifyActivityText(`${a.name} ${a.kind} ${a.when}`), long:LONG_RX.test(a.when||'')}));
    (o.night||[]).forEach(n=>push(n.name, {why:n.why, when:'night '+n.time, tags:['Nightlife','Social'], night:true}));
    return items.map(x=>{
      const txt = `${x.name} ${x.kind||''} ${x.when||''}`, keys = nameKeys(x.name);
      const outdoor = x.outdoorHint || (/beach|trail|hike|waterfall|park|garden|snork|kayak|island|mangrove|skybridge|viewpoint|hill|cape|pool|caves?\b|temple|mountain|gunung|doi |village|nature|forest|jungle|elephant|zipline|dive|scuba/i.test(txt) && !/museum|mall|massage|spa|club|café|cafe|market/i.test(txt));
      return {...x, keys, days:allowedDays(`${x.name} ${x.when||''}`), sig:x.sig || sigKeys.some(k=>keysClash(k, keys)), bucket:x.night?'night':bucketOf(txt), outdoor};
    });
  });
}
function slotOk(it, slot){
  const b = it.bucket, tags = it.tags||[];
  if(it.long) return false;
  if(slot==='night') return b==='night' || tags.includes('Nightlife') || (tags.includes('Social') && !it.outdoor && b!=='morning');
  if(slot==='evening') return b==='evening' || (b==='night' && !tags.includes('Nightlife')) || (!it.outdoor && b!=='morning' && tags.some(t=>t==='Food'||t==='Shopping'||t==='Relax'||t==='Social'));
  return b!=='night' && b!=='evening';
}
const FILLER = {
  morning:{name:'Slow morning near your stay', why:'Breakfast, coffee, no alarm — you’ve earned a lazy start.', filler:true},
  afternoon:{name:'Pool, beach or nap time', why:'Keep the hottest hours easy — rain often hits mid-afternoon anyway.', filler:true},
  evening:{name:'Dinner near your stay', why:'Pick something from Food + where to stay for this city.', filler:true}
};
function slotScore(it, slot, ctx){
  let s = 0; const tags = it.tags||[];
  const want = {morning:['Adventure','Nature','Culture'], afternoon:['Culture','Food','Shopping','Cafe','Relax'], evening:['Food','Social','Relax','Nature'], night:['Nightlife','Social','Food']}[slot];
  want.forEach(t=>{ if(tags.includes(t)) s+=2; });
  if(it.bucket===slot) s+=5; else if(it.bucket==='flex') s+=1; else s-=2;
  if(it.sig) s+=3;
  (ctx.interests||[]).forEach(t=>{ if(tags.includes(t)) s+=1.5; });
  if(ctx.vibe && ctx.vibe!=='Balanced' && tags.includes(ctx.vibe)) s+=7;
  if(ctx.vibe==='Relax' && tags.includes('Adventure')) s-=2;
  if(ctx.wet && it.outdoor && slot==='afternoon') s-=3;
  if(ctx.light){ if(tags.includes('Adventure')) s-=5; if(it.outdoor) s-=3; if(tags.some(t=>t==='Food'||t==='Cafe'||t==='Culture')) s+=2; }
  s += (hashStr(it.name+'|'+ctx.date+'|'+(ctx.seed||0)) % 100) / 100 * 1.2;
  return s;
}
function pickFor(city, slot, ctx, usedKeys, wd){
  let best = null, bs = -1e9;
  cityPool(city).forEach(it=>{
    if(!slotOk(it, slot)) return;
    if(ctx.light && (it.outdoor || (it.tags||[]).includes('Adventure'))) return;
    if(it.days && !it.days.includes(wd)) return;
    if(usedKeys.some(k=>keysClash(k, it.keys))) return;
    const s = slotScore(it, slot, ctx); if(s>bs){ bs = s; best = it; }
  });
  return best;
}
function fixedFor(day, usedMarkets){
  const fx = {}; const wd = new Date(day.date+'T12:00:00').getDay();
  const slotCity = slot => day.kind==='move' ? (slot==='morning'?day.from:day.to) : day.city;
  TD.keyDates.forEach(k=>{
    const ev = TD.eventPlan?.[k.id]?.[day.date]; if(!ev) return;
    const city = slotCity(ev.slot); if(!city) return;
    const applies = k.cities ? k.cities.includes(city) : TD.cities[city]?.country===k.country;
    if(!applies || fx[ev.slot]) return;
    fx[ev.slot] = {name:ev.name, q:ev.q, city, why:ev.why||k.note, event:true, tags:['Culture','Social']};
  });
  const marketIn = new Set();
  (TD.weekly||[]).forEach(w=>{
    if(!w.days.includes(wd) || (usedMarkets && usedMarkets.has(w.name))) return;
    const city = slotCity(w.slot); if(w.city!==city || fx[w.slot] || marketIn.has(city)) return;
    fx[w.slot] = {name:w.name, q:`${w.name} ${w.where}`, city, why:`${w.why} ${w.time} · ${w.where}.`, market:true, tags:['Food','Shopping','Social']};
    marketIn.add(city); if(usedMarkets) usedMarkets.add(w.name);
  });
  return fx;
}
function cleanExcursion(s){ return String(s).replace(/^optional:\s*/i,'').trim(); }
function buildPlan(){
  return memoData('plan', ()=>{
    const d = appData(), days = tripDays(), over = d.itinOver||{}, vibes = d.itinVibe||{}, seeds = d.itinSeed||{}, interests = d.interests||[];
    const used = {}; const U = c => used[c] || (used[c] = []);
    Object.values(over).forEach(slots=>Object.values(slots||{}).forEach(v=>{ if(v && v.name && v.city) U(v.city).push(nameKeys(v.name)); }));
    const fullDays = {};
    days.forEach(dy=>{ if(dy.kind==='full') (fullDays[dy.city] = fullDays[dy.city] || []).push(dy.date); });
    const excursion = {};
    Object.entries(fullDays).forEach(([c,ds])=>{
      const own = (cityObj(c)?.ownTime||[]).filter(x=>!/^optional/i.test(x));
      if(ds.length>=3 && own[0]) excursion[ds[1]] = own[0];
      if(ds.length>=5 && own[1]) excursion[ds[3]] = own[1];
    });
    // reserve festival + market + excursion names first so nothing duplicates them
    const fixedByDay = {}, usedMarkets = new Set();
    days.forEach(dy=>{
      const fx = fixedFor(dy, usedMarkets);
      if(excursion[dy.date] && !(over[dy.date]||{}).morning && !fx.morning){
        const name = cleanExcursion(excursion[dy.date]);
        const q0 = name.split(/ OR | \+ |\//)[0].trim(), qk = nameKeys(q0);
        const places = [...(TD.topPicks?.[dy.city]||[]).map(p=>({name:p.name, q:p.q||p.name})), ...(cityObj(dy.city)?.picks||[]).map(p=>({name:p.name, q:p.name}))];
        const match = /hopping|block|spree|shopping|old bangkok/i.test(q0) ? null : places.find(p=>keysClash(nameKeys(p.name), qk));
        const known = !!match, q = match ? cleanPlace(match.q) : q0;
        fx.morning = {name, q, city:dy.city, why:known?'Give this its own day — leave early, back for dinner.':'A whole day for this — browse Things to do for where to go.', full:true, noGo:!known, tags:['Adventure','Nature']};
      }
      Object.values(fx).forEach(it=>U(it.city).push(nameKeys(it.name)));
      fixedByDay[dy.date] = fx;
    });
    const plan = {};
    days.forEach(dy=>{
      const out = [], fixed = fixedByDay[dy.date], o = over[dy.date] || {};
      const wd = new Date(dy.date+'T12:00:00').getDay();
      const ctxBase = {date:dy.date, seed:seeds[dy.date]||0, vibe:vibes[dy.date]||'Balanced', interests};
      slotsFor(dy).forEach(slot=>{
        const city = dy.kind==='move' ? (slot==='morning'?dy.from:dy.to) : dy.city;
        if(!city) return;
        if(slot==='afternoon' && (o.morning?.full || (!o.morning && fixed.morning?.full))) return;
        let item = o[slot] || fixed[slot];
        if(!item){
          const ctx = {...ctxBase, wet:['mixed','wet'].includes(cityObj(city)?.nov?.fit), light:(dy.kind==='move'||dy.kind==='leave')&&slot==='morning'};
          const best = pickFor(city, slot, ctx, U(city), wd);
          if(best){ item = best; U(city).push(best.keys); }
          else if(FILLER[slot] && (dy.kind==='full' || ctx.light)) item = {...FILLER[slot], city};
        }
        if(item) out.push({slot, city, item});
      });
      plan[dy.date] = {day:dy, slots:out};
    });
    return plan;
  });
}
function planFor(date){ return buildPlan()[date] || null; }

/* ---------- plan actions ---------- */
function itinStore(d, key){ d[key] = d[key] || {}; return d[key]; }
function swapSlot(date, slot){
  const p = planFor(date); const s = p?.slots.find(x=>x.slot===slot); if(!s) return;
  const usedKeys = [];
  Object.values(buildPlan()).forEach(pp=>pp.slots.forEach(x=>{ if(!(pp.day.date===date && x.slot===slot) && x.city===s.city && !x.item.filler) usedKeys.push(nameKeys(x.item.name)); }));
  const d = appData(), wd = new Date(date+'T12:00:00').getDay();
  const ctx = {date, seed:(d.itinSeed||{})[date]||0, vibe:(d.itinVibe||{})[date]||'Balanced', interests:d.interests||[], wet:['mixed','wet'].includes(cityObj(s.city)?.nov?.fit)};
  const ranked = cityPool(s.city).filter(it=>slotOk(it,slot) && (!it.days || it.days.includes(wd)) && !usedKeys.some(k=>keysClash(k,it.keys))).sort((a,b)=>slotScore(b,slot,ctx)-slotScore(a,slot,ctx));
  if(!ranked.length){ showToast('No other ideas for this slot'); return; }
  const i = ranked.findIndex(it=>it.name===s.item.name); const next = ranked[(i+1) % ranked.length];
  if(next.name===s.item.name){ showToast('That’s the only idea left for this slot'); return; }
  const over = itinStore(d,'itinOver'); over[date] = over[date] || {};
  over[date][slot] = {name:next.name, city:s.city, why:next.why||'', kind:next.kind||'', when:next.when||'', tags:next.tags||[]};
  saveApp(d); renderPlanViews();
}
function toggleSlotDone(date, slot){
  const p = planFor(date); const s = p?.slots.find(x=>x.slot===slot); if(!s) return;
  const d = appData(), done = itinStore(d,'itinDone'), k = date+'|'+slot;
  if(done[k]){ delete done[k]; saveApp(d); renderPlanViews(); return; }
  done[k] = true;
  if(s.item.filler){ saveApp(d); renderPlanViews(); return; }
  appendJourneyStopToData(d, date, s.city, s.item.q || s.item.name, s.item.market?'Shop':s.slot==='night'?'Activity':'Activity', date===todayISO()?nowHHMM():'', 'done-mark');
  saveApp(d); renderPlanViews(); renderJourney(); showToast('Done ✓ — added to your Journey');
}
function setDayVibe(vibe, btn){
  const d = appData(), date = curPlanDate(); itinStore(d,'itinVibe')[date] = vibe;
  if(d.itinOver) delete d.itinOver[date];
  saveApp(d); renderPlanViews();
}
function shuffleDay(){
  const d = appData(), date = curPlanDate(), seeds = itinStore(d,'itinSeed');
  seeds[date] = (seeds[date]||0) + 1; if(d.itinOver) delete d.itinOver[date];
  saveApp(d); renderPlanViews(); showToast('New ideas for this day');
}
function resetDay(){
  const d = appData(), date = curPlanDate();
  ['itinOver','itinVibe','itinSeed'].forEach(k=>{ if(d[k]) delete d[k][date]; });
  saveApp(d); renderPlanViews();
}

/* ---------- plan UI ---------- */
let planDateSel = null;
function curPlanDate(){
  if(planDateSel) return planDateSel;
  const {start, end} = tripDates(), t = todayISO();
  return t>=start && t<=end ? t : start;
}
function openDayPlan(date){ planDateSel = date || curPlanDate(); showTab('daybook', document.getElementById('navTrip')); }
function shiftPlanDay(delta){
  const {start, end} = tripDates(); let x = addDays(curPlanDate(), delta);
  if(x<start) x = start; if(x>end) x = end; planDateSel = x; renderDaybook();
}
function setPlanDate(v){ const {start,end} = tripDates(); if(v>=start && v<=end){ planDateSel = v; renderDaybook(); } }
function dayKindLine(day){
  if(day.kind==='arrive') return `✈ Land in ${day.city}`;
  if(day.kind==='leave') return `✈ Fly home from ${day.city}`;
  if(day.kind==='move') return `${modeIcon(day.leg)} ${day.from} → ${day.to}`;
  if(day.kind==='free') return 'Unplanned night — add a city or nights in My route';
  return '';
}
function modeIcon(leg){ return MODE_ICON[leg?.type] || '✈'; }
function travelRowHTML(day){
  if(!['arrive','leave','move'].includes(day.kind)) return '';
  const from = day.kind==='arrive' ? HOME : day.kind==='leave' ? day.city : day.from;
  const to = day.kind==='arrive' ? day.city : day.kind==='leave' ? HOME : day.to;
  const leg = day.leg;
  const status = leg ? `<span class="bk-ok">✓ booked${leg.time?' · '+esc(leg.time):''}${leg.type?' · '+esc(leg.type):''}</span>`
    : `<button class="bk-add" onclick="openBookingFor({from:'${jsq(from)}',to:'${jsq(to)}',date:'${day.date}'})">＋ Add this booking</button>`;
  const ways = day.kind==='move' && !leg ? `<button class="bk-ways" onclick="openGetting('${jsq(from)}','${jsq(to)}')">🚆 Ways to get there</button>` : '';
  return `<div class="travel-row"><div><b>${modeIcon(leg)} ${esc(placeName(from))} → ${esc(placeName(to))}</b><small>${leg?'Your plan follows this booking':'Not booked yet — dates are from your plan'}</small></div>${status}${ways}</div>`;
}
function slotCardHTML(date, s, compact){
  const it = s.item, done = !!(appData().itinDone||{})[date+'|'+s.slot];
  const badge = it.event ? '<span class="slot-badge ev">🏮 on this date</span>' : it.market ? '<span class="slot-badge mk">🛍 weekly market</span>' : it.full ? '<span class="slot-badge fd">full day</span>' : '';
  const why = it.why || [it.when, it.kind].filter(Boolean).join(' · ');
  if(compact) return `<div class="tp-slot ${done?'done':''}"><span class="tp-ic">${SLOT_ICON[s.slot]}</span><div class="tp-copy"><small>${SLOT_LABEL[s.slot]}${s.city!==guideCity&&compact==='home'?' · '+esc(s.city):''}</small><b>${esc(it.name)}</b></div>${it.filler||it.noGo?'':`<button onclick="openDirections('${jsq(it.q||it.name)}',{city:'${jsq(s.city)}',label:'${jsq(it.name)}'})">Go</button>`}</div>`;
  return `<div class="plan-slot ${s.slot} ${done?'done':''}">
    <div class="plan-slot-head"><span>${SLOT_ICON[s.slot]} ${SLOT_LABEL[s.slot].toUpperCase()}</span>${badge}</div>
    <h3>${esc(it.name)}</h3>${why?`<p>${esc(why)}</p>`:''}
    <div class="plan-slot-actions">
      ${it.filler?`<button class="go" onclick="openCityTab('stayeats','${jsq(s.city)}')">Food ideas</button>`:it.noGo?`<button class="go" onclick="openCityTab('activities','${jsq(s.city)}')">Ideas →</button>`:`<button class="go" onclick="openDirections('${jsq(it.q||it.name)}',{city:'${jsq(s.city)}',label:'${jsq(it.name)}'})">Go →</button>`}
      ${it.event||it.market?'':`<button onclick="swapSlot('${date}','${s.slot}')">↻ Swap</button>`}
      <button class="${done?'on':''}" onclick="toggleSlotDone('${date}','${s.slot}')">${done?'✓ Done':'✓'}</button>
    </div></div>`;
}
function renderDaybook(){
  const el = document.getElementById('dayBlueprint'); if(!el) return;
  const date = curPlanDate(), p = planFor(date);
  const inp = document.getElementById('dpDateInput'); if(inp){ const {start,end} = tripDates(); inp.min = start; inp.max = end; inp.value = date; }
  if(!p){ el.innerHTML = '<div class="empty-state">Set your trip dates in My trip to see a day plan.</div>'; return; }
  const dy = p.day, o = cityObj(dy.city);
  document.getElementById('dpKicker').textContent = `DAY ${dy.dayNo} OF ${dy.total}${date===todayISO()?' · TODAY':''}`;
  document.getElementById('dpCity').textContent = dy.kind==='move' ? `${dy.from} → ${dy.to}` : (dy.city||'—');
  document.getElementById('dpDateLabel').textContent = new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short', day:'numeric', month:'short'});
  document.getElementById('dpTravel').innerHTML = travelRowHTML(dy);
  const vibe = (appData().itinVibe||{})[date] || 'Balanced';
  document.querySelectorAll('#dayVibes button').forEach(b=>b.classList.toggle('on', b.dataset.vibe===vibe));
  const light = dy.kind==='arrive' ? `<div class="plan-note">🛬 Arrival day — kept light on purpose: check in, eat close by, sleep.</div>`
    : dy.kind==='leave' ? `<div class="plan-note">🧳 Leaving day — one easy thing, then head to the airport with time to spare.</div>`
    : dy.kind==='move' ? `<div class="plan-note">🧳 Travel day — a light morning, then settle in and keep the evening easy.</div>` : '';
  el.innerHTML = light + (p.slots.length ? p.slots.map(s=>slotCardHTML(date, s)).join('') : '<div class="empty-state">Nothing planned — rest, or tap Shuffle.</div>');
}
function renderItinerary(){
  const el = document.getElementById('itinList'); if(!el) return;
  const plan = buildPlan(), days = tripDays(), today = todayISO();
  const sub = document.getElementById('itinSub'); if(sub){ const {start,end} = tripDates(); sub.textContent = `${shortDate(start)} – ${shortDate(end)} · ${days.length} days`; }
  let lastCity = null, html = '';
  days.forEach(dy=>{
    const city = dy.kind==='move' ? dy.to : dy.city;
    if(city && city!==lastCity && dy.kind!=='leave'){
      const row = routeSchedule().find(x=>x.city===city), o = cityObj(city);
      html += `<div class="itin-city" style="--accent:${o?.accent||'#64748b'}">${o?.emoji||''} ${esc(city)}<small>${row?`${shortDate(row.from)} – ${shortDate(row.to)} · ${row.nights} night${row.nights===1?'':'s'}`:''}${row?.booked?' · ✈ booked':''}</small></div>`;
      lastCity = city;
    }
    const p = plan[dy.date], names = (p?.slots||[]).map(s=>s.item.name);
    const ev = (p?.slots||[]).find(s=>s.item.event), mk = (p?.slots||[]).find(s=>s.item.market);
    const flags = ev ? ' · 🏮 festival' : mk ? ' · 🛍 market' : '';
    const kl = dayKindLine(dy);
    const wd = new Date(dy.date+'T12:00:00');
    html += `<button class="itin-row ${dy.date===today?'today':''} ${dy.date<today?'past':''}" onclick="openDayPlan('${dy.date}')">
      <div class="itin-date"><b>${wd.getDate()}</b><small>${wd.toLocaleDateString(undefined,{weekday:'short'})}</small></div>
      <div class="itin-copy"><span>DAY ${dy.dayNo}${kl?' · '+esc(kl):''}${flags}</span><b>${esc(names[0]||'Rest / free time')}</b>${names.length>1?`<small>${names.slice(1).map(esc).join(' · ')}</small>`:''}</div>
      <span class="chev">›</span></button>`;
  });
  el.innerHTML = html || '<div class="empty-state">Add trip dates to build your plan.</div>';
}
function renderTodayPlan(){
  const el = document.getElementById('tpSlots'); if(!el) return;
  const {start, end} = tripDates(), t = todayISO(), title = document.getElementById('tpTitle'), sub = document.getElementById('todayDate');
  let date = t, label = '📅 Today’s plan';
  if(t<start){ date = start; label = '📅 Your first day'; }
  else if(t>end){ el.innerHTML = '<div class="empty-state">Trip complete — your Journey tab has the whole story.</div>'; if(title) title.textContent='📅 Trip complete'; return; }
  const p = planFor(date); if(title) title.textContent = label;
  if(sub) sub.textContent = p ? `Day ${p.day.dayNo} of ${p.day.total} · ${new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}` : '';
  if(!p){ el.innerHTML = ''; return; }
  const kl = dayKindLine(p.day);
  el.innerHTML = (kl?`<div class="tp-kind">${esc(kl)}${p.day.leg?' · ✓ booked':''}</div>`:'') +
    (p.slots.length ? p.slots.map(s=>slotCardHTML(date, s, 'home')).join('') : '<div class="empty-state">A free day — rest or explore.</div>');
  const btn = document.getElementById('tpOpen'); if(btn) btn.onclick = ()=>openDayPlan(date);
}
function renderPlanViews(){ renderDaybook(); renderItinerary(); renderTodayPlan(); }

/* =====================================================================
   3. PLACES: search, stays, geocoding
   ===================================================================== */
const ACC_LABEL = {hotel:'Hotel', hostel:'Hostel', guest_house:'Guesthouse', apartment:'Serviced apartment', motel:'Motel', chalet:'Chalet', resort:'Resort'};
function isAccommodation(r){ return (r.key==='tourism' && ACC_LABEL[r.val]) || (r.key==='building' && /apartments|residential|condominium/.test(r.val||'')) || (r.key==='leisure' && r.val==='resort'); }
function placeLabel(r){
  if(r.key==='tourism' && ACC_LABEL[r.val]) return ACC_LABEL[r.val];
  if(r.key==='building' && /apartments|residential|condominium/.test(r.val||'')) return 'Condo / apartments';
  if(r.key==='leisure' && r.val==='resort') return 'Resort';
  if(r.key==='place' || ['district','city','locality','county'].includes(r.type)) return 'Area';
  if(r.key==='railway' || r.key==='public_transport') return 'Station';
  if(r.key==='highway') return 'Street';
  const v = String(r.val||r.key||'place').replace(/_/g,' ');
  return v.charAt(0).toUpperCase()+v.slice(1);
}
async function photonSearch(q, city, limit=8){
  const c = (cityObj(city)||cityObj(guideCity)).coords, dd = 0.5;
  const bbox = [c.lon-dd, c.lat-dd, c.lon+dd, c.lat+dd].map(x=>x.toFixed(4)).join(',');
  const u = `${PHOTON}?q=${encodeURIComponent(q)}&lat=${c.lat}&lon=${c.lon}&limit=${limit}&lang=en&bbox=${bbox}`;
  const r = await fetchT(u, 6000); if(!r.ok) throw new Error('photon '+r.status);
  const j = await r.json();
  return (j.features||[]).map(f=>{
    const p = f.properties||{}, g = f.geometry?.coordinates||[];
    const street = p.street ? (p.housenumber ? p.housenumber+' ' : '')+p.street : '';
    const sub = [street, p.district||p.locality, p.city].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i && x!==p.name).join(', ');
    return {name:p.name||street, lat:g[1], lon:g[0], key:p.osm_key, val:p.osm_value, type:p.type, sub};
  }).filter(x=>x.name && Number.isFinite(x.lat));
}
function geoCache(){ try{ return JSON.parse(localStorage.getItem('tripGeoCacheV1')||'{}'); }catch(e){ return {}; } }
function saveGeoCache(c){ try{ localStorage.setItem('tripGeoCacheV1', JSON.stringify(c)); }catch(e){} }
function cleanPlace(s){
  return String(s||'').replace(/^[^\p{L}\p{N}]+/u,'').replace(/\(.*?\)/g,'').split(/ \+ | → | \/ | OR | — |: /)[0].replace(/\s+/g,' ').trim();
}
async function geocodeSmart(q, city){
  const name = cleanPlace(q); if(!name) return null;
  const key = (city+'|'+name).toLowerCase(), cache = geoCache();
  if(key in cache) return cache[key];
  let p = null;
  try{ const r = await photonSearch(name, city, 1); if(r[0]) p = [r[0].lat, r[0].lon]; }catch(e){}
  if(!p){ const words = name.split(' '); if(words.length>2){ try{ const r = await photonSearch(words.slice(0,2).join(' '), city, 1); if(r[0]) p = [r[0].lat, r[0].lon]; }catch(e){} } }
  if(!p && typeof geocodePlace==='function') p = await geocodePlace(name, city);
  if(p || navigator.onLine){ cache[key] = p; saveGeoCache(cache); }
  return p;
}
function stayFor(city){
  const s = appData().citySetup?.[city] || {}, base = selectedBaseArea(city) || CITY_META[city]?.base;
  return {label:s.stay || base || city, lat:s.lat, lon:s.lon, isStay:!!s.stay};
}
async function stayCoords(city){
  const s = stayFor(city);
  if(Number.isFinite(s.lat)) return {lat:s.lat, lon:s.lon};
  const p = await geocodeSmart(s.label, city); if(!p) return null;
  if(s.isStay){ const d = appData(); d.citySetup[city] = Object.assign(d.citySetup[city]||{}, {lat:p[0], lon:p[1]}); saveApp(d); }
  return {lat:p[0], lon:p[1]};
}
function setStay(city, place){
  const d = appData(), cs = d.citySetup[city] || {};
  cs.stay = place.name; if(Number.isFinite(place.lat)){ cs.lat = place.lat; cs.lon = place.lon; } else { delete cs.lat; delete cs.lon; }
  if(!cs.arrivalPoint) cs.arrivalPoint = TRAVEL_META[city]?.airport || '';
  d.citySetup[city] = cs; saveApp(d);
}
/* local suggestions: places the app already knows in this city */
function knownPlaces(city){
  return memoStatic('known:'+city, ()=>{
    const o = cityObj(city); if(!o) return [];
    const out = [], seen = new Set();
    const add = (name, label, q)=>{ const k = name.toLowerCase(); if(seen.has(k)) return; seen.add(k); out.push({name, label, q:q||name, local:true}); };
    (TD.topPicks?.[city]||[]).forEach(p=>add(p.name, 'Top pick', p.q));
    (o.picks||[]).forEach(p=>add(p.name, 'In your guide'));
    (o.activities||[]).forEach(a=>add(a.name, a.kind||'Activity'));
    Object.entries(o.recs||{}).forEach(([sec,arr])=>sec!=='Stay areas' && arr.forEach(r=>add(r.name, sec)));
    return out;
  });
}
function localMatches(q, city, mode){
  const t = q.trim().toLowerCase();
  if(mode==='stay'){
    const areas = (BASE_GUIDE[city]||[]).map(a=>({name:a.area, label:'Good area to stay · '+a.fit, area:true}));
    return t ? areas.filter(a=>a.name.toLowerCase().includes(t)) : areas;
  }
  if(!t) return [];
  return knownPlaces(city).filter(p=>p.name.toLowerCase().includes(t)).slice(0,5);
}
function attachPlaceSearch(input, {drop, getCity, mode, onPick}){
  if(!input || input.dataset.ps) return; input.dataset.ps = '1';
  let timer = null, seq = 0;
  const render = (items, note)=>{
    drop._items = items;
    drop.innerHTML = items.map((it,i)=>`<button type="button" data-i="${i}"><b>${esc(it.name)}</b><small>${esc([it.label, it.sub].filter(Boolean).join(' · '))}</small></button>`).join('')
      + (mode==='stay' ? `<button type="button" data-gps="1" class="pd-gps"><b>📍 I’m at my stay now</b><small>Pin it from your location — best for Airbnbs</small></button>` : '')
      + (note ? `<div class="pd-note">${note}</div>` : '');
    drop.classList.toggle('open', !!(items.length || note || mode==='stay'));
  };
  const run = ()=>{
    clearTimeout(timer); const q = input.value.trim(), my = ++seq, city = getCity();
    const local = localMatches(q, city, mode);
    if(q.length<3){ render(local.slice(0,5), mode==='stay' && !q ? 'Type a hotel, condo or building name — Airbnbs: use the building or street.' : ''); return; }
    render(local.slice(0,3), '<span class="pd-loading">Searching the map…</span>');
    timer = setTimeout(async ()=>{
      let res = [];
      try{ res = await photonSearch(q, city, 8); }catch(e){}
      if(my!==seq) return;
      res = res.map(r=>({...r, label:placeLabel(r)}));
      if(mode==='stay') res.sort((a,b)=>(isAccommodation(b)?1:0)-(isAccommodation(a)?1:0));
      const merged = [...local.slice(0,3), ...res.filter(r=>!local.some(l=>l.name.toLowerCase()===r.name.toLowerCase()))].slice(0,8);
      render(merged, merged.length ? '' : (navigator.onLine ? 'No match — try the building or street name.' : 'Offline — you can still save the name.'));
    }, 350);
  };
  input.addEventListener('input', ()=>{ delete input.dataset.lat; delete input.dataset.lon; run(); });
  input.addEventListener('focus', run);
  input.addEventListener('blur', ()=>setTimeout(()=>drop.classList.remove('open'), 200));
  drop.addEventListener('mousedown', e=>e.preventDefault());
  drop.addEventListener('click', async e=>{
    const b = e.target.closest('button'); if(!b) return;
    drop.classList.remove('open');
    if(b.dataset.gps){
      showToast('Finding you…');
      try{
        const p = await getPosition(); const lat = +p.coords.latitude.toFixed(6), lon = +p.coords.longitude.toFixed(6);
        const name = (await reverseName(lat, lon)) || 'My stay';
        onPick({name, lat, lon, label:'Pinned from your location'});
      }catch(err){ showToast(geoErrorText(err)); }
      return;
    }
    const it = drop._items[+b.dataset.i]; if(it) onPick(it);
  });
}
/* Home stay field */
function wireStaySearch(){
  const input = document.getElementById('quickStay'), drop = document.getElementById('quickStayDrop');
  attachPlaceSearch(input, {drop, mode:'stay', getCity:()=>guideCity, onPick:it=>{
    input.value = it.name;
    if(it.area){ chooseBaseArea(it.name); return; }
    setStay(guideCity, it); renderQuickStay(); renderStayAreas(); renderWhereTo();
    showToast(Number.isFinite(it.lat) ? '🏠 Stay saved and pinned ✓' : 'Stay saved ✓');
  }});
  const bk = document.getElementById('bkPlace'), bkd = document.getElementById('bkPlaceDrop');
  attachPlaceSearch(bk, {drop:bkd, mode:'stay', getCity:()=>document.getElementById('bkStayCity').value||guideCity, onPick:it=>{
    bk.value = it.name; if(Number.isFinite(it.lat)){ bk.dataset.lat = it.lat; bk.dataset.lon = it.lon; }
  }});
  const w = document.getElementById('whereInput'), wd = document.getElementById('whereDrop');
  attachPlaceSearch(w, {drop:wd, mode:'any', getCity:()=>guideCity, onPick:it=>{
    w.value = ''; w.blur();
    openDirections(it.q||it.name, {city:guideCity, label:it.name, coords:Number.isFinite(it.lat)?[it.lat,it.lon]:null});
  }});
}
function renderWhereTo(){
  const chips = document.getElementById('whereChips'); if(!chips) return;
  const s = stayFor(guideCity), from = document.getElementById('whereFrom');
  const area = selectedBaseArea(guideCity);
  if(from) from.textContent = s.isStay ? `from ${s.label} ✎` : area ? `from ${area} ✎` : '📍 Set your stay';
  chips.innerHTML = s.isStay ? `<button class="home-chip" onclick="goBackToStay()">🏠 Back to ${esc(s.label)}</button>` : '';
  chips.classList.toggle('hidden', !s.isStay);
}
async function goBackToStay(){
  const s = stayFor(guideCity), c = await stayCoords(guideCity);
  openDirections(s.label, {city:guideCity, from:'here', coords:c?[c.lat,c.lon]:null, label:'🏠 '+s.label});
}

/* =====================================================================
   4. DIRECTIONS + FARES
   ===================================================================== */
let dirState = null;
function openDirections(dest, opts={}){
  const city = opts.city || guideCity;
  dirState = {dest, q:cleanPlace(dest), label:opts.label||dest, city, from:opts.from||'stay', coords:opts.coords||null, token:Date.now()+Math.random()};
  openModal('dirModal'); renderDirLoading(); computeDirections(dirState);
}
function setDirFrom(f){ if(!dirState) return; dirState = {...dirState, from:f, token:Date.now()+Math.random()}; renderDirLoading(); computeDirections(dirState); }
function renderDirLoading(){
  const el = document.getElementById('dirBody'); if(!el || !dirState) return;
  el.innerHTML = dirHeader(dirState, null) + `<div class="dir-loading"><span class="spin"></span> Working out the easiest way…</div>`;
}
function dirHeader(st, originLabel){
  const s = stayFor(st.city);
  return `<div class="dir-head"><div class="dir-from">${st.from==='here'?'📍 Where you are':'🏠 '+esc(originLabel||s.label)}</div><div class="dir-arrow">↓</div><div class="dir-to">📍 ${esc(st.label)}</div></div>
    <div class="dir-toggle"><button class="${st.from!=='here'?'on':''}" onclick="setDirFrom('stay')">From my stay</button><button class="${st.from==='here'?'on':''}" onclick="setDirFrom('here')">From where I am</button></div>`;
}
async function routeOSRM(profile, a, b){
  try{
    const r = await fetchT(`${OSRM}/routed-${profile}/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`, 7000);
    if(!r.ok) return null; const j = await r.json(); const rt = j.routes?.[0]; if(!rt) return null;
    return {km:rt.distance/1000, min:rt.duration/60};
  }catch(e){ return null; }
}
async function nearStations(a, b){
  const q = `[out:json][timeout:8];(node["railway"="station"](around:1000,${a.lat},${a.lon});node["railway"="station"](around:1000,${b.lat},${b.lon}););out body;`;
  try{
    const r = await fetchT(`${OVERPASS}?data=${encodeURIComponent(q)}`, 9000); if(!r.ok) return null;
    const j = await r.json();
    const st = (j.elements||[]).filter(e=>Number.isFinite(e.lat)).map(e=>({name:e.tags?.['name:en']||e.tags?.name||'Station', lat:e.lat, lon:e.lon}));
    const nearest = p => st.map(s=>({...s, m:haversine([p.lat,p.lon],[s.lat,s.lon])})).filter(s=>s.m<=1000).sort((x,y)=>x.m-y.m)[0] || null;
    const A = nearest(a), B = nearest(b);
    if(!A || !B || A.name===B.name) return null;
    return {A, B};
  }catch(e){ return null; }
}
function meterTHB(km, min){
  let f = 35, rem = Math.max(0, km-1);
  for(const [len, rate] of [[9,6.5],[10,7],[20,8],[20,8.5],[20,9],[1e9,10.5]]){ const x = Math.min(rem, len); f += x*rate; rem -= x; if(rem<=0) break; }
  return f + 3*Math.max(0, min*0.3);
}
function fareOptions(city, km, min){
  const c = cityObj(city), out = [], R = (a,b)=>[Math.round(a), Math.round(b)];
  if(c.country==='MY'){
    if(city==='Langkawi'){ const lo = Math.max(10, 4+1.3*km); out.push({app:'Grab', range:R(lo, lo*1.4), cur:'RM'}); }
    else { const lo = Math.max(5, 2+0.25*km+0.43*min)+1; out.push({app:'Grab', range:R(lo, lo*1.5), cur:'RM', note:'more at peak hours / rain'}); }
    if(RAIL_CITIES.includes(city)) out.push({app:'Train (LRT/MRT/Monorail)', range:[1.2,5], cur:'RM', note:'per person'});
  } else if(ISLAND_PRICING.includes(city)){
    const lo = Math.max(100, 40+11*km), hi = Math.max(160, 70+16*km);
    out.push({app:'Grab', range:R(lo,hi), cur:'฿'}); out.push({app:'Bolt', range:R(lo*0.8, hi*0.9), cur:'฿', note:'usually 10–25% cheaper'});
  } else if(NORTH_PRICING.includes(city)){
    const lo = Math.max(60, 35+8*km), hi = Math.max(100, 60+14*km);
    out.push({app:'Grab', range:R(lo,hi), cur:'฿'}); out.push({app:'Bolt', range:R(lo*0.75, hi*0.85), cur:'฿', note:'often 20–30% cheaper'});
    if(km<=8) out.push({app:'Red songthaew', range:[30,60], cur:'฿', note:'per person — agree before you get in'});
  } else {
    const m = meterTHB(km, min);
    out.push({app:'Grab', range:R(m*1.1+20, m*1.6+20), cur:'฿'}); out.push({app:'Bolt', range:R(m, m*1.4), cur:'฿'});
    if(city==='Bangkok'){ out.push({app:'Metered taxi', range:R(m, m*1.15), cur:'฿', note:'say “meter please” + pay tolls'}); out.push({app:'BTS / MRT', range:[17,65], cur:'฿', note:'per person'}); }
  }
  return out;
}
function fmtMin(m){ m = Math.max(1, Math.round(m)); return m<60 ? `${m} min` : `${Math.floor(m/60)} h ${m%60?m%60+' min':''}`.trim(); }
function fmtKm(km){ return km<1 ? `${Math.round(km*1000)} m` : `${km.toFixed(km<10?1:0)} km`; }
async function computeDirections(st){
  const tok = st.token;
  let o = null, oLabel = '';
  if(st.from==='here'){
    try{ const p = await getPosition(); o = {lat:p.coords.latitude, lon:p.coords.longitude}; oLabel = 'Where you are'; }
    catch(e){ showToast(geoErrorText(e)); st.from = 'stay'; }
  }
  if(!o){ oLabel = stayFor(st.city).label; o = await stayCoords(st.city); }
  let b = st.coords ? {lat:st.coords[0], lon:st.coords[1]} : null;
  if(!b){ const p = await geocodeSmart(st.q, st.city); if(p) b = {lat:p[0], lon:p[1]}; }
  if(tok!==dirState?.token) return;
  if(!o || !b){ renderDirFallback(st, oLabel, !o, !b); return; }
  const straight = haversine([o.lat,o.lon],[b.lat,b.lon]) / 1000;
  const [car, foot] = await Promise.all([routeOSRM('car', o, b), straight<5 ? routeOSRM('foot', o, b) : Promise.resolve(null)]);
  if(tok!==dirState?.token) return;
  const carKm = car?.km ?? straight*1.35, carFree = car?.min ?? (carKm/30*60);
  const carMin = carFree*1.35 + 3;                         // city traffic + pickup
  const walkKm = foot?.km ?? straight*1.25, walkMin = foot?.min ?? (walkKm/4.8*60);
  let stations = null;
  if(RAIL_CITIES.includes(st.city) && carKm>=2.5 && navigator.onLine) stations = await nearStations(o, b);
  if(tok!==dirState?.token) return;
  renderDirResult({st, o, b, oLabel, carKm, carMin, walkKm, walkMin, stations, approx:!car});
}
function mapsLink(o, b, mode){ return `https://www.google.com/maps/dir/?api=1&origin=${o.lat},${o.lon}&destination=${b.lat},${b.lon}&travelmode=${mode}`; }
function renderDirResult(r){
  const el = document.getElementById('dirBody'); if(!el) return;
  const {st, o, b, carKm, carMin, walkKm, walkMin, stations} = r, city = st.city;
  st._o = o; st._b = b;
  let best, mode;
  const trainTotal = stations ? (stations.A.m*1.25/80 + stations.B.m*1.25/80 + carKm/30*60 + 6) : null;
  if(walkMin<=15 || walkKm<=1.2){ best = {ic:'🚶', title:`Walk — ${fmtMin(walkMin)}`, line:`${fmtKm(walkKm)} on foot. Easiest and free.`}; mode = 'walking'; }
  else if(stations && trainTotal < carMin*1.8){
    const wa = Math.round(stations.A.m*1.25/80), wb = Math.round(stations.B.m*1.25/80);
    best = {ic:'🚇', title:`Train — about ${fmtMin(trainTotal)}`, line:`Walk ${Math.max(1,wa)} min to <b>${esc(stations.A.name)}</b> → ride to <b>${esc(stations.B.name)}</b> → walk ${Math.max(1,wb)} min. Google Maps shows the exact line and any change.`};
    mode = 'transit';
  } else { best = {ic:'🚕', title:`Grab — about ${fmtMin(carMin)}`, line:`${fmtKm(carKm)} by road. Easiest door to door${city==='Bangkok'?' — but avoid 5–8 pm traffic, take BTS/MRT then':''}.`}; mode = 'driving'; }
  const fares = fareOptions(city, carKm, (carMin-3)/1.35);
  const alt = [];
  if(mode!=='walking' && walkMin<=30) alt.push(`🚶 Walk ${fmtMin(walkMin)}`);
  if(mode!=='driving') alt.push(`🚕 Grab ~${fmtMin(carMin)}`);
  el.innerHTML = dirHeader(st, r.oLabel) + `
    <div class="dir-stats"><div><b>${fmtKm(carKm)}</b><span>by road</span></div><div><b>${fmtMin(carMin)}</b><span>by car</span></div><div><b>${walkMin<=90?fmtMin(walkMin):'—'}</b><span>walking</span></div></div>
    <div class="dir-best"><span class="dir-ic">${best.ic}</span><div><small>EASIEST FOR YOU</small><b>${best.title}</b><p>${best.line}</p>${alt.length?`<p class="dir-alt">Also: ${alt.join(' · ')}</p>`:''}</div></div>
    ${dirOptionRows(city, fares, walkMin, mode)}
    <div class="dir-actions one">
      <button class="go" onclick="window.open('${mapsLink(o,b,mode)}','_blank','noopener')">Open in Google Maps →</button>
    </div>
    <p class="dir-credit">${r.approx?'Distances estimated · ':''}Routes © OSRM/FOSSGIS · Places © OpenStreetMap</p>`;
}
function c_th(city){ return cityObj(city)?.country==='TH'; }
function renderDirFallback(st, oLabel, noOrigin, noDest){
  const el = document.getElementById('dirBody'); if(!el) return;
  const s = stayFor(st.city), m = TRAVEL_META[st.city];
  const gm = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(st.from==='here'?'':s.label+', '+st.city)}&destination=${encodeURIComponent(st.q+', '+st.city)}&travelmode=transit`;
  el.innerHTML = dirHeader(st, oLabel) + `<div class="dir-best warn"><span class="dir-ic">🗺</span><div><small>${navigator.onLine?'COULDN’T PIN IT EXACTLY':'OFFLINE'}</small>
    <b>${noDest?`Couldn’t find “${esc(st.q)}” on the map`:`Couldn’t place your stay`}</b>
    <p>${noOrigin?'Pick your stay from the list on Home (or tap 📍 at your stay) for exact distances. ':''}Google Maps will search it for you.</p><p class="dir-alt">${esc(m?.advice||'')}</p></div></div>
    <div class="dir-actions"><button class="go" onclick="window.open('${gm}','_blank','noopener')">Google Maps →</button><button onclick="takeRideApp('grab',null)">Grab</button>${c_th(st.city)?`<button onclick="takeRideApp('bolt',null)">Bolt</button>`:''}<button onclick="takeRideApp('indrive',null)">inDrive</button></div>`;
}
function openRideApp(app){ takeRideApp(app, null); }

/* =====================================================================
   5. TOP PICKS (review-ranked)
   ===================================================================== */
let picksCity = null;
let picksCat = (()=>{ try{ return localStorage.getItem('tripPicksCat') || 'must'; }catch(e){ return 'must'; } })();
const PICK_CATS = [['must','⭐','Must-do'],['hike','🥾','Hikes & views'],['cruise','⛵','Boats & parties'],['festival','🏮','Festivals']];
function picksCities(){ const keys = Object.keys(TD.topPicks||{}); return [...myRoute().filter(c=>keys.includes(c)), ...keys.filter(c=>!myRoute().includes(c))]; }
function setPicksCity(c){ picksCity = c; exploreCity = c; renderTopPicks(); }
function setPicksCat(k){ picksCat = k; try{ localStorage.setItem('tripPicksCat', k); }catch(e){} renderTopPicks(); }
/* Is the traveller in this city while the event is on? */
function pickWhen(city, p){
  if(!p.from) return '';
  const row = routeSchedule().find(x=>x.city===city);
  const on = row && p.from < row.to && (p.to||p.from) >= row.from;
  const tag = !row ? '' : on ? `<em class="pk-yes">✓ You’re here then</em>` : `<em class="pk-no">Not on your dates here</em>`;
  return `<div class="pk-when">📅 ${esc(p.dates||shortDate(p.from))} ${tag}</div>`;
}
function pickRating(r){
  const m = /^([\d.]+)★\s*·\s*(.*)$/.exec(r||''); if(!m) return '';
  return `<div class="pk-rate"><b>★ ${m[1]}</b> · ${esc(m[2])}</div>`;
}
function pickLinks(city, p){
  const q = encodeURIComponent((p.q||p.name)+(p.q&&p.q.includes(city)?'':' '+city));
  const links = [`<a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Google ↗</a>`];
  const ta = p.srcLabel==='Tripadvisor' && /Attraction_Review/.test(p.src||'') ? p.src : `https://www.tripadvisor.com/Search?q=${encodeURIComponent(p.name+' '+city)}`;
  if(p.cat!=='festival') links.push(`<a href="${esc(ta)}" target="_blank" rel="noopener">Tripadvisor ↗</a>`);
  if(p.src && !['Tripadvisor','Wanderlog','Google'].includes(p.srcLabel)) links.push(`<a href="${esc(p.src)}" target="_blank" rel="noopener">${esc(p.srcLabel||'Source')} ↗</a>`);
  return links.join('');
}
function renderTopPicks(){
  const body = document.getElementById('picksBody'); if(!body) return;
  const cities = picksCities(); if(!picksCity || !TD.cities[picksCity]) picksCity = cities.includes(guideCity) ? guideCity : cities[0];
  document.getElementById('picksCityPicker').innerHTML = citySwitchHTML(picksCity, `openCitySheet({mode:'picks',current:picksCity,title:'Top picks for…'})`, {label:'Change'}) + routeDotsHTML(picksCity, 'setPicksCity');
  const city = picksCity, picks = TD.topPicks[city] || [];
  const count = k => picks.filter(p=>p.cat===k).length;
  if(!count(picksCat)) picksCat = (PICK_CATS.find(([k])=>count(k)) || PICK_CATS[0])[0];
  const onDates = picks.some(p=>p.cat==='festival' && /pk-yes/.test(pickWhen(city,p)));
  const cats = document.getElementById('picksCats');
  if(cats) cats.innerHTML = PICK_CATS.map(([k,ic,label])=>`<button class="pk-cat ${k===picksCat?'on':''}" ${count(k)?'':'disabled'} onclick="setPicksCat('${k}')"><span>${ic}</span>${label}${k==='festival'&&onDates?'<i class="pk-dot" title="On your dates"></i>':''}</button>`).join('');
  const list = picks.filter(p=>p.cat===picksCat).slice(0,3);
  body.innerHTML = list.length ? list.map((p,i)=>`<article class="pk">
      <div class="pk-top"><span class="pk-medal">${['🥇','🥈','🥉'][i]}</span><b>${esc(p.name)}</b></div>
      ${pickRating(p.rating) || `<div class="pk-rate muted">Recommended by ${esc(p.srcLabel||'local guides')}</div>`}
      <p class="pk-famous">${esc(p.famous)}</p>
      ${pickWhen(city, p)}
      ${p.note?`<div class="pk-note">💡 ${esc(p.note)}</div>`:''}
      <div class="pk-links">${p.q?`<button class="go" onclick="openDirections('${jsq(p.q)}',{city:'${jsq(city)}',label:'${jsq(p.name)}'})">Go</button>`:''}${pickLinks(city, p)}</div>
    </article>`).join('')
    : `<div class="empty-state">Nothing ranked for ${esc(city)} here yet — try another activity.</div>`;
}

/* =====================================================================
   6. AUTO-CITY DURING THE TRIP + HERO
   ===================================================================== */
function autoCityForToday(){
  const t = todayISO(), {start, end} = tripDates(); if(t<start || t>end) return;
  const dy = dayFor(t); if(!dy) return;
  const c = dy.kind==='move' ? (new Date().getHours()<13 ? dy.from : dy.to) : dy.city;
  if(!c || !TD.cities[c]) return;
  const key = t+'|'+c; if(localStorage.getItem('tripAutoCity')===key) return;
  localStorage.setItem('tripAutoCity', key);
  if(c!==guideCity){ setGuideCity(c); showToast(`📍 Day ${dy.dayNo} — showing ${c}`); }
}
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible' && appData().onboardingDone){ autoCityForToday(); renderTodayPlan(); } });

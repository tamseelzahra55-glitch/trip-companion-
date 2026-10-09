/* Route builder — set up the trip like a multi-city flight search, minus "how many days where".
   Countries → leave home → stops in order → back home. Nights are split automatically
   (by how much there is to do in each place); fine-tuning is optional and tucked away.
   Used in first-time setup and in My trip → My route. Loaded after citysheet.js, before app.js. */

const SUGGESTED = {
  'MY+TH': null,                                   // = TD.route
  'MY': ['Kuala Lumpur','Melaka','Penang','Langkawi'],
  'TH': ['Bangkok','Chiang Mai','Phuket','Krabi']
};
const STARTERS = {MY:['Kuala Lumpur','Langkawi'], TH:['Bangkok','Chiang Mai','Phuket']};

/* ---------- shared helpers ---------- */
function tripCountries(){
  const d = appData();
  if(Array.isArray(d.countries) && d.countries.length) return d.countries.filter(c=>TD.countries[c]);
  const cc = [...new Set(myRoute().map(c=>TD.cities[c]?.country).filter(Boolean))];
  return cc.length ? cc : Object.keys(TD.countries);
}
function suggestedRouteFor(countries){
  const key = Object.keys(TD.countries).filter(c=>countries.includes(c)).join('+');
  return (SUGGESTED[key] || (key==='MY+TH' ? TD.route : null) || TD.route).slice();
}
function fitNightsWeighted(route, total, weights){
  const base = route.map(c=>Math.max(1, (weights && weights[c]) ?? TD.defaultNights[c] ?? 3));
  const sum = base.reduce((a,b)=>a+b,0) || 1;
  const n = base.map(b=>Math.max(1, Math.round(b*total/sum)));
  let diff = total - n.reduce((a,b)=>a+b,0), guard = 0;
  while(diff!==0 && guard++<300){
    if(diff>0){ const i = n.indexOf(Math.max(...n)); n[i]++; diff--; }
    else { let i = -1, best = 0; n.forEach((v,k)=>{ if(v>1 && v>=best){ best=v; i=k; } }); if(i<0) break; n[i]--; diff++; }
  }
  const out = {}; route.forEach((c,i)=>out[c]=n[i]); return out;
}
/* Re-split nights after the route or dates change. If you fine-tuned before, your proportions are kept. */
function rebalanceNights(d){
  d = d || appData();
  const route = (Array.isArray(d.route) && d.route.length ? d.route : TD.route).filter(c=>TD.cities[c]);
  const {start, end} = tripDates(); const total = Math.max(route.length, daysBetween(start, end));
  const weights = d.nightsManual ? Object.fromEntries(route.map(c=>[c, d.routeNights?.[c]])) : null;
  d.routeNights = fitNightsWeighted(route, total, weights);
  return d;
}
function nightsWord(n){ return `${n} night${n===1?'':'s'}`; }
function rbCityOptions(countries, exclude){
  return Object.keys(TD.cities).filter(c=>countries.includes(TD.cities[c].country) && !(exclude||[]).includes(c));
}

/* ---------- markup ---------- */
function rbHTML(m, ctx){
  const total = Math.max(0, daysBetween(m.start, m.end));
  const ccChips = Object.entries(TD.countries).map(([cc,v])=>`<button type="button" class="rb-cc ${m.countries.includes(cc)?'on':''}" onclick="rbToggleCountry('${ctx}','${cc}')">${v.flag} ${v.name}${m.countries.includes(cc)?' ✓':''}</button>`).join('');
  const held = rbBookedCities(ctx);
  const rows = m.rows.map((r,i)=>{
    const o = cityObj(r.city);
    const meta = [r.from && r.to ? `${shortDate(r.from)} – ${shortDate(r.to)}` : '', r.nights!=null ? nightsWord(r.nights)+(r.locked?' 🔒':'') : '', r.booked ? '✈ booked' : ''].filter(Boolean).join(' · ');
    return `<div class="rb-stop ${r.conflict?'conflict':''}" style="--accent:${o.accent}">
      <span class="rb-num">${i+1}</span>
      <button type="button" class="rb-city" onclick="rbChange('${ctx}',${i})"><span class="rb-em">${o.emoji}</span><span class="rb-name"><b>${esc(r.city)}</b><small>${TD.countries[o.country].flag} ${esc(meta)}</small></span><span class="cf-caret">▾</span></button>
      <button type="button" class="rb-x ${held.has(r.city)?'held':''}" aria-label="${held.has(r.city)?esc(r.city)+' has a booking':'Remove '+esc(r.city)}" onclick="rbRemove('${ctx}',${i})">${held.has(r.city)?'🔒':'✕'}</button>
      ${r.conflict?'<small class="conflict-note">⚠ Your bookings overlap here — check the order</small>':''}
    </div>`;
  }).join('<i class="rb-link"></i>');
  const dateField = (which, label, val, locked)=>`<div class="rb-home"><span class="rb-dot">🏠</span><div class="rb-home-copy"><small>${label}</small>${locked
      ? `<b>${new Date(val+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})} <em>✈ booked</em></b>`
      : `<input type="date" value="${val}" onchange="rbDate('${ctx}','${which}',this.value)" aria-label="${label}">`}</div></div>`;
  return `<div class="rb">
    <div class="rb-label">Countries</div>
    <div class="rb-ccs">${ccChips}</div>
    <div class="rb-legs">
      ${dateField('start','LEAVE HOME', m.start, m.lockStart)}
      <i class="rb-link"></i>
      ${rows || '<p class="hint">Add your first stop.</p>'}
      <button type="button" class="rb-add" onclick="rbAdd('${ctx}')">＋ Add a city</button>
      <i class="rb-link"></i>
      ${dateField('end','BACK HOME', m.end, m.lockEnd)}
    </div>
    <p class="rb-note">${total>0?`${nightsWord(total)} — we split them for you based on how much there is to do in each place.`:'Pick when you leave and come back.'}</p>
    ${rbPaceHint(m.rows.length, total)}
  </div>`;
}
function rbPaceHint(stops, total){
  if(!stops || total<=0) return '';
  if(total < stops) return `<p class="rb-hint">⚠ ${stops} stops in ${nightsWord(total)} — some places get no night. Drop a city or stretch your dates.</p>`;
  const avg = total/stops;
  if(avg < 2 && stops>2) return `<p class="rb-hint">That's a fast pace — under 2 nights a stop means a lot of packing. Fine if you like it busy.</p>`;
  if(avg > 6) return `<p class="rb-hint">Lots of time per stop (~${Math.round(avg)} nights each). Tap ＋ Add a city if you'd like more variety.</p>`;
  return '';
}

/* ---------- first-time setup (draft until "Build my trip") ---------- */
let obDraft = null;
function obInit(){
  const d = appData(), td = tripDates();
  const countries = tripCountries();
  obDraft = {countries, start:td.start, end:td.end, route:myRoute().filter(c=>countries.includes(TD.cities[c].country))};
  if(!obDraft.route.length) obDraft.route = suggestedRouteFor(countries);
  const t = document.getElementById('arrivalTime'); if(t) t.value = d.arrival?.time || '';
  obRender();
}
function obModel(){
  const total = Math.max(obDraft.route.length, daysBetween(obDraft.start, obDraft.end));
  const n = fitNightsWeighted(obDraft.route, total, null);
  let cur = obDraft.start;
  const rows = obDraft.route.map(c=>{ const from = cur, to = addDays(cur, n[c]); cur = to; return {city:c, from, to, nights:n[c]}; });
  return {countries:obDraft.countries, start:obDraft.start, end:obDraft.end, rows};
}
function obRender(){ const el = document.getElementById('obRoute'); if(el && obDraft) el.innerHTML = rbHTML(obModel(), 'ob'); }
function obSubmit(e){
  e.preventDefault();
  if(!obDraft.route.length){ showToast('Add at least one city'); return; }
  if(obDraft.end<=obDraft.start){ showToast('Coming home should be after you leave'); return; }
  const d = appData(), land = obDraft.route[0], home = obDraft.route[obDraft.route.length-1];
  const at = document.getElementById('arrivalTime')?.value || '';
  d.countries = obDraft.countries.slice();
  d.settings = d.settings || {}; d.settings.start = obDraft.start; d.settings.end = obDraft.end;
  d.route = obDraft.route.slice(); d.nightsManual = false;
  d.routeNights = fitNightsWeighted(d.route, Math.max(d.route.length, daysBetween(obDraft.start, obDraft.end)), null);
  d.arrival = {city:land, date:obDraft.start, time:at, airport:TRAVEL_META[land]?.airport||''};
  d.tickets = (d.tickets||[]).filter(t=>!(t.kind==='travel' && t.source==='onboarding'));
  if(document.getElementById('flightsBooked')?.checked){
    d.tickets.push({id:uid(), kind:'travel', type:'Flight', from:HOME, to:land, date:obDraft.start, time:'', title:`Home → ${land}`, source:'onboarding'});
    d.tickets.push({id:uid(), kind:'travel', type:'Flight', from:home, to:HOME, date:obDraft.end, time:'', title:`${home} → Home`, source:'onboarding'});
  }
  const cs = d.citySetup[land] || {}; cs.date = obDraft.start; cs.time = at; cs.arrivalPoint = d.arrival.airport; d.citySetup[land] = cs;
  saveApp(d);
  guideCity = land; localStorage.setItem('tripGuideCity', guideCity);
  showOnboardingStep(3);
}

/* ---------- My trip (saves as you go) ---------- */
function tripModel(){
  const td = tripDates();
  const rows = routeSchedule().map(x=>({city:x.city, from:x.from, to:x.to, nights:x.nights, booked:x.booked, locked:x.locked, conflict:x.conflict}));
  return {countries:tripCountries(), start:td.start, end:td.end, lockStart:td.bookedStart, lockEnd:td.bookedEnd, rows};
}
function saveTripRoute(route, opts={}){
  const d = appData(); d.route = route; if(opts.countries) d.countries = opts.countries;
  rebalanceNights(d); saveApp(d); afterRouteChange();
}

/* ---------- actions (ctx = 'ob' | 'trip') ---------- */
// Cities a saved booking points at can't silently vanish from the route.
function rbBookedCities(ctx){
  if(ctx==='ob') return new Set();
  const s = new Set();
  travelBookings().forEach(t=>{ if(t.from!==HOME) s.add(t.from); if(t.to!==HOME) s.add(t.to); });
  stayBookings().forEach(t=>s.add(t.city));
  return s;
}
function rbBlocked(ctx, cities){
  const booked = rbBookedCities(ctx), hit = cities.filter(c=>booked.has(c));
  if(!hit.length) return false;
  showToast(`${hit.join(', ')} ${hit.length>1?'have':'has'} a booking — remove it under Bookings (below) first`);
  return true;
}
function rbRoute(ctx){ return ctx==='ob' ? obDraft.route : myRoute().slice(); }
function rbCommit(ctx, route, opts={}){
  if(ctx==='ob'){ obDraft.route = route; if(opts.countries) obDraft.countries = opts.countries; obRender(); }
  else saveTripRoute(route, opts);
}
function rbToggleCountry(ctx, cc){
  const cur = ctx==='ob' ? obDraft.countries.slice() : tripCountries().slice();
  let route = rbRoute(ctx);
  // Route still the one we suggested? Then just suggest a fresh one for the new set of countries.
  const untouched = route.join('|')===suggestedRouteFor(cur).join('|');
  if(cur.includes(cc)){
    if(cur.length<=1){ showToast('Keep at least one country'); return; }
    const gone = route.filter(c=>TD.cities[c].country===cc);
    if(rbBlocked(ctx, gone)) return;
    route = route.filter(c=>TD.cities[c].country!==cc);
    const next = cur.filter(x=>x!==cc);
    if(!route.length || untouched) route = suggestedRouteFor(next);
    rbCommit(ctx, route, {countries:next});
    if(gone.length) showToast(`Removed ${gone.join(', ')}`);
  } else {
    const next = [...cur, cc];
    if(route.length && route.every(c=>TD.cities[c].country!==cc)){
      STARTERS[cc].forEach(c=>{ if(!route.includes(c)) route.splice(routeInsertIndex(route, c), 0, c); });
    }
    if(untouched) route = suggestedRouteFor(next);
    rbCommit(ctx, route, {countries:next});
    showToast(`${TD.countries[cc].flag} ${TD.countries[cc].name} added — tweak the stops below`);
  }
}
function rbRemove(ctx, i){
  const route = rbRoute(ctx); if(route.length<=1){ showToast('Keep at least one city'); return; }
  if(rbBlocked(ctx, [route[i]])) return;
  const [gone] = route.splice(i, 1); rbCommit(ctx, route); showToast(`${gone} removed — days re-split`);
}
function rbCountriesNow(ctx){ return ctx==='ob' ? obDraft.countries : tripCountries(); }
function rbAdd(ctx){
  const route = rbRoute(ctx), countries = rbCountriesNow(ctx);
  const allowed = rbCityOptions(countries, route);
  if(!allowed.length){ showToast('Every place in these countries is already on your route'); return; }
  openCitySheet({mode:'pick', title:'Add a city', allowed, current:null, onPick:c=>{
    const r = rbRoute(ctx), i = routeInsertIndex(r, c); r.splice(i, 0, c); rbCommit(ctx, r);
    showToast(`${c} added ${i>0?'after '+r[i-1]:'as your first stop'} — days re-split`);
  }});
}
function rbChange(ctx, i){
  const route = rbRoute(ctx), countries = rbCountriesNow(ctx), cur = route[i];
  if(rbBlocked(ctx, [cur])) return;
  const allowed = rbCityOptions(countries, route.filter(c=>c!==cur));
  openCitySheet({mode:'pick', title:`Stop ${i+1}`, allowed, current:cur, onPick:c=>{
    if(c===cur) return; const r = rbRoute(ctx); r[i] = c; rbCommit(ctx, r);
  }});
}
function rbDate(ctx, which, val){
  if(!val) return;
  if(ctx==='ob'){ obDraft[which] = val; obRender(); return; }
  const d = appData(); d.settings = d.settings || {}; d.settings[which] = val;
  saveApp(d); const d2 = rebalanceNights(); saveApp(d2); afterRouteChange();
}
function autoSplitAgain(){
  const d = appData(); d.nightsManual = false; rebalanceNights(d); saveApp(d); afterRouteChange(); showToast('Days split evenly again ✓');
}

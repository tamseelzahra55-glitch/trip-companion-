/* Route builder.
   First-time setup asks one thing per screen: dates → countries → cities (popular ones pre-ticked).
   We order the cities and split the nights; nobody is asked "how many days where".
   My trip → My route shows the same trip as a multi-city list for later edits (fine-tuning tucked away).
   Loaded after citysheet.js, before app.js. */

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

/* ---------- first-time setup: one question per screen ---------- */
/* Travel order used to line cities up — no one has to sort stops by hand. */
const SEQ = {
  MY: ['Kuala Lumpur','Melaka','Kuching','Kota Kinabalu','Cameron Highlands','Ipoh','Perhentian Islands','Penang','Langkawi'],
  TH_SOUTH_FIRST: ['Phuket','Koh Phi Phi','Krabi','Koh Samui','Koh Phangan','Koh Tao','Bangkok','Pattaya','Kanchanaburi','Chiang Mai','Pai','Chiang Rai'],
  TH: ['Bangkok','Pattaya','Kanchanaburi','Chiang Mai','Pai','Chiang Rai','Phuket','Koh Phi Phi','Krabi','Koh Samui','Koh Phangan','Koh Tao']
};
const POPULAR = {MY:['Kuala Lumpur','Langkawi','Penang','Melaka'], TH:['Bangkok','Chiang Mai','Phuket','Krabi','Koh Phi Phi']};
function orderCities(list, countries){
  const seq = countries.includes('MY') ? [...SEQ.MY, ...SEQ.TH_SOUTH_FIRST] : SEQ.TH;
  const known = list.filter(c=>seq.includes(c)).sort((a,b)=>seq.indexOf(a)-seq.indexOf(b));
  list.filter(c=>!seq.includes(c)).forEach(c=>known.splice(routeInsertIndex(known, c), 0, c));
  return known;
}
let obDraft = null;
function obEnsure(){
  if(obDraft) return obDraft;
  const td = tripDates(), countries = tripCountries();
  obDraft = {start:td.start, end:td.end, countries, cities:suggestedRouteFor(countries), touched:false, more:{}};
  return obDraft;
}
function obShow(n){
  obEnsure();
  if(n===2) obRenderDates();
  if(n===3) obRenderCountries();
  if(n===4){
    const ok = obDraft.cities.filter(c=>obDraft.countries.includes(TD.cities[c]?.country));
    obDraft.cities = (!obDraft.touched || !ok.length) ? suggestedRouteFor(obDraft.countries) : ok;
    obRenderCities();
  }
}
function obNights(){ return Math.max(0, daysBetween(obDraft.start, obDraft.end)); }
function obRenderDates(){
  const el = document.getElementById('obDates'); if(!el) return;
  const n = obNights();
  el.innerHTML = `<div class="ob-dates">
      <label class="ob-date"><span>🛫 Leave home</span><input type="date" value="${obDraft.start}" onchange="obSetDate('start',this.value)"></label>
      <label class="ob-date"><span>🏠 Back home</span><input type="date" value="${obDraft.end}" onchange="obSetDate('end',this.value)"></label>
    </div>
    <p class="ob-count ${n>0?'':'bad'}">${n>0?`That’s <b>${nightsWord(n)}</b> of travel.`:'Back home has to be after you leave.'}</p>`;
}
function obSetDate(which, v){ if(!v) return; obDraft[which] = v; obRenderDates(); }
function obRenderCountries(){
  const el = document.getElementById('obCountries'); if(!el) return;
  const blurb = {MY:'KL, islands, street food, rainforest', TH:'Bangkok, beaches, temples, lanterns'};
  el.innerHTML = `<div class="ob-countries">${Object.entries(TD.countries).map(([cc,v])=>{
    const on = obDraft.countries.includes(cc);
    return `<button type="button" class="ob-country ${on?'on':''}" onclick="obToggleCountry('${cc}')" aria-pressed="${on}">
      <span class="ob-flag">${v.flag}</span><b>${esc(v.name)}</b><small>${blurb[cc]||''}</small><i>${on?'✓':''}</i></button>`;
  }).join('')}</div>`;
}
function obToggleCountry(cc){
  const has = obDraft.countries.includes(cc);
  if(has && obDraft.countries.length===1){ showToast('Pick at least one country'); return; }
  obDraft.countries = has ? obDraft.countries.filter(x=>x!==cc) : Object.keys(TD.countries).filter(x=>x===cc || obDraft.countries.includes(x));
  obRenderCountries();
}
function obTile(c){
  const o = cityObj(c), on = obDraft.cities.includes(c);
  const sub = o.nov?.fit==='closed' ? '⚠ mostly closed in Nov' : (o.famous||[]).slice(0,2).join(' · ');
  return `<button type="button" class="ob-city ${on?'on':''}" style="--accent:${o.accent}" onclick="obToggleCity('${jsq(c)}')" aria-pressed="${on}">
    <span class="ob-em">${o.emoji}</span><span class="ob-txt"><b>${esc(c)}</b><small>${esc(sub)}</small></span><i class="ob-tick">${on?'✓':''}</i></button>`;
}
function obRenderCities(){
  const el = document.getElementById('obCities'); if(!el) return;
  el.innerHTML = obDraft.countries.map(cc=>{
    const all = Object.keys(TD.cities).filter(c=>TD.cities[c].country===cc);
    const pop = POPULAR[cc].filter(c=>all.includes(c)), rest = all.filter(c=>!pop.includes(c));
    const showRest = obDraft.more[cc] || rest.some(c=>obDraft.cities.includes(c));
    return `<div class="ob-group"><div class="ob-ghead">${TD.countries[cc].flag} ${esc(TD.countries[cc].name)}</div>
      <div class="ob-grid">${pop.map(obTile).join('')}${showRest?rest.map(obTile).join(''):''}</div>
      ${!showRest && rest.length?`<button type="button" class="ob-more" onclick="obDraft.more['${cc}']=true;obRenderCities()">＋ ${rest.length} more places in ${esc(TD.countries[cc].name)}</button>`:''}</div>`;
  }).join('');
  const n = obNights(), k = obDraft.cities.length;
  const sm = document.getElementById('obSummary');
  if(sm) sm.innerHTML = k ? `<b>${k} ${k===1?'city':'cities'}</b> · ${nightsWord(n)} — we’ll split them for you.${k>n?' <span class="bad">That’s more cities than nights.</span>':''}` : 'Pick at least one city.';
}
function obToggleCity(c){
  obDraft.touched = true;
  obDraft.cities = obDraft.cities.includes(c) ? obDraft.cities.filter(x=>x!==c) : [...obDraft.cities, c];
  obRenderCities();
}
function obNext(step){
  if(step===2 && obNights()<=0){ showToast('Back home has to be after you leave'); return; }
  showOnboardingStep(step+1);
}
function obBuild(){
  if(!obDraft.cities.length){ showToast('Pick at least one city'); return; }
  const d = appData(), route = orderCities(obDraft.cities.slice(), obDraft.countries), land = route[0];
  d.countries = obDraft.countries.slice();
  d.settings = d.settings || {}; d.settings.start = obDraft.start; d.settings.end = obDraft.end;
  d.route = route; d.nightsManual = false;
  d.routeNights = fitNightsWeighted(route, Math.max(route.length, daysBetween(obDraft.start, obDraft.end)), null);
  d.arrival = {city:land, date:obDraft.start, time:'', airport:TRAVEL_META[land]?.airport||''};
  const cs = d.citySetup[land] || {}; cs.date = obDraft.start; cs.arrivalPoint = d.arrival.airport; d.citySetup[land] = cs;
  saveApp(d);
  guideCity = land; localStorage.setItem('tripGuideCity', guideCity);
  finishOnboarding();
  showToast(`✓ ${route.length} stops, ${nightsWord(daysBetween(obDraft.start, obDraft.end))} — your plan is ready`);
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

/* ---------- My route card actions (ctx is always 'trip' now; setup has its own screens) ---------- */
// Cities a saved booking points at can't silently vanish from the route.
function rbBookedCities(ctx){
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
function rbRoute(ctx){ return myRoute().slice(); }
function rbCommit(ctx, route, opts={}){
  saveTripRoute(route, opts);
}
function rbToggleCountry(ctx, cc){
  const cur = tripCountries().slice();
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
function rbCountriesNow(ctx){ return tripCountries(); }
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
  const d = appData(); d.settings = d.settings || {}; d.settings[which] = val;
  saveApp(d); const d2 = rebalanceNights(); saveApp(d2); afterRouteChange();
}
function autoSplitAgain(){
  const d = appData(); d.nightsManual = false; rebalanceNights(d); saveApp(d); afterRouteChange(); showToast('Days split evenly again ✓');
}

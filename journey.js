/* Journey v17 — Strava-style day maps.
   • 📍 I'm here: one-tap GPS check-in, auto-named from the map
   • ⏺ Record a walk: live GPS trail while the app is open (screen kept awake)
   • Logged places (✓ marks, plan check-ins, rides, back-to-stay) get pinned automatically
   • Day stats, whole-trip map, and a shareable day card with the route shape
   Loaded after features.js and before app.js. */

const ROUTE_ORANGE = '#fc4c02';
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>';
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const PIN_SOURCES = ['manual','done-mark','daily-checkin','ride-end','back-to-stay','checkin'];
const NOW_GEO_SOURCES = ['manual','done-mark','daily-checkin','ride-end','expense-log','food-memory'];

let dayMap = null, dayLayer = null, tripMap = null, tripLayer = null, leafletLoading = null;
let rec = null, recTimer = null, geoBusy = false, lastNominatim = 0;
window._geoNow = window._geoNow || [];

/* ---------- small helpers ---------- */
function ensureLeaflet(){
  if(window.L) return Promise.resolve(window.L);
  if(leafletLoading) return leafletLoading;
  leafletLoading = new Promise((res, rej)=>{
    const css = document.createElement('link'); css.rel='stylesheet'; css.href='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    s.onload = ()=>res(window.L); s.onerror = ()=>{leafletLoading=null; rej(new Error('map library unavailable'))};
    document.head.appendChild(s);
  });
  return leafletLoading;
}
function haversine(a, b){
  const R=6371e3, r=x=>x*Math.PI/180;
  const dLat=r(b[0]-a[0]), dLon=r(b[1]-a[1]);
  const h=Math.sin(dLat/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function fmtDist(m){ if(!m) return '0 km'; return m<1000 ? Math.round(m)+' m' : (m/1000).toFixed(m<10000?1:0)+' km'; }
function fmtDuration(ms){ if(!ms) return '—'; if(ms<60000) return '<1m'; const m=Math.round(ms/60000), h=Math.floor(m/60); return h?`${h}h ${m%60}m`:`${m}m`; }
function getPosition(opts={}){
  return new Promise((res, rej)=>{
    if(!navigator.geolocation) return rej({code:0,message:'unsupported'});
    navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy:true, timeout:12000, maximumAge:20000, ...opts});
  });
}
async function geoPermission(){ try{ const r=await navigator.permissions?.query({name:'geolocation'}); return r?.state||'prompt'; }catch(e){ return 'prompt'; } }
async function nominatimGate(){ const w=1100-(Date.now()-lastNominatim); if(w>0) await new Promise(r=>setTimeout(r,w)); lastNominatim=Date.now(); }
async function reverseName(lat, lon){
  try{
    await nominatimGate();
    const r=await fetch(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`);
    const j=await r.json(), a=j.address||{};
    return j.name || a.amenity || a.shop || a.tourism || a.attraction || a.leisure || a.building || a.road || a.neighbourhood || a.suburb || (j.display_name||'').split(',')[0] || null;
  }catch(e){ return null; }
}
async function geocodePlace(name, city){
  const c=cityObj(city); if(!name) return null;
  const q=encodeURIComponent(`${name}, ${city}${c?', '+TD.countries[c.country].name:''}`);
  try{
    await nominatimGate();
    const r=await fetch(`${NOMINATIM}/search?format=jsonv2&limit=1&accept-language=en&q=${q}`);
    const j=await r.json(); if(!j[0]) return null;
    const p=[+j[0].lat, +j[0].lon];
    if(c && haversine(p,[c.coords.lat,c.coords.lon])>80000) return null; // wrong-city match
    return p;
  }catch(e){ return null; }
}
function stopTime(s, date){
  if(s.time){
    // logged "now": the creation moment is more precise than the HH:MM label
    if(s.createdAt){ const c=new Date(s.createdAt); const hm=String(c.getHours()).padStart(2,'0')+':'+String(c.getMinutes()).padStart(2,'0'); if(hm===s.time && todayISO()===date) return c.getTime(); }
    return Date.parse(date+'T'+s.time+':00');
  }
  if(s.createdAt) return Date.parse(s.createdAt);
  return Date.parse(date+'T12:00:00');
}
function sortedStops(date){ return [...journeyStopsFor(date)].sort((a,b)=>stopTime(a,date)-stopTime(b,date)); }
function dayTracks(date){ return (appData().tracks||{})[date]||[]; }
function dayPath(date){
  const pts=[];
  sortedStops(date).forEach(s=>{ if(Number.isFinite(s.lat)) pts.push({lat:s.lat,lon:s.lon,t:stopTime(s,date),kind:'stop',id:s.id}); });
  dayTracks(date).forEach(tr=>(tr.points||[]).forEach(p=>pts.push({lat:p[0],lon:p[1],t:p[2],kind:'track',track:tr.id})));
  return pts.sort((a,b)=>a.t-b.t);
}
function pathDistance(pts){ let m=0; for(let i=1;i<pts.length;i++) m+=haversine([pts[i-1].lat,pts[i-1].lon],[pts[i].lat,pts[i].lon]); return m; }
function trackDistance(points){ let m=0; for(let i=1;i<points.length;i++) m+=haversine(points[i-1],points[i]); return m; }
function dayOfTrip(date){ const n=daysBetween(tripDates().start,date)+1; return n>=1&&n<=daysBetween(tripDates().start,tripDates().end)+1?n:null; }
function updateStop(date, id, patch){
  const d=appData(), arr=d.journeyStops?.[date]; if(!arr) return;
  const s=arr.find(x=>x.id===id); if(!s) return;
  Object.assign(s, patch); saveApp(d);
}
function dayActiveSpan(date){
  const ts=[...sortedStops(date).filter(s=>s.time).map(s=>stopTime(s,date)), ...dayTracks(date).flatMap(t=>(t.points||[]).map(p=>p[2]))];
  return ts.length>1 ? Math.max(...ts)-Math.min(...ts) : 0;
}

/* ---------- daily view ---------- */
function renderDailyJourney(){
  const input=document.getElementById('journeyDate'); if(!input) return;
  input.value=journeySelectedDate;
  const date=journeySelectedDate, stops=sortedStops(date), pts=dayPath(date), city=selectedJourneyCity(stops);
  const dn=dayOfTrip(date);
  document.getElementById('dayKicker').textContent=(dn?`DAY ${dn} · `:'')+(date===todayISO()?'TODAY':new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long'}).toUpperCase());
  document.getElementById('dayTitle').textContent=city;
  document.getElementById('dayDateLabel').textContent=new Date(date+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short'});
  const spend=compactMoneyMap(daySpendMap(date),'—');
  document.getElementById('dayStats').innerHTML=`
    <div><b>${fmtDist(pathDistance(pts))}</b><span>distance</span></div>
    <div><b>${stops.length}</b><span>stops</span></div>
    <div><b>${fmtDuration(dayActiveSpan(date))}</b><span>out for</span></div>
    <div><b class="small">${esc(spend)}</b><span>spent</span></div>`;
  let n=0;
  document.getElementById('dayTimeline').innerHTML=stops.length?stops.map(s=>{n++;const pinned=Number.isFinite(s.lat);return `<div class="tl-row">
      <div class="tl-dot ${pinned?'pinned':''}">${n}</div>
      <div class="tl-copy"><b>${stopIcon(s.type)} ${esc(s.place)}</b><small>${esc(s.time||'')}${s.time?' · ':''}${esc(s.type)}${s.note?' · '+esc(s.note):''}${pinned?'':' · not on map'}</small></div>
      <div class="tl-actions">${pinned?'':`<button onclick="pinStop('${s.id}')" aria-label="Pin on map">📍</button>`}<button onclick="renameStop('${s.id}')" aria-label="Rename">✎</button><button onclick="removeJourneyStop('${s.id}')" aria-label="Remove">✕</button></div>
    </div>`}).join(''):`<div class="empty-state">Nothing logged ${date===todayISO()?'yet today':'this day'}. Tap <b>📍 I’m here</b> wherever you are — that’s all it takes.</div>`;
  renderRecPanel();
  renderDayMap(date);
  autoPinDay(date);
}
async function renderDayMap(date){
  const el=document.getElementById('dayMap'); if(!el) return;
  if(!document.getElementById('journey')?.classList.contains('active')) return; // Leaflet needs a visible box
  try{ await ensureLeaflet(); }catch(e){ el.innerHTML='<div class="map-offline">🗺 The map needs internet — your stops are listed below.</div>'; return; }
  if(!dayMap){
    el.innerHTML='';
    dayMap=L.map(el,{zoomControl:false,attributionControl:true});
    L.tileLayer(TILE_URL,{subdomains:'abcd',maxZoom:20,attribution:TILE_ATTR}).addTo(dayMap);
    dayLayer=L.layerGroup().addTo(dayMap);
  }
  dayLayer.clearLayers();
  const pts=dayPath(date), stops=sortedStops(date);
  dayTracks(date).forEach(tr=>{ if((tr.points||[]).length>1) L.polyline(tr.points.map(p=>[p[0],p[1]]),{color:ROUTE_ORANGE,weight:5,opacity:.95,lineJoin:'round',lineCap:'round'}).addTo(dayLayer); });
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1], b=pts[i];
    if(a.kind==='track'&&b.kind==='track'&&a.track===b.track) continue;
    L.polyline([[a.lat,a.lon],[b.lat,b.lon]],{color:ROUTE_ORANGE,weight:3,opacity:.55,dashArray:'6 8'}).addTo(dayLayer);
  }
  stops.forEach((s,i)=>{
    if(!Number.isFinite(s.lat)) return;
    L.marker([s.lat,s.lon],{icon:L.divIcon({className:'stop-pin',html:`<span>${i+1}</span>`,iconSize:[26,26],iconAnchor:[13,13]})})
      .bindPopup(`<b>${esc(s.place)}</b><br>${esc(s.time||'')}`).addTo(dayLayer);
  });
  if(rec && rec.points.length){ const p=rec.points[rec.points.length-1]; L.circleMarker([p[0],p[1]],{radius:7,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).addTo(dayLayer); }
  if(pts.length){
    const b=L.latLngBounds(pts.map(p=>[p.lat,p.lon]));
    dayMap.fitBounds(b.pad(.3),{maxZoom:16,animate:false});
  }else{
    const c=cityObj(selectedJourneyCity(stops))||cityObj(guideCity);
    dayMap.setView([c.coords.lat,c.coords.lon],12,{animate:false});
  }
  setTimeout(()=>dayMap&&dayMap.invalidateSize(),80);
}

/* ---------- check-in + stops ---------- */
function geoErrorText(e){
  if(e&&e.code===1) return 'Location is blocked — allow it for this site in your browser settings.';
  if(e&&e.code===0) return 'This browser can’t share location.';
  return 'Couldn’t get a GPS fix — try again in the open.';
}
async function checkInHere(){
  showToast('Finding you…');
  let p;
  try{ p=await getPosition(); }catch(e){ showToast(geoErrorText(e)); setTimeout(openJourneyStopModal,600); return; }
  const lat=+p.coords.latitude.toFixed(6), lon=+p.coords.longitude.toFixed(6), acc=Math.round(p.coords.accuracy);
  const name=(await reverseName(lat,lon))||'Pinned spot';
  const d=appData(), date=todayISO();
  const s=appendJourneyStopToData(d,date,guideCity,name,'Place',nowHHMM(),'checkin');
  if(s){ s.lat=lat; s.lon=lon; s.acc=acc; }
  saveApp(d);
  journeySelectedDate=date;
  renderJourney();
  showToast(`📍 ${name} ✓`);
}
async function submitJourneyStop(e){
  e.preventDefault();
  const d=appData(), date=journeySelectedDate||todayISO(), city=journeyStopCity.value||guideCity;
  const place=journeyStopPlace.value.trim(); if(!place) return;
  const s=appendJourneyStopToData(d,date,city,place,journeyStopType,journeyStopTime.value,'manual-modal',journeyStopNote.value.trim());
  saveApp(d); closeModal('journeyStopModal'); renderApp();
  if(!s) return;
  const useGps=document.getElementById('journeyStopHere')?.checked;
  let coords=null;
  if(useGps){ try{ const p=await getPosition(); coords=[+p.coords.latitude.toFixed(6),+p.coords.longitude.toFixed(6)]; }catch(err){ showToast(geoErrorText(err)); } }
  if(!coords && navigator.onLine) coords=await geocodePlace(place,city);
  if(coords){ updateStop(date,s.id,{lat:coords[0],lon:coords[1]}); renderJourney(); showToast('Stop added and pinned ✓'); }
  else { updateStop(date,s.id,{geoTried:true}); showToast('Stop added ✓ (tap 📍 on it to pin later)'); }
}
async function pinStop(id){
  const date=journeySelectedDate, s=journeyStopsFor(date).find(x=>x.id===id); if(!s) return;
  showToast('Looking it up…');
  let coords=navigator.onLine?await geocodePlace(s.place,s.city):null;
  if(!coords && date===todayISO() && confirm(`Couldn’t find “${s.place}” on the map. Use where you are right now instead?`)){
    try{ const p=await getPosition(); coords=[+p.coords.latitude.toFixed(6),+p.coords.longitude.toFixed(6)]; }catch(e){ showToast(geoErrorText(e)); return; }
  }
  if(coords){ updateStop(date,id,{lat:coords[0],lon:coords[1]}); renderJourney(); showToast('Pinned ✓'); }
  else showToast('Not found — try renaming it to the place’s proper name');
}
function renameStop(id){
  const date=journeySelectedDate, s=journeyStopsFor(date).find(x=>x.id===id); if(!s) return;
  const v=prompt('Rename this stop',s.place); if(v===null) return;
  const name=v.trim(); if(!name) return;
  updateStop(date,id,{place:name, ...(Number.isFinite(s.lat)?{}:{geoTried:false})}); renderJourney();
}
/* Pin logged places for the selected day by name, one gentle lookup at a time */
async function autoPinDay(date){
  if(geoBusy || !navigator.onLine) return;
  const todo=journeyStopsFor(date).filter(s=>!Number.isFinite(s.lat)&&!s.geoTried&&PIN_SOURCES.includes(s.source)).slice(0,8);
  if(!todo.length) return;
  geoBusy=true;
  try{
    for(const s of todo){
      const c=await geocodePlace(s.place,s.city);
      updateStop(date,s.id,c?{lat:c[0],lon:c[1]}:{geoTried:true});
    }
  }finally{ geoBusy=false; }
  if(journeySelectedDate===date) renderJourney();
}
/* Things logged "right now" get your current position — only if location is already allowed (no surprise prompts) */
async function flushNowGeo(){
  const q=window._geoNow; if(!q.length) return;
  if(await geoPermission()!=='granted') return;
  const items=q.splice(0);
  try{
    const p=await getPosition({timeout:8000});
    const lat=+p.coords.latitude.toFixed(6), lon=+p.coords.longitude.toFixed(6);
    items.forEach(({date,id})=>updateStop(date,id,{lat,lon}));
    renderJourney();
  }catch(e){}
}

/* ---------- record a walk ---------- */
async function keepAwake(){ try{ if(rec && 'wakeLock' in navigator){ rec.wake=await navigator.wakeLock.request('screen'); } }catch(e){} }
document.addEventListener('visibilitychange',()=>{ if(rec && document.visibilityState==='visible') keepAwake(); });
async function startWalk(){
  if(!navigator.geolocation){ showToast('This browser can’t share location'); return; }
  if(rec) return;
  journeySelectedDate=todayISO();
  rec={id:uid(),date:todayISO(),start:Date.now(),points:[],watch:null,wake:null,acc:null,saved:0};
  rec.watch=navigator.geolocation.watchPosition(onWalkPos,onWalkErr,{enableHighAccuracy:true,maximumAge:3000,timeout:30000});
  await keepAwake();
  recTimer=setInterval(renderRecPanel,1000);
  renderJourney();
  showToast('Recording — keep the app open on screen');
}
function onWalkPos(p){
  if(!rec) return;
  const {latitude,longitude,accuracy}=p.coords; rec.acc=Math.round(accuracy);
  if(accuracy>50){ renderRecPanel(); return; }
  const pt=[+latitude.toFixed(6),+longitude.toFixed(6),Date.now()];
  const last=rec.points[rec.points.length-1];
  if(last && haversine(last,pt)<10) return;
  rec.points.push(pt);
  saveWalk();
  if(journeySelectedDate===rec.date && document.getElementById('journey')?.classList.contains('active')) renderDailyJourney();
  else renderRecPanel();
}
function onWalkErr(e){ if(e.code===1){ showToast(geoErrorText(e)); stopWalk(true); } }
function saveWalk(){
  if(!rec) return;
  const d=appData(); d.tracks=d.tracks||{};
  const arr=d.tracks[rec.date]=d.tracks[rec.date]||[];
  let tr=arr.find(t=>t.id===rec.id);
  if(!tr){ tr={id:rec.id,start:rec.start}; arr.push(tr); }
  tr.points=rec.points; tr.end=Date.now(); tr.distance=Math.round(trackDistance(rec.points));
  saveApp(d); rec.saved=rec.points.length;
}
function stopWalk(silent){
  if(!rec) return;
  navigator.geolocation.clearWatch(rec.watch);
  try{ rec.wake&&rec.wake.release(); }catch(e){}
  clearInterval(recTimer); recTimer=null;
  const r=rec;
  if(r.points.length>=2){ saveWalk(); if(!silent) showToast(`Walk saved · ${fmtDist(trackDistance(r.points))} ✓`); }
  else { const d=appData(); if(d.tracks?.[r.date]) d.tracks[r.date]=d.tracks[r.date].filter(t=>t.id!==r.id); saveApp(d); if(!silent) showToast('Too short to save — walk a bit further next time'); }
  rec=null; renderJourney();
}
function deleteTrack(id){
  if(!confirm('Delete this recorded walk?')) return;
  const d=appData(), date=journeySelectedDate; if(d.tracks?.[date]) d.tracks[date]=d.tracks[date].filter(t=>t.id!==id);
  saveApp(d); renderJourney();
}
function renderRecPanel(){
  const el=document.getElementById('recPanel'); if(!el) return;
  if(rec){
    const dist=trackDistance(rec.points), el_ms=Date.now()-rec.start;
    const mm=Math.floor(el_ms/60000), ss=String(Math.floor(el_ms/1000)%60).padStart(2,'0');
    el.innerHTML=`<div class="rec-live"><span class="rec-dot"></span><div><b>${fmtDist(dist)}</b><small>${mm}:${ss} · ${rec.acc?('GPS ±'+rec.acc+' m'):'waiting for GPS…'}</small></div><button onclick="stopWalk()">■ Stop</button></div>
      <p class="rec-note">Keep the app open — locking the phone pauses the trail.</p>`;
    return;
  }
  const tracks=dayTracks(journeySelectedDate);
  el.innerHTML=`<div class="rec-actions"><button class="here-btn" onclick="checkInHere()">📍 I’m here</button><button class="walk-btn" onclick="startWalk()">⏺ Record a walk</button></div>`
    +(tracks.length?`<div class="track-list">${tracks.map(t=>`<span>🚶 ${fmtDist(t.distance||trackDistance(t.points||[]))} · ${fmtDuration((t.end||t.start)-t.start)} <button onclick="deleteTrack('${t.id}')" aria-label="Delete walk">✕</button></span>`).join('')}</div>`:'');
}

/* ---------- whole-trip map ---------- */
function journeyDates(){
  const d=appData();
  return [...new Set([...Object.keys(d.journeyStops||{}),...Object.keys(d.tracks||{})])].filter(x=>(d.journeyStops?.[x]||[]).length||(d.tracks?.[x]||[]).length).sort();
}
function tripTotals(){
  let km=0, pinned=0;
  journeyDates().forEach(dt=>{ const p=dayPath(dt); km+=pathDistance(p); pinned+=p.filter(x=>x.kind==='stop').length; });
  return {km,pinned,days:journeyDates().length};
}
async function renderTripMap(){
  const el=document.getElementById('tripMap'); if(!el) return;
  if(!document.getElementById('journey')?.classList.contains('active')) return;
  const dates=journeyDates().filter(dt=>dayPath(dt).length);
  const legend=document.getElementById('tripDayLegend');
  try{ await ensureLeaflet(); }catch(e){ el.innerHTML='<div class="map-offline">🗺 The trip map needs internet.</div>'; return; }
  if(!tripMap){
    el.innerHTML='';
    tripMap=L.map(el,{zoomControl:false,attributionControl:true});
    L.tileLayer(TILE_URL,{subdomains:'abcd',maxZoom:19,attribution:TILE_ATTR}).addTo(tripMap);
    tripLayer=L.layerGroup().addTo(tripMap);
  }
  tripLayer.clearLayers();
  const all=[];
  dates.forEach((dt,i)=>{
    const col=`hsl(${(18+i*47)%360} 85% 48%)`, path=dayPath(dt), pts=path.map(p=>[p.lat,p.lon]);
    all.push(...pts);
    if(pts.length>1) L.polyline(pts,{color:col,weight:4,opacity:.9}).addTo(tripLayer).on('click',()=>{journeySelectedDate=dt;renderJourney();document.getElementById('dayMap')?.scrollIntoView({behavior:'smooth'})});
    path.filter(p=>p.kind==='stop').forEach(p=>L.circleMarker([p.lat,p.lon],{radius:4,color:'#fff',weight:2,fillColor:col,fillOpacity:1}).addTo(tripLayer));
  });
  if(all.length) tripMap.fitBounds(L.latLngBounds(all).pad(.2),{maxZoom:14,animate:false});
  else { const r=myRoute().map(c=>[cityObj(c).coords.lat,cityObj(c).coords.lon]); tripMap.fitBounds(L.latLngBounds(r).pad(.2),{animate:false}); r.forEach(p=>L.circleMarker(p,{radius:5,color:'#94a3b8',weight:2,fillColor:'#fff',fillOpacity:1}).addTo(tripLayer)); }
  if(legend) legend.innerHTML=dates.length?dates.map((dt,i)=>`<button style="--c:hsl(${(18+i*47)%360} 85% 48%)" onclick="journeySelectedDate='${dt}';renderJourney();document.getElementById('dayMap').scrollIntoView({behavior:'smooth'})">${dayOfTrip(dt)?'Day '+dayOfTrip(dt):shortDate(dt)}</button>`).join(''):'<span class="muted">Your days will appear here as coloured trails.</span>';
  setTimeout(()=>tripMap&&tripMap.invalidateSize(),80);
}

/* ---------- Google Maps + share card ---------- */
function openDailyRoute(){
  const stops=sortedStops(journeySelectedDate);
  if(stops.length<2){ showToast('Add at least 2 stops first'); return; }
  const loc=s=>Number.isFinite(s.lat)?`${s.lat},${s.lon}`:`${s.place}, ${s.city}`;
  const names=stops.slice(0,10).map(loc);
  const u=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(names[0])}&destination=${encodeURIComponent(names[names.length-1])}&travelmode=walking${names.length>2?'&waypoints='+names.slice(1,-1).map(encodeURIComponent).join('%7C'):''}`;
  window.open(u,'_blank','noopener');
}
async function shareJourneyDay(){
  const date=journeySelectedDate, stops=sortedStops(date), pts=dayPath(date);
  if(!stops.length && !pts.length){ showToast('Log a stop first'); return; }
  const city=selectedJourneyCity(stops), dn=dayOfTrip(date);
  const W=1080,H=1350, c=document.createElement('canvas'); c.width=W; c.height=H; const ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,'#0b1220'); g.addColorStop(1,'#1e1b4b'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.textAlign='left';
  ctx.fillStyle='#fdba74'; ctx.font='800 30px system-ui'; ctx.fillText((dn?`DAY ${dn} · `:'')+new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'}).toUpperCase(),72,104);
  ctx.fillStyle='#fff'; ctx.font='900 76px system-ui'; ctx.fillText(city,72,190);
  // route box
  const box={x:72,y:240,w:W-144,h:640};
  ctx.fillStyle='rgba(255,255,255,.04)'; ctx.beginPath(); ctx.roundRect?ctx.roundRect(box.x,box.y,box.w,box.h,36):ctx.rect(box.x,box.y,box.w,box.h); ctx.fill();
  if(pts.length>=2){
    const lat0=pts.reduce((a,p)=>a+p.lat,0)/pts.length, k=Math.cos(lat0*Math.PI/180);
    const xs=pts.map(p=>p.lon*k), ys=pts.map(p=>p.lat);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const span=Math.max(maxX-minX,maxY-minY)||1e-4, pad=70, s=Math.min((box.w-2*pad)/span,(box.h-2*pad)/span);
    const cx=box.x+box.w/2, cy=box.y+box.h/2, mx=(minX+maxX)/2, my=(minY+maxY)/2;
    const P=p=>[cx+(p.lon*k-mx)*s, cy-(p.lat-my)*s];
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.strokeStyle='rgba(252,76,2,.35)'; ctx.lineWidth=26; ctx.beginPath(); pts.forEach((p,i)=>{const [x,y]=P(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}); ctx.stroke();
    ctx.strokeStyle=ROUTE_ORANGE; ctx.lineWidth=11; ctx.stroke();
    if(pts[0].kind==='track'){ const [sx,sy]=P(pts[0]); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(sx,sy,16,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(sx,sy,10,0,Math.PI*2); ctx.fill(); }
    let n=0; stops.forEach((st,i)=>{ if(!Number.isFinite(st.lat)) return; n++; const [x,y]=P({lat:st.lat,lon:st.lon}); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y,24,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#0b1220'; ctx.font='900 22px system-ui'; ctx.textAlign='center'; ctx.fillText(String(i+1),x,y+8); ctx.textAlign='left'; });
  }else{
    ctx.fillStyle='#c7d2fe'; ctx.font='700 32px system-ui'; ctx.textAlign='center'; ctx.fillText(`${stops.length} stop${stops.length===1?'':'s'} logged`,W/2,box.y+box.h/2); ctx.textAlign='left';
  }
  // stats
  const stats=[[fmtDist(pathDistance(pts)),'distance'],[String(stops.length),'stops'],[fmtDuration(dayActiveSpan(date)),'out for'],[compactMoneyMap(daySpendMap(date),'—'),'spent']];
  stats.forEach((st,i)=>{ const x=72+i*(W-144)/4; ctx.fillStyle='#fff'; ctx.font=`900 ${st[0].length>9?34:46}px system-ui`; ctx.fillText(st[0],x,960); ctx.fillStyle='#94a3b8'; ctx.font='700 24px system-ui'; ctx.fillText(st[1].toUpperCase(),x,998); });
  // stop names
  ctx.fillStyle='#e2e8f0'; ctx.font='600 28px system-ui';
  stops.slice(0,6).forEach((st,i)=>{ const txt=`${i+1}. ${st.place}`; ctx.fillText(txt.length>40?txt.slice(0,39)+'…':txt,72,1062+i*40); });
  if(stops.length>6){ ctx.fillStyle='#94a3b8'; ctx.fillText(`+ ${stops.length-6} more`,72,1062+6*40); }
  ctx.fillStyle='#64748b'; ctx.font='600 20px system-ui'; ctx.fillText('Trip Companion · Malaysia × Thailand',72,H-48);
  const blob=await new Promise(r=>c.toBlob(r,'image/png',.95)); if(!blob) return;
  const file=new File([blob],`trip-day-${date}.png`,{type:'image/png'});
  try{ if(navigator.share&&navigator.canShare?.({files:[file]})){ await navigator.share({files:[file],title:`My ${city} day`}); return; } }catch(e){ if(e&&e.name==='AbortError') return; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=file.name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500); showToast('Day card saved ✓');
}

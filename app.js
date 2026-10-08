/* Trip Companion v16 — app logic (carried over from v15 with fixes). Requires data-*.js + features.js. */
function legacyShowTab(id,b){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function togglePanel(b){let x=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',x?'false':'true')}
function toggleCity(b){togglePanel(b)}
function toggleActivity(b){togglePanel(b)}
function toggleRecSection(b){togglePanel(b)}
function setState(btn,state){
  let row=btn.closest('.stateable'), key='trip3:'+row.dataset.key;
  let cur=localStorage.getItem(key)||'open', next=cur===state?'open':state;
  localStorage.setItem(key,next);
  if(next==='done')localStorage.setItem('trip3time:'+row.dataset.key,new Date().toISOString());
  else localStorage.removeItem('trip3time:'+row.dataset.key);
  if(next==='done')recordDoneRowToJourney(row); paint(row,next); countAll(); renderJourney();
}
function paint(row,s){
  row.classList.remove('done','skip');
  if(s==='done')row.classList.add('done');
  if(s==='skip')row.classList.add('skip');
}
function countAll(){
  let rows=[...document.querySelectorAll('.stateable')].filter(r=>!r.closest('.scope-out')),d=0,s=0;
  rows.forEach(r=>{let st=localStorage.getItem('trip3:'+r.dataset.key)||'open';if(st==='done')d++;if(st==='skip')s++;});
  let el=document.getElementById('done'); if(!el)return;
  el.textContent='✓ '+d+' done';
  document.getElementById('skip').textContent='✕ '+s+' skipped';
  document.getElementById('open').textContent='○ '+(rows.length-d-s)+' undecided';
}


let activityFilter='All';
let activitySpend=localStorage.getItem('tripActivitySpend')||'Any';

function classifyActivityText(text){
  text=(text||'').toLowerCase();
  let tags=[];
  const add=t=>{if(!tags.includes(t))tags.push(t)};
  if(/social|language exchange|meetup|meet |people|community|walking street|night market|jazz|live band|salsa|club|bar|fire performance|nightlife/.test(text))add('Social');
  if(/night|club|bar|jazz|live band|illuzion|tuff|bangla|rooftop|fire performance|night market/.test(text))add('Nightlife');
  if(/scuba|snork|kayak|parasail|zipline|climb|cave|hike|trail|waterfall|island|mangrove|rafting|adrenaline|skybridge|skycab|diving/.test(text))add('Adventure');
  if(/food|street|market|nasi|restaurant|dessert|eat|dinner|lunch|breakfast|noodle|rice/.test(text))add('Food');
  if(/café|cafe|coffee|roaster|bakery|boulangerie|tea house|brunch/.test(text))add('Cafe');
  if(/shopping|mall|market|bazaar|outlet|siam|pratunam|mbk|platinum|centralworld|pavilion|lalaport|night bazaar/.test(text))add('Shopping');
  if(/forest|park|garden|beach|waterfall|mountain|sunset|sunrise|nature|lake|island|mangrove/.test(text))add('Nature');
  if(/temple|museum|heritage|old town|historic|culture|mosque|wat |chinatown|architecture/.test(text))add('Culture');
  if(/massage|spa|relax|slow|quiet/.test(text))add('Relax');
  return tags.length?tags:['Explore'];
}
function highSpendExperience(text){
  return /discover scuba|scuba|similan|phi phi|island hopping|hanuman world|zipline|paramotor|ethical elephant|elephant sanctuary|atv|skyworlds|theme park|water park|parasailing|mangrove kayaking|kilim geoforest|fireflies|gua damai|climbing|cave exploration|doi inthanon|ayutthaya|muay thai|rajadamnern/i.test(text||'');
}
function activitySpendInfo(row){
  let cost=row.querySelector('.cost');
  let txt=(cost?.textContent||'').trim().toUpperCase();
  let cls=cost?.className||'';
  let full=((row.dataset.search||'')+' '+(row.textContent||'')).toLowerCase();
  let isFree=/\bfree\b|mostly free|free entry|free to walk/.test(txt.toLowerCase()) && !/free\/paid/.test(txt.toLowerCase());
  let isLow=/low/.test(txt.toLowerCase()) || /mixed/.test(cls);
  let isPaid=/paid/.test(cls) || /paid/.test(txt.toLowerCase()) || isLow;
  let splurge=isPaid && highSpendExperience(full);
  let tier=splurge?'splurge':(isFree||isLow)?'save':isPaid?'paid':'unknown';
  return {tier,isFree,isLow,isPaid,splurge,label:txt||'CHECK PRICE'};
}
function setActivitySpend(spend,btn){
  activitySpend=spend;localStorage.setItem('tripActivitySpend',spend);
  document.querySelectorAll('#activitySpendChips button').forEach(b=>b.classList.toggle('on',b===btn));
  applyActivityFilters();
}
function syncActivitySpendChips(){
  let ok=false;
  document.querySelectorAll('#activitySpendChips button').forEach(b=>{
    let on=b.dataset.spend===activitySpend;b.classList.toggle('on',on);if(on)ok=true;
  });
  if(!ok){activitySpend='Any';document.querySelector('#activitySpendChips button')?.classList.add('on')}
}
function setActivityFilter(filter,btn){
  activityFilter=filter;
  document.querySelectorAll('#activityFilterChips button').forEach(b=>b.classList.toggle('on',b===btn));
  applyActivityFilters();
}
function spendMatches(info){
  if(activitySpend==='Any')return true;
  if(activitySpend==='Save')return info.tier==='save';
  if(activitySpend==='Paid')return info.isPaid;
  if(activitySpend==='Splurge')return info.splurge;
  return true;
}
function spendHintText(count){
  let cat=activityFilter==='All'?'':` • ${activityFilter}`;
  if(activitySpend==='Save')return `${count} result${count===1?'':'s'}${cat}. Free / low-cost ideas use the guide’s existing FREE, FREE/LOW and LOW PAID labels.`;
  if(activitySpend==='Paid')return `${count} result${count===1?'':'s'}${cat}. Paid experiences can be great value — this filter does not assume “expensive.”`;
  if(activitySpend==='Splurge')return `${count} result${count===1?'':'s'}${cat}. Bigger-memory paid experiences such as scuba, island days, ziplines, theme parks or major excursions.`;
  return `${count} result${count===1?'':'s'}${cat}. Mix free and paid options freely.`;
}
function decorateActivityBudgets(){
  document.querySelectorAll('.activity-row').forEach(row=>{
    let info=activitySpendInfo(row);
    row.dataset.budgetTier=info.tier;
    if(info.splurge && !row.querySelector('.activity-budget-note')){
      let badges=row.querySelector('.act-copy>div');
      if(badges){
        let s=document.createElement('span');
        s.className='activity-budget-note splurge';
        s.textContent='BIG MEMORY';
        badges.appendChild(s);
      }
    }
  });
}
function applyActivityFilters(){
  syncActivitySpendChips();
  decorateActivityBudgets();
  let q=(document.getElementById('activitySearch')?.value||'').trim().toLowerCase();
  let total=0;
  document.querySelectorAll('.activity-row').forEach(r=>{
    let txt=((r.dataset.search||'')+' '+(r.textContent||'')).toLowerCase();
    let tags=classifyActivityText(txt),spend=activitySpendInfo(r);
    let show=(!q||txt.includes(q))&&(activityFilter==='All'||tags.includes(activityFilter))&&spendMatches(spend);
    r.style.display=show?'flex':'none';
    if(show&&!r.closest('.scope-out'))total++;
  });

  document.querySelectorAll('.activity-city').forEach(city=>{
    let visible=[...city.querySelectorAll('.activity-row')].some(r=>r.style.display!=='none');
    city.classList.toggle('no-results',!visible && (q||activityFilter!=='All'||activitySpend!=='Any'));
  });

  if(q||activityFilter!=='All'||activitySpend!=='Any'){
    document.querySelectorAll('.activity-city:not(.no-results) .activity-head').forEach(b=>b.setAttribute('aria-expanded','true'));
  }

  let count=document.getElementById('activityResultCount');
  if(count)count.textContent=`${total} shown`;
  let hint=document.getElementById('activitySpendHint');
  if(hint)hint.textContent=spendHintText(total);
}
function filterActivities(){applyActivityFilters()}


const APP_KEY='tripCompanionV1';
/* City data now comes from js/data-*.js (TRIP_DATA). These maps keep the v15 code paths working for every city. */
const CITIES=Object.keys(TD.cities);
const CITY_META={},TRAVEL_META={},CITY_PICKS={},BASE_GUIDE={},NIGHT_GUIDE={},WEATHER_COORDS={};
CITIES.forEach(n=>{
  const c=TD.cities[n];
  CITY_META[n]={accent:c.accent,base:c.base,focus:c.why,next:c.next,watch:c.avoid};
  TRAVEL_META[n]=Object.assign({},TD.countries[c.country].travel,c.travel);
  CITY_PICKS[n]=c.picks||[];
  BASE_GUIDE[n]=c.stays||[];
  NIGHT_GUIDE[n]=c.night||[];
  WEATHER_COORDS[n]=c.coords;
});
const WEATHER_TRANSLATE=TD.weatherTranslate;
const INTERCITY_GUIDE=TD.intercity;
let guideCity=localStorage.getItem('tripGuideCity');
if(!guideCity||!TD.cities[guideCity])guideCity='Kuala Lumpur';

function loadApp(){
  try{return JSON.parse(localStorage.getItem(APP_KEY))||{} }catch(e){return {}}
}
function saveApp(data){localStorage.setItem(APP_KEY,JSON.stringify(data))}
function appData(){
  const d=loadApp();
  d.profile=d.profile||null; d.settings=d.settings||{tripName:'Malaysia × Thailand',travellers:'Tamseel, Ayesha',homeCurrency:'PKR'};
  d.plans=d.plans||[]; d.tickets=d.tickets||[]; d.rides=d.rides||[]; d.expenses=d.expenses||[]; d.budgets=d.budgets||{};
  d.details=d.details||[]; d.notes=d.notes||[]; d.citySetup=d.citySetup||{}; d.arrival=d.arrival||null; d.interests=d.interests||[]; d.weather=d.weather||{}; d.onboardingDone=!!d.onboardingDone; d.invites=d.invites||[]; d.dailyCheckins=d.dailyCheckins||{}; d.journeyStops=d.journeyStops||{};
  return d;
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function todayISO(){let d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})}
function fmtDate(s){if(!s)return 'Date not set';let d=new Date(s+'T12:00:00');return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
function fmtDateTime(date,time){return [fmtDate(date),time||''].filter(Boolean).join(' • ')}
function openModal(id){
  document.getElementById(id)?.classList.add('open');
  if(id==='profileModal'){let d=appData();editName.value=d.profile?.name||'';editEmail.value=d.profile?.email||''}
  if(id==='tripSettingsModal'){fillTripSettings()}
  presetDates();
  let m=TRAVEL_META[guideCity],s=citySetup();
  if(id==='planModal'){planCity.value=guideCity; if(!planCurrency.value)planCurrency.value=m.currency}
  if(id==='rideModal'){rideCity.value=guideCity; if(!rideCurrency.value)rideCurrency.value=m.currency; if(!rideFrom.value)rideFrom.value=s.stay||CITY_META[guideCity].base}
  if(id==='expenseModal'){expenseCity.value=guideCity; if(!expenseCurrency.value)expenseCurrency.value=m.currency}
  if(id==='ticketModal'){if(!ticketCurrency.value)ticketCurrency.value=m.currency}
}
function closeModal(id){document.getElementById(id)?.classList.remove('open')}
function backdropClose(e){if(e.target.classList.contains('modal-backdrop'))e.target.classList.remove('open')}
function presetDates(){
  ['planDate','ticketDate','rideDate','expenseDate'].forEach(id=>{let el=document.getElementById(id);if(el&&!el.value)el.value=todayISO()});
}
function fillSelects(){
  let ac=document.getElementById('arrivalCity'); if(ac){ac.innerHTML=cityOptionsHTML(false);}

  ['planCity','rideCity','expenseCity','detailCity','noteCity'].forEach(id=>{
    let el=document.getElementById(id); if(!el)return;
    el.innerHTML=cityOptionsHTML(true);
  });
}
function setGuideCity(c){guideCity=c;localStorage.setItem('tripGuideCity',c);renderCityPickers();renderGuide();renderCitySetup();renderWeatherCard();renderTransportAssistant();renderQuickStay();renderHomeWeather();renderNearbyChoices();renderSmartPlan();renderSmartNext();renderFlightContext();renderTonightV6();renderStayAreas();renderNightTravel();renderDaybook();renderKeyDates();renderHomeCityHeadline();renderJourney();if(document.getElementById('essentials')?.classList.contains('active'))renderEssentials();setTimeout(()=>refreshOfficialWeather(true),60)}
function showTab(id,b){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
  if(b)b.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='home'||id==='wallet'||id==='trip'||id==='daybook'||id==='activities'||id==='journey')renderApp();
  if(id==='activities'){enhanceActivityRows();applyActivityFilters()}
  if(id==='daybook')renderDaybook();
  if(id==='essentials')renderEssentials();
  if(['route','stayeats','activities','clusters'].includes(id)){renderScopeChips();applyExploreScope();}
}
function fillTripSettings(){
  let s=appData().settings||{};
  tripName.value=s.tripName||'Malaysia × Thailand';tripStart.value=s.start||'';tripEnd.value=s.end||'';
  tripTravellers.value=s.travellers||'';homeCurrency.value=s.homeCurrency||'PKR';emergencyContact.value=s.emergencyContact||'';
}
function updateCountdown(){
  let d=appData(), s=d.settings||{}, el=document.getElementById('tripCountdown'); if(!el)return;
  if(!s.start){el.textContent='Add trip dates';return}
  let now=new Date();now.setHours(0,0,0,0);let start=new Date(s.start+'T00:00:00'), end=s.end?new Date(s.end+'T23:59:59'):null;
  let days=Math.ceil((start-now)/86400000);
  if(days>1)el.textContent=`${days} days until ${s.tripName||'your trip'}`;
  else if(days===1)el.textContent='Your trip starts tomorrow';
  else if(days===0)el.textContent='Your trip starts today ✈';
  else if(end && now<=end)el.textContent='You are on the trip ✦';
  else el.textContent='Trip dates saved';
}
function renderProfile(){
  let d=appData(), p=d.profile, locked=!d.onboardingDone;
  document.body.classList.toggle('app-locked',locked);
  document.getElementById('onboarding')?.classList.toggle('hidden',!locked);
  if(p){
    userChip.textContent=(p.name||'Traveller').split(' ')[0];
    helloName.textContent=`Hi ${(p.name||'traveller').split(' ')[0]} — here’s what matters.`;
  }
  if(locked){
    if(!p)showOnboardingStep(1);
    else if(!d.arrival)showOnboardingStep(2);
    else showOnboardingStep(3);
  }
}
function sortByDateTime(arr){return [...arr].sort((a,b)=>(String(a.date||'9999')+String(a.time||'')).localeCompare(String(b.date||'9999')+String(b.time||'')))}
function renderToday(){
  let d=appData(), today=todayISO();todayDate.textContent=new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
  let list=sortByDateTime(d.plans.filter(x=>x.date===today));
  todayPlans.innerHTML=list.length?list.map(planHTML).join(''):`<div class="empty-state">Nothing timed for today yet. Add a plan when you know what the day looks like.</div>`;
}
function planHTML(x){
 return `<div class="data-item"><div class="data-item-top"><div><strong>${esc(x.time?x.time+' • ':'')}${esc(x.title)}</strong><p>${esc(x.city||'General')}${x.notes?' — '+esc(x.notes):''}</p></div><div class="item-actions"><button onclick="deleteItem('plans','${x.id}')">Delete</button></div></div>
 <div class="item-meta"><span>${esc(x.type||'Plan')}</span>${x.cost?`<span>${esc(x.currency||'')} ${money(x.cost)}</span>`:''}</div></div>`
}
function renderUpcomingTickets(){
  let d=appData(), today=todayISO(), list=sortByDateTime(d.tickets.filter(x=>!x.date||x.date>=today)).slice(0,4);
  upcomingTickets.innerHTML=list.length?list.map(ticketHTML).join(''):`<div class="empty-state">No upcoming tickets saved yet.</div>`;
}
function ticketHTML(x){
  return `<div class="data-item"><div class="data-item-top"><div><strong>${esc(x.title)}</strong><p>${esc(x.type||'Booking')}${x.provider?' • '+esc(x.provider):''}<br>${esc(fmtDateTime(x.date,x.time))}</p></div><div class="item-actions"><button onclick="deleteItem('tickets','${x.id}')">Delete</button></div></div>
  <div class="item-meta">${x.ref?`<span>Ref ${esc(x.ref)}</span>`:''}${x.seat?`<span>${esc(x.seat)}</span>`:''}${x.amount?`<span>${esc(x.currency||'')} ${money(x.amount)}</span>`:''}</div>${x.notes?`<p>${esc(x.notes)}</p>`:''}</div>`
}
function rideHTML(x){
 return `<div class="data-item"><div class="data-item-top"><div><strong>${esc(x.service||'Ride')} • ${esc(x.from)} → ${esc(x.to)}</strong><p>${esc(fmtDateTime(x.date,x.time))}${x.city?' • '+esc(x.city):''}</p></div><div class="item-actions"><button onclick="deleteItem('rides','${x.id}')">Delete</button></div></div>
 <div class="item-meta">${x.fare?`<span>${esc(x.currency||'')} ${money(x.fare)}</span>`:''}${x.paidBy?`<span>Paid by ${esc(x.paidBy)}</span>`:''}${x.ref?`<span>${esc(x.ref)}</span>`:''}</div></div>`
}
function expenseHTML(x){
 return `<div class="data-item"><div class="data-item-top"><div><strong>${esc(x.title)}</strong><p>${esc(fmtDate(x.date))}${x.city?' • '+esc(x.city):''}</p></div><div class="item-actions"><button onclick="deleteItem('expenses','${x.id}')">Delete</button></div></div>
 <div class="item-meta"><span>${esc(x.category||'Expense')}</span><span>${esc(x.currency)} ${money(x.amount)}</span>${x.paidBy?`<span>${esc(x.paidBy)}</span>`:''}</div></div>`
}
function detailHTML(x){
 return `<div class="data-item"><div class="data-item-top"><div><strong>${esc(x.label)}</strong><p>${esc(x.value)}</p></div><div class="item-actions"><button onclick="deleteItem('details','${x.id}')">Delete</button></div></div><div class="item-meta"><span>${esc(x.category||'Detail')}</span>${x.city?`<span>${esc(x.city)}</span>`:''}</div></div>`
}
function noteHTML(x){
 return `<div class="data-item"><div class="data-item-top"><div><strong>${esc(x.tag||'Note')}</strong><p>${esc(x.text)}</p></div><div class="item-actions"><button onclick="deleteItem('notes','${x.id}')">Delete</button></div></div><div class="item-meta">${x.city?`<span>${esc(x.city)}</span>`:''}</div></div>`
}
function renderTrip(){
 let d=appData();
 ticketList.innerHTML=d.tickets.length?sortByDateTime(d.tickets).map(ticketHTML).join(''):`<div class="empty-state">Add your flights, ferries, hotels and activity bookings here.</div>`;
 rideList.innerHTML=d.rides.length?sortByDateTime(d.rides).reverse().map(rideHTML).join(''):`<div class="empty-state">Your Grab/taxi rides can live here instead of scattered screenshots.</div>`;
 detailList.innerHTML=d.details.length?d.details.map(detailHTML).join(''):`<div class="empty-state">Save hotel addresses, SIM info, insurance contacts and meeting points.</div>`;
 noteList.innerHTML=d.notes.length?d.notes.map(noteHTML).join(''):`<div class="empty-state">No notes yet.</div>`;
}

function spendMaps(expenses){
  let all={},today={},cats={};
  (expenses||[]).forEach(x=>{
    let c=(x.currency||'').toUpperCase()||'—',a=Number(x.amount||0);
    all[c]=(all[c]||0)+a;
    if(x.date===todayISO())today[c]=(today[c]||0)+a;
    let cat=x.category||'Other';cats[cat]=cats[cat]||{};cats[cat][c]=(cats[cat][c]||0)+a;
  });
  return {all,today,cats};
}
function compactMoneyMap(map,empty='Nothing yet'){
  let entries=Object.entries(map||{}).filter(([,v])=>Number(v)!==0);
  if(!entries.length)return empty;
  return entries.slice(0,2).map(([c,v])=>`${c} ${money(v)}`).join(' · ')+(entries.length>2?' + more':'');
}
function renderHomeMoney(){
  let d=appData(),m=spendMaps(d.expenses);
  let spent=document.getElementById('homeTripSpent');if(!spent)return;
  spent.textContent=compactMoneyMap(m.all);
  document.getElementById('homeExpenseCount').textContent=`${d.expenses.length} expense${d.expenses.length===1?'':'s'}`;
  document.getElementById('homeTodaySpent').textContent=compactMoneyMap(m.today);
  let todayCount=(d.expenses||[]).filter(x=>x.date===todayISO()).length;
  let c=document.getElementById('homeTodayCount');if(c)c.textContent=`${todayCount} entr${todayCount===1?'y':'ies'}`;
  let lbl=document.getElementById('checkinDayLabel');if(lbl)lbl.textContent=new Date().toLocaleDateString([], {weekday:'short',month:'short',day:'numeric'});
  renderSmartCheckin();
}
function renderCategorySummary(){
  let el=document.getElementById('categorySummary');if(!el)return;
  let d=appData(),cats=spendMaps(d.expenses).cats;
  let order=['Stay','Flight / transport','Food','Ride','Activity','Shopping','Nightlife','SIM / data','Other'];
  let rows=order.filter(k=>cats[k]&&Object.keys(cats[k]).length);
  el.innerHTML=rows.length?rows.map(cat=>`<div class="category-row"><span class="category-name">${esc(cat)}</span><span class="category-values">${esc(compactMoneyMap(cats[cat],''))}</span></div>`).join(''):`<div class="category-empty">Your category breakdown will appear after you add spending.</div>`;
}

function renderWallet(){
 let d=appData(), sums={};
 d.expenses.forEach(x=>{let c=(x.currency||'').toUpperCase()||'—';sums[c]=(sums[c]||0)+Number(x.amount||0)});
 let currencies=[...new Set([...Object.keys(d.budgets),...Object.keys(sums)])];
 currencySummary.innerHTML=currencies.length?currencies.map(c=>{
   let spent=sums[c]||0,b=Number(d.budgets[c]||0),pct=b?Math.min(100,(spent/b)*100):0;
   return `<div class="currency-box"><strong>${esc(c)} ${money(spent)}</strong><span>${b?`of ${money(b)} budget`:'spent'}</span>${b?`<div class="progress"><i style="width:${pct}%"></i></div>`:''}</div>`
 }).join('')+(()=>{let a=approxHomeTotal(sums);return a&&currencies.length?`<div class="currency-box approx"><strong>≈ ${a.home} ${money(Math.round(a.total))}</strong><span>everything converted · ${esc(a.stamp)}</span></div>`:''})():`<div class="currency-box"><strong>No spend yet</strong><span>Add your first expense</span></div>`;
 expenseCount.textContent=`${d.expenses.length} item${d.expenses.length===1?'':'s'}`;
 expenseList.innerHTML=d.expenses.length?sortByDateTime(d.expenses).reverse().slice(0,30).map(expenseHTML).join(''):`<div class="empty-state">Expenses will appear here, grouped safely by their real currency.</div>`;
 renderCategorySummary();
}

function citySetup(){
  let d=appData(); return d.citySetup[guideCity]||{};
}
function renderCitySetup(){
  let s=citySetup(), m=TRAVEL_META[guideCity];
  let date=document.getElementById('homeArrivalDate'),time=document.getElementById('homeArrivalTime'),ap=document.getElementById('homeArrivalPoint'),stay=document.getElementById('homeStay');
  if(!date)return;
  date.value=s.date||''; time.value=s.time||''; ap.value=s.arrivalPoint||m.airport; stay.value=s.stay||'';
  let sum=document.getElementById('arrivalSummary');
  if(!s.date&&!s.stay){sum.textContent=`Start with your ${guideCity} arrival date and accommodation. That is enough to unlock the useful next-step cards.`;return}
  let bits=[];
  if(s.date)bits.push(`Arrive ${fmtDate(s.date)}${s.time?' • '+s.time:''}`);
  if(s.stay)bits.push(`Stay: ${s.stay}`);
  sum.textContent=bits.join('  ·  ');
}
function saveCitySetup(){
  let d=appData();
  d.citySetup[guideCity]={
    date:document.getElementById('homeArrivalDate').value,
    time:document.getElementById('homeArrivalTime').value,
    arrivalPoint:document.getElementById('homeArrivalPoint').value.trim(),
    stay:document.getElementById('homeStay').value.trim()
  };
  saveApp(d); renderCitySetup(); renderTransportAssistant();
}
function renderWeatherCard(){
  let el=document.getElementById('weatherNow'); if(!el)return;
  let m=TRAVEL_META[guideCity];
  el.innerHTML=`<strong>${esc(guideCity)} — live official check</strong>
    <p>Weather changes too quickly to store a stale number here. Open the official ${m.cc==='MY'?'MET Malaysia':'Thai Meteorological Department'} forecast before leaving, and use radar/warnings if rain or storms could change the day.</p>`;
}
function openOfficialWeather(){window.open(TRAVEL_META[guideCity].weather,'_blank','noopener')}
function openWeatherRadar(){window.open(TRAVEL_META[guideCity].radar,'_blank','noopener')}

function renderTransportAssistant(){
  let m=TRAVEL_META[guideCity], s=citySetup();
  let from=document.getElementById('transportFrom'); if(!from)return;
  if(!from.value)from.value=s.stay||CITY_META[guideCity].base;
  document.getElementById('fareCurrencyBadge').textContent=m.currency;
  document.getElementById('transportAdvice').innerHTML=`<strong>${esc(guideCity)}:</strong> ${esc(m.advice)}`;
  document.getElementById('intercityLinks').innerHTML=m.intercity.map(x=>`<button onclick="window.open('${x[1]}','_blank','noopener')">${esc(x[0])}</button>`).join('');
}
function fillTransportFromStay(){
  let s=citySetup(); document.getElementById('transportFrom').value=s.stay||CITY_META[guideCity].base;
}
function routeParts(){
  let from=document.getElementById('transportFrom')?.value.trim()||citySetup().stay||CITY_META[guideCity].base;
  let to=document.getElementById('transportTo')?.value.trim()||'';
  return {from,to};
}
function planTransport(){
  let r=routeParts(),m=TRAVEL_META[guideCity],el=document.getElementById('transportAdvice');
  if(!r.to){el.innerHTML='<strong>Add a destination first.</strong> Then the route buttons will open with the same From → To pair.';return}
  let airport=/airport|klia|suvarnabhumi|don mueang|terminal/i.test(r.from+' '+r.to);
  let msg=m.advice;
  if(airport && m.airportOfficial)msg+=` Because this looks like an airport trip, also compare the official airport transport option before choosing a car.`;
  el.innerHTML=`<strong>${esc(r.from)} → ${esc(r.to)}</strong><br>${esc(msg)}`;
}
function mapsUrl(mode){
  let r=routeParts(); if(!r.to){planTransport();return null}
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(r.to)}&travelmode=${mode}`;
}
function openGoogleTransit(){let u=mapsUrl('transit');if(u)window.open(u,'_blank','noopener')}
function openGoogleDrive(){let u=mapsUrl('driving');if(u)window.open(u,'_blank','noopener')}
function openGrabQuote(){window.open(TRAVEL_META[guideCity].grab,'_blank','noopener')}
function openInDriveQuote(){window.open(TRAVEL_META[guideCity].indrive,'_blank','noopener')}
function openMoovit(){window.open('https://moovit.com/','_blank','noopener')}
function openOfficialFare(){
  let r=routeParts(),m=TRAVEL_META[guideCity];
  let airport=/airport|klia|suvarnabhumi|don mueang|terminal/i.test(r.from+' '+r.to);
  window.open(airport&&m.airportOfficial?m.airportOfficial:m.officialFare,'_blank','noopener');
}
function quoteNumber(id){
  let n=parseFloat((document.getElementById(id)?.value||'').replace(/,/g,'')); return Number.isFinite(n)&&n>0?n:null;
}
function compareTransportQuotes(){
  let vals=[
    ['Public transport',quoteNumber('quotePublic')],
    ['Grab',quoteNumber('quoteGrab')],
    ['inDrive',quoteNumber('quoteInDrive')]
  ].filter(x=>x[1]!==null);
  let el=document.getElementById('bestFareResult'); if(!el)return;
  if(!vals.length){el.className='best-fare';el.textContent='Open the apps/calculator, then enter the prices here.';return}
  vals.sort((a,b)=>a[1]-b[1]); let best=vals[0],cur=TRAVEL_META[guideCity].currency;
  el.className='best-fare win'; el.textContent=`Cheapest entered fare: ${best[0]} — ${cur} ${money(best[1])}. Also consider luggage, transfers and weather before choosing.`;
}
function saveBestRide(){
  let r=routeParts(); if(!r.to){planTransport();return}
  let vals=[
    ['Public transport',quoteNumber('quotePublic')],
    ['Grab',quoteNumber('quoteGrab')],
    ['inDrive',quoteNumber('quoteInDrive')]
  ].filter(x=>x[1]!==null).sort((a,b)=>a[1]-b[1]);
  if(!vals.length){compareTransportQuotes();return}
  let d=appData(),best=vals[0],m=TRAVEL_META[guideCity];
  d.rides.push({id:uid(),date:todayISO(),time:'',service:best[0],city:guideCity,from:r.from,to:r.to,fare:best[1],currency:m.currency,ref:'Transport Assistant comparison',paidBy:''});
  saveApp(d);renderApp();alert(`Saved ${best[0]} — ${m.currency} ${money(best[1])} to the ride log.`);
}


function showOnboardingStep(n){
  [1,2,3].forEach(i=>{
    document.getElementById('onStep'+i)?.classList.toggle('hidden',i!==n);
    document.getElementById('onDot'+i)?.classList.toggle('on',i<=n);
  });
  if(n===2){
    let d=appData(),a=d.arrival||{};
    arrivalCity.value=a.city||myRoute()[0]||guideCity;
    arrivalDate.value=a.date||tripDates().start;
    arrivalTime.value=a.time||'';
    arrivalAirport.value=a.airport||TRAVEL_META[arrivalCity.value].airport;
    arrivalFlight.value=a.flight||'';
  }
  if(n===3){
    let selected=new Set(appData().interests||[]);
    document.querySelectorAll('#interestPicker button').forEach(b=>b.classList.toggle('selected',selected.has(b.dataset.interest)));
  }
}
function toggleInterest(btn){btn.classList.toggle('selected')}
function finishOnboarding(balanced=false){
  let d=appData();
  let picks=[...document.querySelectorAll('#interestPicker button.selected')].map(b=>b.dataset.interest);
  d.interests=balanced||!picks.length?['Food','Nature','Culture','Relax']:picks;
  d.onboardingDone=true;
  saveApp(d);
  if(d.arrival?.city){guideCity=d.arrival.city;localStorage.setItem('tripGuideCity',guideCity)}
  renderApp();
  showTab('home',document.getElementById('navHome'));
  setTimeout(()=>refreshOfficialWeather(true),200);
}
function saveQuickStay(){
  let val=document.getElementById('quickStay').value.trim();
  if(!val)return;
  let d=appData(),s=d.citySetup[guideCity]||{};
  s.stay=val;
  if(!s.arrivalPoint)s.arrivalPoint=TRAVEL_META[guideCity].airport;
  d.citySetup[guideCity]=s;
  saveApp(d);
  renderQuickStay();renderStayAreas();renderNearbyChoices();renderSmartNext();renderSmartPlan();renderTonightV6();
}
function renderQuickStay(){
  let el=document.getElementById('quickStay'); if(!el)return;
  let s=citySetup();el.value=s.stay||'';
  let hint=document.getElementById('stayHint');
  hint.textContent=s.stay?`Using ${s.stay} as your starting point for ${guideCity}.`:`Add your ${guideCity} stay once. I’ll immediately surface places worth doing from that base.`;
}
function arrivalSummaryText(){
  let a=appData().arrival;if(!a)return '';
  return `${fmtDate(a.date)}${a.time?' • '+a.time:''}${a.flight?' • '+a.flight:''}`;
}
function renderSmartNext(){
  let el=document.getElementById('smartNext'); if(!el)return;
  let d=appData(),a=d.arrival,s=citySetup(),m=CITY_META[guideCity],w=d.weather[guideCity];
  document.getElementById('nextCityLabel').textContent=guideCity;
  let today=todayISO(), main='',copy='',buttons='';
  if(a && a.city===guideCity && a.date>=today){
    if(a.date===today){
      main=`Land → get to your stay → keep the first plan light`;
      copy=`Arrival: ${arrivalSummaryText()}. ${s.stay?`Your base is ${esc(s.stay)}.`:'Add your stay and I’ll show the easiest first options around it.'}`;
    }else{
      main=`You land in ${guideCity} on ${fmtDate(a.date)}`;
      copy=`${a.time||'Arrival time saved'}. Before then, save your first stay. On landing day I’ll keep the plan light instead of sending you across the city.`;
    }
  } else if(!s.stay){
    main=`First: add where you’re staying in ${guideCity}`;
    copy=`One field only. Then I’ll surface practical nearby picks and the transport I’d use for each.`;
  } else {
    let first=rankedPicks()[0];
    main=first?`Good next move: ${first.name}`:`Your ${guideCity} base is ready`;
    copy=first?`${first.why} Best transport from your base: ${first.modeLabel}.`:`I’ll build suggestions around ${s.stay}.`;
  }
  if(w?.state==='rain'||w?.state==='storm')copy+=` Weather is leaning wet, so I’m pushing indoor/mixed plans upward.`;
  el.innerHTML=`<div class="smart-next-main">${esc(main)}</div><div class="smart-next-copy">${copy}</div>
    <div class="smart-next-actions">${!s.stay?`<button class="primary-home-btn" onclick="quickStay.focus();quickStay.scrollIntoView({behavior:'smooth',block:'center'})">Add stay</button>`:`<button class="primary-home-btn" onclick="document.getElementById('nearbyChoices').scrollIntoView({behavior:'smooth'})">Show my best options</button>`}
    <button class="ghost-btn" onclick="openModal('ticketModal')">Add booking</button></div>`;
}
function weatherStateFromText(t){
  t=(t||'').toLowerCase();
  if(/thunder|storm|ribut/.test(t))return 'storm';
  if(/rain|hujan|shower/.test(t))return 'rain';
  if(/haze|jerebu/.test(t))return 'haze';
  if(/no rain|clear|sun|fine|tiada hujan/.test(t))return 'dry';
  return 'unknown';
}
function setWeatherState(state,label){
  let d=appData();d.weather[guideCity]={date:todayISO(),state,summary:label||state,manual:true};saveApp(d);
  renderHomeWeather();renderNearbyChoices();renderSmartPlan();renderSmartNext();
}


function wmoWeather(code){
  code=Number(code);
  if(code===0)return {label:'Clear sky',state:'dry',icon:'☀️'};
  if([1,2].includes(code))return {label:'Partly cloudy',state:'dry',icon:'🌤️'};
  if(code===3)return {label:'Cloudy',state:'dry',icon:'☁️'};
  if([45,48].includes(code))return {label:'Foggy',state:'haze',icon:'🌫️'};
  if([51,53,55,56,57].includes(code))return {label:'Drizzle',state:'rain',icon:'🌦️'};
  if([61,63,65,66,67,80,81,82].includes(code))return {label:'Rain / showers',state:'rain',icon:'🌧️'};
  if([71,73,75,77,85,86].includes(code))return {label:'Snow',state:'rain',icon:'🌨️'};
  if([95,96,99].includes(code))return {label:'Thunderstorms',state:'storm',icon:'⛈️'};
  return {label:'Mixed conditions',state:'unknown',icon:'🌦️'};
}
async function fetchOpenMeteo(city){
  let c=WEATHER_COORDS[city];if(!c)throw new Error('No coordinates');
  let u=`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm&timezone=auto&forecast_days=2`;
  let res=await fetch(u,{cache:'no-store',headers:{'Accept':'application/json'}});
  if(!res.ok)throw new Error('Open-Meteo '+res.status);
  let j=await res.json(),cur=j.current||{},daily=j.daily||{},condition=wmoWeather(cur.weather_code);
  return {
    date:todayISO(),state:condition.state,summary:condition.label,icon:condition.icon,
    temp:Number(cur.temperature_2m),feels:Number(cur.apparent_temperature),
    humidity:Number(cur.relative_humidity_2m),wind:Number(cur.wind_speed_10m),
    precipitation:Number(cur.precipitation),rain:Number(cur.rain),
    min:Array.isArray(daily.temperature_2m_min)?Number(daily.temperature_2m_min[0]):null,
    max:Array.isArray(daily.temperature_2m_max)?Number(daily.temperature_2m_max[0]):null,
    rainChance:Array.isArray(daily.precipitation_probability_max)?Number(daily.precipitation_probability_max[0]):null,
    source:'Open-Meteo forecast models',updatedAt:new Date().toISOString(),live:true
  };
}
async function refreshOfficialWeather(silent=false){
  let el=document.getElementById('weatherNow');if(!el)return;
  let m=TRAVEL_META[guideCity];
  if(!silent)el.innerHTML='<div class="weather-loading">Loading live weather…</div>';

  if(m.cc==='MY'&&m.metName){
    try{
      let u='https://api.data.gov.my/weather/forecast?contains='+encodeURIComponent(m.metName)+'@location__location_name';
      let res=await fetch(u,{headers:{'Accept':'application/json'}});
      if(!res.ok)throw new Error('MET '+res.status);
      let rows=await res.json();
      let row=(Array.isArray(rows)?rows:[]).find(x=>x.date===todayISO())||(Array.isArray(rows)?rows[0]:null);
      if(!row)throw new Error('No MET forecast');
      let raw=row.summary_forecast||row.afternoon_forecast||row.morning_forecast||'Forecast available';
      let summary=WEATHER_TRANSLATE[raw]||raw;
      let fallback=await fetchOpenMeteo(guideCity).catch(()=>null);
      let d=appData();
      d.weather[guideCity]={
        date:row.date,state:weatherStateFromText(summary+' '+raw),summary,
        temp:fallback?.temp??null,feels:fallback?.feels??null,humidity:fallback?.humidity??null,
        wind:fallback?.wind??null,rainChance:fallback?.rainChance??null,
        min:row.min_temp??fallback?.min,max:row.max_temp??fallback?.max,
        icon:fallback?.icon||'🌦️',source:'MET Malaysia forecast',updatedAt:new Date().toISOString(),live:true
      };
      saveApp(d);renderHomeWeather();renderNearbyChoices();renderSmartPlan();return;
    }catch(err){
      try{
        let w=await fetchOpenMeteo(guideCity),d=appData();w.source='Open-Meteo fallback • check MET Malaysia for official warnings';d.weather[guideCity]=w;saveApp(d);renderHomeWeather();renderNearbyChoices();return;
      }catch(e){renderHomeWeather(true);return}
    }
  }

  // Thailand: use a browser-friendly live model API so weather is visible in-card.
  try{
    let w=await fetchOpenMeteo(guideCity),d=appData();
    w.source='Open-Meteo live forecast • TMD remains the official warning/radar source';
    d.weather[guideCity]=w;saveApp(d);renderHomeWeather();renderNearbyChoices();renderSmartPlan();
  }catch(err){
    renderHomeWeather(true);
    if(!silent)showToast('Could not refresh live weather. Showing the last saved forecast if available.');
  }
}
function renderHomeWeather(fetchFailed=false){
  let el=document.getElementById('weatherNow'),fb=document.getElementById('weatherFallback');if(!el||!fb)return;
  let d=appData(),w=d.weather[guideCity],m=TRAVEL_META[guideCity];
  document.getElementById('weatherSourceLabel').textContent=m.cc==='MY'?'MET Malaysia':'Live forecast';

  if(w&&w.date===todayISO()&&Number.isFinite(Number(w.temp))){
    let icon=w.icon||({dry:'☀️',rain:'🌧️',storm:'⛈️',haze:'🌫️'}[w.state]||'🌦️');
    let meta=[];
    if(Number.isFinite(Number(w.feels)))meta.push(`Feels ${Math.round(w.feels)}°`);
    if(Number.isFinite(Number(w.min))&&Number.isFinite(Number(w.max)))meta.push(`${Math.round(w.min)}°–${Math.round(w.max)}°`);
    if(Number.isFinite(Number(w.rainChance)))meta.push(`Rain ${Math.round(w.rainChance)}%`);
    if(Number.isFinite(Number(w.humidity)))meta.push(`Humidity ${Math.round(w.humidity)}%`);
    if(Number.isFinite(Number(w.wind)))meta.push(`Wind ${Math.round(w.wind)} km/h`);
    el.innerHTML=`<div class="weather-live-grid"><div class="weather-live-temp">${Math.round(w.temp)}°</div><div class="weather-live-main"><strong>${icon} ${esc(w.summary||'Current weather')}</strong><p>${esc(guideCity)} right now</p></div></div>
      <div class="weather-live-meta">${meta.slice(0,5).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
      <div class="weather-source-line">${esc(w.source||'Weather source')}</div>
      ${fetchFailed?'<div class="weather-stale">Refresh failed — this is the last weather saved on this device.</div>':''}`;
    fb.innerHTML='';
    return;
  }

  // Malaysia's official feed may occasionally have forecast but no current temperature.
  if(w&&w.date===todayISO()){
    let temp=(w.min!=null||w.max!=null)?`${w.min??'–'}°–${w.max??'–'}°`:'';
    el.innerHTML=`<strong>🌦️ ${esc(w.summary||guideCity+' forecast')} ${temp}</strong><p>${esc(w.source||'Weather source')}</p>`;
  }else{
    el.innerHTML=`<strong>🌦️ ${esc(guideCity)} weather unavailable</strong><p>Tap Refresh. Official warning/radar links still work below.</p>`;
  }
  fb.innerHTML='';
}

function interestScore(p){
  let ints=appData().interests||[];
  return p.tags.reduce((n,t)=>n+(ints.includes(t)?2:0),0);
}
let quickMode=localStorage.getItem('tripQuickMode')||'Normal';
function rankedPicks(){
  let d=appData(),w=d.weather[guideCity]?.state||'unknown';
  return [...(CITY_PICKS[guideCity]||[])].map(p=>{
    let score=interestScore(p);
    if((w==='rain'||w==='storm')&&p.weather==='indoor')score+=4;
    if((w==='rain'||w==='storm')&&p.weather==='mixed')score+=2;
    if((w==='rain'||w==='storm')&&p.weather==='outdoor')score-=5;
    if((w==='dry'||w==='haze')&&p.weather==='outdoor')score+=2;
    if(quickMode==='Rainy'){
      if(p.weather==='indoor')score+=7;
      if(p.weather==='mixed')score+=3;
      if(p.weather==='outdoor')score-=8;
    }
    if(quickMode==='Tired'){
      if(/walk|short ride|train/i.test(p.modeLabel||''))score+=4;
      if(/day trip|dedicated day|full day|adventure/i.test((p.kind||'')+' '+(p.why||'')))score-=5;
      if((p.tags||[]).includes('Relax')||(p.tags||[]).includes('Food')||(p.tags||[]).includes('Cafe'))score+=3;
    }
    return {...p,_score:score};
  }).sort((a,b)=>b._score-a._score);
}

let homeMood=localStorage.getItem('tripHomeMood')||'For you';
const MOOD_THEME={
  'For you':{accent:'#2563eb',soft:'#eff6ff'},
  'Adventure':{accent:'#0891b2',soft:'#ecfeff'},
  'Nightlife':{accent:'#6d28d9',soft:'#f5f3ff'},
  'Social':{accent:'#db2777',soft:'#fdf2f8'},
  'Food':{accent:'#ea580c',soft:'#fff7ed'},
  'Cafe':{accent:'#a16207',soft:'#fffbeb'},
  'Shopping':{accent:'#059669',soft:'#ecfdf5'}
};

function syncHomeBudgetChips(){
  document.querySelectorAll('#homeBudgetChips button').forEach(b=>b.classList.toggle('on',b.dataset.spend===activitySpend));
}
function setHomeBudgetMode(mode,btn){
  activitySpend=mode;
  localStorage.setItem('tripActivitySpend',mode);
  document.querySelectorAll('#homeBudgetChips button').forEach(b=>b.classList.toggle('on',b===btn));
  syncActivitySpendChips();
  renderNearbyChoices();
}
function openActivitiesWithSpend(mode){
  activitySpend=mode;
  localStorage.setItem('tripActivitySpend',mode);
  showTab('activities',document.getElementById('navExplore'));
  syncActivitySpendChips();
  applyActivityFilters();
}

function setHomeMood(mood,btn){
  homeMood=mood;localStorage.setItem('tripHomeMood',mood);
  document.querySelectorAll('#moodTabs button').forEach(b=>b.classList.toggle('on',b===btn));
  renderNearbyChoices();
}
function syncMoodTabs(){
  let found=false;
  document.querySelectorAll('#moodTabs button').forEach(b=>{
    let on=b.dataset.mood===homeMood;b.classList.toggle('on',on);if(on)found=true;
  });
  if(!found){homeMood='For you';document.querySelector('#moodTabs button')?.classList.add('on')}
}
function recSectionRecords(city=guideCity){
  return [...document.querySelectorAll('.rec-item')].map(row=>{
    let parts=(row.dataset.key||'').split('|');
    let c=parts[1]||'',section=parts[2]||'',name=parts.slice(3).join('|')||row.querySelector('.rec-copy strong')?.textContent.trim()||'';
    let why=row.querySelector('.rec-copy p')?.textContent.trim()||'';
    let badge=row.querySelector('.badge')?.textContent.trim()||section;
    let tags=classifyActivityText(section+' '+name+' '+why);
    if(section==='Cafés'&&!tags.includes('Cafe'))tags.push('Cafe');
    if(section==='Food'&&!tags.includes('Food'))tags.push('Food');
    if(section==='Social / night'&&!tags.includes('Social'))tags.push('Social');
    return {city:c,name,why,kind:section,badge,tags,source:'rec',mode:'route',modeLabel:guessModeLabel(c,name,section)};
  }).filter(x=>x.city===city && x.name);
}
function guessModeLabel(city,name,section=''){
  let t=(name+' '+section).toLowerCase(),base=(selectedBaseArea(city)||'').toLowerCase();
  if(city==='Kuala Lumpur'){
    if(/bukit bintang|jalan alor|changkat|gmbb/.test(t)&&/bukit bintang|bbcc|pudu/.test(base))return 'WALK';
    if(/klcc|saloma|chinatown|pasar seni|batu caves|rexkl/.test(t))return 'TRAIN / MRT';
    if(/genting/.test(t))return 'BUS / CABLE CAR';
    return 'GRAB / TRAIN';
  }
  if(city==='Bangkok'){
    if(/asok|sukhumvit/.test(t)&&/asok|sukhumvit/.test(base))return 'WALK / BTS';
    if(/siam|pratunam|silom/.test(t))return 'BTS / MRT';
    if(/wat arun|river|yaowarat|chinatown/.test(t))return 'MRT + FERRY';
    return 'BTS / GRAB';
  }
  if(city==='Phuket'){
    if(/kata|karon/.test(t)&&/kata|karon/.test(base))return 'WALK / SHORT RIDE';
    return 'GRAB';
  }
  if(city==='Langkawi'){
    if(/cenang|tengah/.test(t)&&/cenang|tengah/.test(base))return 'WALK / SHORT GRAB';
    return /kilim|sky|tanjung rhu/.test(t)?'GRAB / TOUR':'GRAB';
  }
  if(city==='Chiang Mai'){
    if(/night bazaar|chang khlan|tha phae|old city/.test(t)&&/tha phae|night bazaar|old city/.test(base))return 'WALK / SHORT RIDE';
    return /inthanon|sticky waterfall/.test(t)?'DRIVER / TOUR':'GRAB / WALK';
  }
  return 'CHECK ROUTE';
}
function normalizeCityPick(p){
  return {city:guideCity,name:p.name,why:p.why||'',kind:p.kind||'',badge:p.kind||'',tags:p.tags||[],source:'pick',mode:p.mode||'route',modeLabel:p.modeLabel||guessModeLabel(guideCity,p.name,p.kind)};
}
function normalizeNightPick(p){
  return {city:guideCity,name:p.name,why:p.why||'',kind:'Nightlife',badge:p.time||'After dark',tags:['Nightlife','Social'],source:'night',mode:'route',modeLabel:p.mode||guessModeLabel(guideCity,p.name,'Nightlife')};
}
function normalizeActivityPick(a){
  return {city:a.city,name:a.name,why:a.timing?`Best timing: ${a.timing}`:'A solid option from your city activity bank.',kind:a.tags[0]||'Activity',badge:a.timing||'Activity',tags:a.tags||[],source:'activity',mode:'route',modeLabel:guessModeLabel(a.city,a.name,a.tags.join(' ')),row:a.row};
}
function moodCandidates(mood){
  if(mood==='For you')return rankedPicks().map(normalizeCityPick);
  let list=[];
  (CITY_PICKS[guideCity]||[]).filter(p=>(p.tags||[]).includes(mood)).forEach(p=>list.push(normalizeCityPick(p)));
  if(mood==='Nightlife')(NIGHT_GUIDE[guideCity]||[]).forEach(p=>list.push(normalizeNightPick(p)));
  recSectionRecords(guideCity).filter(r=>r.tags.includes(mood)).forEach(r=>list.push(r));
  activityRecords(guideCity).filter(a=>a.tags.includes(mood)).forEach(a=>list.push(normalizeActivityPick(a)));
  let seen=new Set();
  return list.filter(x=>{
    let k=x.name.toLowerCase().replace(/\s+/g,' ');
    if(seen.has(k))return false;seen.add(k);return true;
  });
}
function scoreMoodRec(r,mood){
  let s=0,w=appData().weather[guideCity]?.state||'unknown';
  if(r.source==='pick')s+=5;if(r.source==='night'&&mood==='Nightlife')s+=7;if(r.source==='rec')s+=4;if(r.source==='activity')s+=2;
  if(r.tags.includes(mood))s+=5;
  if(mood==='Social'&&r.tags.includes('Nightlife'))s+=2;
  if(mood==='Food'&&/street|market|local|food/i.test(r.name+' '+r.why))s+=2;
  if(mood==='Cafe'&&/coffee|café|cafe|bakery|roaster/i.test(r.name+' '+r.why))s+=3;
  if(mood==='Shopping'&&/mall|market|shopping|bazaar|siam|pratunam/i.test(r.name+' '+r.why))s+=3;
  let outdoor=/beach|trail|waterfall|park|snork|kayak|island|sunset|skybridge|temple|walk/i.test(r.name+' '+r.why);
  if((w==='rain'||w==='storm')&&outdoor)s-=3;
  return s;
}
function recommendationBudgetTier(r){
  let txt=((r.name||'')+' '+(r.why||'')+' '+(r.badge||'')+' '+(r.kind||'')).toLowerCase();

  // Prefer the original activity-row cost badge when available.
  if(r.row){
    let info=activitySpendInfo(r.row);
    return info.tier;
  }

  // Strong known free/cheap signals.
  if(/\bfree\b|walk|street|beach|park|temple|market|chinatown|old town|sunset|night bazaar|jalan alor|saloma|klcc|pantai cenang/.test(txt)
     && !/scuba|tour|theme park|zipline|island day|skycab|cable car|spa|massage/.test(txt)) return 'save';

  // Bigger-memory paid signals.
  if(highSpendExperience(txt)) return 'splurge';

  // Restaurants/cafés/nightlife/transported attractions are generally paid but not necessarily splurges.
  if(/restaurant|cafe|café|coffee|massage|club|nightlife|grab|tour|ticket|shopping|mall|food/.test(txt)) return 'paid';

  return 'unknown';
}
function recommendationSpendMatches(r){
  if(activitySpend==='Any')return true;
  let tier=recommendationBudgetTier(r);
  if(activitySpend==='Save')return tier==='save';
  if(activitySpend==='Paid')return tier==='paid'||tier==='splurge';
  if(activitySpend==='Splurge')return tier==='splurge';
  return true;
}
function topMoodRecommendations(){
  let list=moodCandidates(homeMood);
  if(activitySpend!=='Any'){
    let filtered=list.filter(recommendationSpendMatches);
    if(filtered.length)list=filtered;
  }
  if(homeMood==='For you')return list.slice(0,3);
  return list.sort((a,b)=>scoreMoodRec(b,homeMood)-scoreMoodRec(a,homeMood)).slice(0,3);
}

function inferPlanTypeFromRec(r){
  let tags=r.tags||[];
  if(tags.includes('Nightlife')||tags.includes('Social'))return 'Night';
  if(tags.includes('Food')||tags.includes('Cafe'))return 'Food';
  if(tags.includes('Shopping'))return 'Shopping';
  return 'Activity';
}

let addedPlanCtx=null;
function showPlanAdded(plan){
  addedPlanCtx=plan;
  let today=plan.date===todayISO();
  document.getElementById('planAddedHeading').textContent=today?'Added to Today ✓':'Added to your day ✓';
  document.getElementById('planAddedTitle').textContent=plan.title;
  document.getElementById('planAddedDateText').textContent=today?'It is now in your Today list.':`Added to ${fmtDate(plan.date)}.`;
  document.getElementById('planPaidAmount').value='';
  document.getElementById('planPaidCurrency').value=plan.currency||TRAVEL_META[plan.city]?.currency||TRAVEL_META[guideCity].currency;
  openModal('planAddedModal');
}
function planExpenseCategory(plan){
  if(plan.type==='Food')return 'Food';
  if(plan.type==='Shopping')return 'Shopping';
  if(plan.type==='Night')return 'Nightlife';
  return 'Activity';
}
function savePlanPaidCost(){
  if(!addedPlanCtx)return;
  let amount=Number(document.getElementById('planPaidAmount').value||0),currency=document.getElementById('planPaidCurrency').value;
  if(amount<=0){showToast('Enter an amount, or tap Not now');return}
  let d=appData();
  d.expenses.push({id:uid(),date:todayISO(),city:addedPlanCtx.city,category:planExpenseCategory(addedPlanCtx),paidBy:'',title:addedPlanCtx.title,amount,currency,notes:`Paid/booked for ${fmtDate(addedPlanCtx.date)}`});
  saveApp(d);closeModal('planAddedModal');renderApp();showToast('Cost saved ✓');
}
function openTicketForAddedPlan(){
  if(!addedPlanCtx)return;
  let p=addedPlanCtx;closeModal('planAddedModal');openModal('ticketModal');
  ticketType.value=p.type==='Activity'||p.type==='Night'?'Activity':'Other';
  ticketTitle.value=p.title;ticketDate.value=p.date||todayISO();ticketCurrency.value=p.currency||TRAVEL_META[p.city]?.currency||TRAVEL_META[guideCity].currency;
}
function finishAddedPlan(){
  closeModal('planAddedModal');
  if(addedPlanCtx?.date===todayISO())setTimeout(()=>document.getElementById('todayPlans')?.scrollIntoView({behavior:'smooth',block:'center'}),80);
}

function addPlanDirectToday({title,city,type='Activity',notes=''}) {
  let d=appData(),date=todayISO();
  let existing=(d.plans||[]).find(p=>p.date===date&&p.city===city&&p.title.trim().toLowerCase()===title.trim().toLowerCase());
  if(existing){showPlanAdded(existing);return}
  let plan={id:uid(),date,time:'',city,type,title,cost:0,currency:TRAVEL_META[city]?.currency||'',notes};
  d.plans.push(plan);saveApp(d);renderApp();showPlanAdded(plan);
}
function addMoodRecToday(i){
  let r=(window._moodRecs||[])[i];if(!r)return;
  addPlanDirectToday({title:r.name,city:guideCity,type:inferPlanTypeFromRec(r),notes:`${homeMood} pick • ${r.modeLabel}${r.why?' • '+r.why:''}`});
}
function addActivityRowToday(row){
  let x=rowInfo(row),tags=classifyActivityText(row.textContent||'');
  addPlanDirectToday({title:x.name,city:x.city||guideCity,type:tags.includes('Nightlife')||tags.includes('Social')?'Night':tags.includes('Food')?'Food':'Activity',notes:x.timing?`Suggested timing: ${x.timing}`:''});
}

function routeMoodRec(i){
  let r=(window._moodRecs||[])[i];if(!r)return;
  let mode=/walk/i.test(r.modeLabel)?'walking':/train|mrt|bts|bus|ferry/i.test(r.modeLabel)?'transit':'driving';
  window.open(googleDir(r.name,mode),'_blank','noopener');
}
function planMoodRec(i){
  let r=(window._moodRecs||[])[i];if(!r)return;
  openModal('planModal');planTitle.value=r.name;planCity.value=guideCity;
  planType.value=(homeMood==='Nightlife'||homeMood==='Social')?'Night':homeMood==='Food'?'Food':'Activity';
  planNotes.value=`${homeMood} pick • likely best way: ${r.modeLabel}${r.why?' • '+r.why:''}`;
}
function openMoodInActivities(){
  showTab('activities',document.getElementById('navExplore'));
  let target=homeMood==='For you'?'All':homeMood;
  activityFilter=target;
  document.querySelectorAll('#activityFilterChips button').forEach(b=>b.classList.toggle('on',b.dataset.filter===target));
  applyActivityFilters();
}
function renderNearbyChoices(){
  let el=document.getElementById('nearbyChoices');if(!el)return;
  syncMoodTabs();
  let s=citySetup(),base=s.stay||selectedBaseArea()||CITY_META[guideCity].base;
  let budgetLabel={Any:'any budget',Save:'free / cheap',Paid:'paid picks',Splurge:'treat yourself'}[activitySpend]||'any budget';
  document.getElementById('nearbySub').textContent=`${budgetLabel} • from ${base}`;
  syncHomeBudgetChips();
  let recs=topMoodRecommendations();window._moodRecs=recs;
  let theme=MOOD_THEME[homeMood]||MOOD_THEME['For you'];
  el.style.setProperty('--mood-accent',theme.accent);el.style.setProperty('--mood-soft',theme.soft);
  let see=document.getElementById('moodSeeAll');
  if(see)see.textContent=homeMood==='For you'?'Browse all Activities →':`See more ${homeMood} ideas →`;
  if(!recs.length){el.innerHTML=`<div class="mood-empty">I don’t have a strong ${esc(homeMood)} pick for ${esc(guideCity)} yet. Try another tab or browse Activities.</div>`;return}
  let first=recs[0],rest=recs.slice(1);
  el.innerHTML=`<div class="mood-feature">
    <div class="mood-feature-head"><div><div class="mood-kicker">TOP ${esc(homeMood).toUpperCase()} PICK</div><h3>${esc(first.name)}</h3><p>${esc(first.why||'A strong fit for this part of the trip.')}</p></div><span class="mood-way">${esc(first.modeLabel)}</span></div>
    <div class="mood-meta">${[first.kind,...first.tags.slice(0,2)].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
    <div class="mood-actions"><button class="go" onclick="routeMoodRec(0)">Go / route</button><button class="today-add" onclick="addMoodRecToday(0)">＋ Today</button><button onclick="planMoodRec(0)">Plan later</button></div>
  </div>
  ${rest.length?`<div class="mood-mini-grid">${rest.map((r,i)=>`<div class="mood-mini"><strong>${esc(r.name)}</strong><p>${esc(r.why||'Another good option without over-planning the day.')}</p><div class="mood-mini-bottom"><span>${esc(r.modeLabel)}</span><button class="today-mini" onclick="addMoodRecToday(${i+1})">＋ Today</button><button onclick="routeMoodRec(${i+1})">Route →</button></div></div>`).join('')}</div>`:''}`;
}

function transportOrigin(){return citySetup().stay||CITY_META[guideCity].base}
function googleDir(dest,mode){return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(transportOrigin())}&destination=${encodeURIComponent(dest)}&travelmode=${mode}`}
function goToPick(i){
  let p=(window._homePicks||[])[i];if(!p)return;
  if(p.mode==='transit')window.open(googleDir(p.name,'transit'),'_blank','noopener');
  else if(p.mode==='walk')window.open(googleDir(p.name,'walking'),'_blank','noopener');
  else if(p.mode==='grab'){
    navigator.clipboard?.writeText(p.name).catch(()=>{});
    window.open(TRAVEL_META[guideCity].grab,'_blank','noopener');
  } else {
    window.open(googleDir(p.name,'transit'),'_blank','noopener');
  }
}
function addPickToPlan(i){
  let p=(window._homePicks||[])[i];if(!p)return;
  openModal('planModal');planTitle.value=p.name;planCity.value=guideCity;planType.value='Activity';planNotes.value=`Suggested from ${transportOrigin()} • Best transport: ${p.modeLabel}`;
}
function renderSmartPlan(){
  let el=document.getElementById('smartPlan');if(!el)return;
  let d=appData(),w=d.weather[guideCity],picks=rankedPicks().slice(0,3);
  let reason='';
  if(w?.state==='rain'||w?.state==='storm')reason='I moved indoor/mixed options up because the weather looks wet.';
  else if(w?.state==='dry')reason='Weather looks usable, so outdoor signatures can come forward.';
  else reason='I’m using your interests now; check the official forecast and I’ll reorder the day for rain/dry conditions.';
  el.innerHTML=`<div class="weather-note">${esc(reason)}</div>`+picks.map((p,i)=>`<div class="smart-plan-row"><div class="smart-plan-num">${i+1}</div><div><strong>${esc(p.name)}</strong><p>${esc(p.why)} • ${esc(p.modeLabel)}</p></div></div>`).join('');
}
function renderFlightContext(){
  let d=appData(),a=d.arrival,hero=document.getElementById('homeHeroLine'); if(!hero)return;
  hero.textContent=a?`You land ${fmtDate(a.date)}${a.time?' • '+a.time:''}. I’ll keep ${a.city} simple when you arrive.`:`Add your arrival once and I’ll build around it.`;
}


let dayVibe='Balanced', dayShuffleSeed=0, currentBlueprint=[];

function activityRecords(city=guideCity){
  let rows=[...document.querySelectorAll('.activity-row')];
  return rows.map(row=>{
    let key=row.dataset.key||'', parts=key.split('|');
    let c=parts[1]||row.closest('.activity-city')?.querySelector('.activity-head h3')?.textContent?.trim()||'';
    let name=row.querySelector('.act-copy strong')?.textContent?.trim()||parts.slice(2).join('|');
    let timing=row.querySelector('.act-copy small')?.textContent?.trim()||'Flexible';
    let search=(row.dataset.search||'')+' '+row.textContent;
    let tags=classifyActivityText(search);
    let low=search.toLowerCase();
    let bucket=/late|night|after dinner|evening|sunset/.test(low)?'night':/morning|sunrise/.test(low)?'morning':/afternoon/.test(low)?'afternoon':'flex';
    let outdoor=/beach|trail|hike|waterfall|park|garden|snork|kayak|parasail|island|mangrove|sunset|skybridge|temple|walk/.test(low) && !/museum|mall|massage|spa|club|café|cafe/.test(low);
    return {row,city:c,name,timing,search,tags,bucket,outdoor};
  }).filter(x=>!city||x.city===city);
}
function activityScore(a,slot,vibe,used){
  if(used.has(a.name))return -999;
  let score=0, w=appData().weather[guideCity]?.state||'unknown';
  if(activitySpend==='Save'){
    let info=activitySpendInfo(a.row);score += info.tier==='save'?5:-2;
  }
  if(activitySpend==='Splurge'){
    let info=activitySpendInfo(a.row);score += info.splurge?5:0;
  }
  let want={
    morning:['Adventure','Nature','Culture'],
    afternoon:['Food','Culture','Adventure','Relax'],
    evening:['Food','Social','Nature','Culture'],
    night:['Social','Nightlife','Food']
  }[slot];
  want.forEach(t=>{if(a.tags.includes(t))score+=3});
  if(vibe!=='Balanced' && a.tags.includes(vibe))score+=5;
  if(vibe==='Social'&&a.tags.includes('Nightlife'))score+=2;
  if(vibe==='Nightlife'&&a.tags.includes('Social'))score+=2;
  if(slot==='morning'&&a.bucket==='morning')score+=5;
  if(slot==='night'&&a.bucket==='night')score+=6;
  if(slot==='evening'&&a.bucket==='night')score+=2;
  if((w==='rain'||w==='storm')&&a.outdoor)score-=6;
  if((w==='dry'||w==='haze')&&a.outdoor)score+=1;
  score += ((a.name.length + dayShuffleSeed*7) % 5) * .15;
  return score;
}
function buildBlueprint(){
  let acts=activityRecords(guideCity), used=new Set(), slots=['morning','afternoon','evening','night'];
  let labels={morning:'MORNING',afternoon:'AFTERNOON',evening:'SUNSET / DINNER',night:'NIGHT'};
  currentBlueprint=slots.map(slot=>{
    let ranked=[...acts].sort((a,b)=>activityScore(b,slot,dayVibe,used)-activityScore(a,slot,dayVibe,used));
    let pick=ranked[0];
    if(pick)used.add(pick.name);
    return {slot,label:labels[slot],pick};
  }).filter(x=>x.pick);
  return currentBlueprint;
}
function setDayVibe(vibe,btn){
  dayVibe=vibe;
  document.querySelectorAll('#dayVibes button').forEach(b=>b.classList.toggle('on',b===btn));
  renderDaybook();
}
function shuffleDay(){dayShuffleSeed++;renderDaybook()}
function renderDaybook(){
  let el=document.getElementById('dayBlueprint');if(!el)return;
  let bp=buildBlueprint();
  el.innerHTML=bp.length?bp.map((x,i)=>`<div class="day-slot ${x.slot==='night'?'night':''}">
    <div class="day-slot-time">${x.label}</div><div><h3>${esc(x.pick.name)}</h3>
    <p>${esc(x.pick.timing)} • ${x.pick.tags.slice(0,3).map(esc).join(' · ')}</p>
    <div class="slot-actions"><button onclick="planRecordFromBlueprint(${i})">＋ Plan</button></div></div></div>`).join(''):`<div class="empty-state">No activities found for this city.</div>`;
}
function planRecordFromBlueprint(i){
  let x=currentBlueprint[i];if(!x)return;
  openModal('planModal');planTitle.value=x.pick.name;planCity.value=guideCity;
  planType.value=x.slot==='night'?'Night':'Activity';
  planNotes.value=`${x.label} idea • ${x.pick.tags.join(', ')}`;
  if(x.slot==='morning')planTime.value='09:00';
  if(x.slot==='afternoon')planTime.value='14:00';
  if(x.slot==='evening')planTime.value='18:00';
  if(x.slot==='night')planTime.value='21:00';
}
function addBlueprintToPlans(){
  let bp=currentBlueprint.length?currentBlueprint:buildBlueprint(),d=appData();
  let date=todayISO(), times={morning:'09:00',afternoon:'14:00',evening:'18:00',night:'21:00'};
  bp.forEach(x=>d.plans.push({id:uid(),date,time:times[x.slot],city:guideCity,type:x.slot==='night'?'Night':'Activity',title:x.pick.name,cost:0,currency:TRAVEL_META[guideCity].currency,notes:`Built day • ${dayVibe} • ${x.pick.tags.join(', ')}`}));
  saveApp(d);renderApp();alert('Added this day to your plan. You can edit individual items from Trip.');
}
function enhanceActivityRows(){
  document.querySelectorAll('.activity-row').forEach(row=>{
    if(row.dataset.v5enhanced)return; row.dataset.v5enhanced='1';
    let copy=row.querySelector('.act-copy');if(!copy)return;
    let actions=document.createElement('div');actions.className='activity-extra-actions';
    actions.innerHTML=`<button class="today-act" type="button">＋ Today</button><button class="plan-act" type="button">Plan later</button>`;
    actions.querySelector('.today-act').addEventListener('click',e=>{e.stopPropagation();addActivityRowToday(row)});
    actions.querySelector('.plan-act').addEventListener('click',e=>{e.stopPropagation();planActivityRow(row)});
    copy.appendChild(actions);
  });
}
function rowInfo(row){
  let key=(row.dataset.key||'').split('|');
  return {city:key[1]||guideCity,name:row.querySelector('.act-copy strong')?.textContent.trim()||key.slice(2).join('|'),timing:row.querySelector('.act-copy small')?.textContent.trim()||''};
}
function planActivityRow(row){
  let x=rowInfo(row);guideCity=x.city;localStorage.setItem('tripGuideCity',guideCity);
  openModal('planModal');planTitle.value=x.name;planCity.value=x.city;planNotes.value=x.timing?`Suggested timing: ${x.timing}`:'';
}


function selectedBaseArea(city=guideCity){
  let s=appData().citySetup[city]||{};
  if(s.baseArea)return s.baseArea;
  let txt=(s.stay||'').toLowerCase();
  let match=(BASE_GUIDE[city]||[]).find(a=>a.aliases.some(k=>txt.includes(k)));
  return match?.area||null;
}
function chooseBaseArea(area){
  let d=appData(),s=d.citySetup[guideCity]||{};
  s.baseArea=area;d.citySetup[guideCity]=s;saveApp(d);
  renderStayAreas();renderNearbyChoices();renderSmartNext();
}
function staySearchUrl(area){
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('hotels apartments '+area+' '+guideCity)}`;
}
function renderStayAreas(){
  let el=document.getElementById('stayAreaSuggestions');if(!el)return;
  let areas=BASE_GUIDE[guideCity]||[],chosen=selectedBaseArea();
  let s=citySetup();
  let intro=s.stay && !chosen?`I can’t reliably infer the neighbourhood from “${esc(s.stay)}” alone. One tap below tells me which base area to plan from.`:
    chosen?`Planning ${guideCity} from <b>${esc(chosen)}</b>. I would normally keep this one base for the whole city.`:
    `For a first visit, choose one of these areas rather than moving hotels around the city.`;
  el.innerHTML=`<div class="micro-summary">${intro}</div>`+areas.map((a,i)=>`<div class="stay-area-card">
    <div class="stay-area-top"><div><strong>${esc(a.area)}</strong><p>${esc(a.why)}</p></div><span class="stay-score">${esc(a.fit)}</span></div>
    <div class="stay-area-actions"><button class="pick" onclick="chooseBaseArea('${a.area.replace(/'/g,"\\'")}')">${chosen===a.area?'✓ Using this base':'Use this area'}</button>
    <button onclick="window.open(staySearchUrl('${a.area.replace(/'/g,"\\'")}'),'_blank','noopener')">See stays ↗</button></div></div>`).join('');
}
function waveNames(){
  let areas=BASE_GUIDE[guideCity]||[],chosen=selectedBaseArea(),base=areas.find(a=>a.area===chosen)||areas[0],all=CITY_PICKS[guideCity]||[];
  let easy=(base?.near||[]).filter(n=>all.some(p=>p.name===n)).slice(0,3);
  let far=all.filter(p=>/day trip|dedicated day|full day/i.test((p.kind||'')+' '+(p.why||'')) || /Genting|Inthanon|Sticky Waterfall|Ayutthaya|Kilim|Tanjung Rhu|Similan/i.test(p.name)).map(p=>p.name);
  let core=all.map(p=>p.name).filter(n=>!easy.includes(n)&&!far.includes(n)).slice(0,4);
  far=far.filter(n=>!easy.includes(n)).slice(0,3);
  return {easy,core,far,base:base?.area};
}
function renderBaseWaves(){
  let el=document.getElementById('baseWaves');if(!el)return;
  let w=waveNames(),s=citySetup();
  let note=s.stay?`From ${esc(s.stay)}${w.base?' • planning as '+esc(w.base):''}`:`Using ${esc(w.base||CITY_META[guideCity].base)} as the reference base`;
  let card=(cls,title,sub,names)=>`<div class="wave-card ${cls}"><div class="wave-head"><h4>${title}</h4></div><p>${sub}</p><div class="wave-items">${names.length?names.map(n=>`<button onclick="openWaveRoute('${n.replace(/'/g,"\\'")}')">${esc(n)} ↗</button>`).join(''):'<span class="v2muted">Nothing special to add here.</span>'}</div></div>`;
  el.innerHTML=`<div class="micro-summary">${note}. Exact live travel time opens in Maps rather than being guessed.</div>`+
    card('easy','1 • Easy first / jet-lag friendly','Start here after landing: lower-friction plans around the base and central transit.',w.easy)+
    card('core','2 • Core city','Once you have your bearings, cover the city-defining experiences.',w.core)+
    card('far','3 • Farther / dedicated block','These deserve more travel time or their own half/full day.',w.far);
}
function openWaveRoute(dest){
  let origin=transportOrigin();
  window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=transit`,'_blank','noopener');
}
function renderTonightV6(){
  let el=document.getElementById('tonightSuggestion');if(!el)return;
  let h=new Date().getHours(),card=el.closest('.night-home-card');if(card)card.classList.toggle('hidden',h>=4&&h<16);
  let opts=NIGHT_GUIDE[guideCity]||[],first=opts[0];
  if(!first){el.innerHTML='<p>No special night recommendation yet.</p>';return}
  el.innerHTML=`<div class="night-pick"><span class="night-time-badge">${esc(first.time)}</span><strong>${esc(first.name)}</strong>
    <div class="night-reason">${esc(first.why)}</div>
    <div class="night-actions"><button onclick="routeNight('${first.name.replace(/'/g,"\\'")}','${first.mode}')">Go there • ${esc(first.mode)}</button><button class="alt" onclick="addNightToday(0)">＋ Today</button></div>
    <div class="night-options">${opts.slice(1).map((x,i)=>`<div class="night-option"><b>${esc(x.name)}</b><br><span>${esc(x.time)} • ${esc(x.why)}</span><div class="night-actions"><button class="alt" onclick="routeNight('${x.name.replace(/'/g,"\\'")}','${x.mode}')">Route</button><button class="alt" onclick="addNightToday(${i+1})">＋ Today</button></div></div>`).join('')}</div></div>`;
}
function routeNight(name,mode){
  let travel=/walk/i.test(mode)?'walking':/train|bts|mrt/i.test(mode)?'transit':'driving';
  window.open(googleDir(name,travel),'_blank','noopener');
}

function addNightToday(i){
  let x=(NIGHT_GUIDE[guideCity]||[])[i];if(!x)return;
  addPlanDirectToday({title:x.name,city:guideCity,type:'Night',notes:`Best after dark • ${x.time} • ${x.mode} • ${x.why}`});
}

function planNightGuide(i){
  let x=(NIGHT_GUIDE[guideCity]||[])[i];if(!x)return;
  openModal('planModal');planTitle.value=x.name;planCity.value=guideCity;planType.value='Night';planTime.value='21:00';planNotes.value=`Best after dark • ${x.time} • ${x.mode} • ${x.why}`;
}
function renderNightTravel(){
  let el=document.getElementById('nightTravelGuide');if(!el)return;
  el.innerHTML=INTERCITY_GUIDE.map(x=>`<div class="travel-leg"><strong>${esc(x.label)}</strong><p>${esc(x.best)}<br><b>Night option:</b> ${esc(x.night)}</p><div class="guide-actions">${x.links.map(l=>`<button onclick="window.open('${l[1]}','_blank','noopener')">${esc(l[0])} ↗</button>`).join('')}</div></div>`).join('');
}








let checkinCtx={step:'',item:null,transport:'',amount:'',currency:'',mealTitle:''};

function todayPlansForCheckin(){
  let d=appData(),today=todayISO();
  return (d.plans||[]).filter(p=>p.date===today);
}
function todayTicketsForCheckin(){
  let d=appData(),today=todayISO();
  return (d.tickets||[]).filter(t=>t.date===today);
}
function todayRidesForCheckin(){
  let d=appData(),today=todayISO();
  return (d.rides||[]).filter(r=>r.date===today);
}
function dailyState(){
  let d=appData(),today=todayISO();
  d.dailyCheckins[today]=d.dailyCheckins[today]||{donePlans:[],skippedPlans:[],askedFood:false};
  return {d,state:d.dailyCheckins[today],today};
}
function saveDailyState(d){saveApp(d)}

function nextCheckinCandidate(){
  let {state}=dailyState(),plans=todayPlansForCheckin();
  let plan=plans.find(p=>!state.donePlans.includes(p.id)&&!state.skippedPlans.includes(p.id));
  if(plan)return {type:'plan',item:plan};
  if(!state.askedFood)return {type:'food'};
  return null;
}
function renderSmartCheckin(){
  let el=document.getElementById('smartCheckin');if(!el)return;
  let d=appData(),today=todayISO(),maps=spendMaps(d.expenses);
  let candidate=nextCheckinCandidate(),plans=todayPlansForCheckin(),rides=todayRidesForCheckin(),tickets=todayTicketsForCheckin();
  let todayEntries=(d.expenses||[]).filter(x=>x.date===today).length;
  let budgetBtn=document.getElementById('budgetMiniButton');
  if(budgetBtn)budgetBtn.textContent=Object.keys(d.budgets||{}).length?'Edit budget':'Set budget';
  if(candidate?.type==='plan'){
    let p=candidate.item;
    el.innerHTML=`<div class="checkin-prompt"><div class="eyebrow2">QUICK CHECK-IN</div><h4>Did you make it to ${esc(p.title)}?</h4><p>I already know it was on today’s plan. One tap is enough — I’ll only ask transport/spend if you say yes.</p><div class="checkin-actions"><button class="primary" onclick="startPlanCheckin('${p.id}')">Yes, went</button><button onclick="skipPlanCheckin('${p.id}')">Not today</button></div></div>`;
  }else if(candidate?.type==='food'){
    el.innerHTML=`<div class="checkin-prompt"><div class="eyebrow2">FOOD MEMORY</div><h4>Worth remembering what you ate today?</h4><p>Optional — useful for both the trip diary and spending. Skip it and I won’t ask again today.</p><div class="checkin-actions"><button class="soft" onclick="startFoodCheckin()">🍜 Add meal</button><button onclick="skipFoodCheckin()">Skip</button></div></div>`;
  }else{
    el.innerHTML=`<div class="checkin-prompt checkin-complete"><div class="eyebrow2">DAY CAPTURED</div><h4>You’re caught up for today ✓</h4><p>No accounting session required. Add something only when you remember it.</p><div class="tiny-recap"><span>${plans.length} planned</span><span>${rides.length} ride${rides.length===1?'':'s'}</span><span>${tickets.length} ticket${tickets.length===1?'':'s'}</span><span>${todayEntries} spend entr${todayEntries===1?'y':'ies'}</span></div></div>`;
  }
}
function startPlanCheckin(id){
  let p=appData().plans.find(x=>x.id===id);if(!p)return;
  checkinCtx={step:'transport',item:p,transport:'',amount:'',currency:TRAVEL_META[p.city||guideCity]?.currency||TRAVEL_META[guideCity].currency};
  document.getElementById('checkinModalTitle').textContent='Nice — how did you get there?';
  renderCheckinModal();
  openModal('checkinModal');
}
function skipPlanCheckin(id){
  let {d,state}=dailyState();if(!state.skippedPlans.includes(id))state.skippedPlans.push(id);saveDailyState(d);renderSmartCheckin();
}
function renderCheckinModal(){
  let body=document.getElementById('checkinBody');if(!body)return;
  if(checkinCtx.step==='transport'){
    body.innerHTML=`<div class="checkin-question"><h4>${esc(checkinCtx.item.title)}</h4><p>Just tap the main way you got there.</p><div class="choice-grid">
      ${['Walk','Train / metro','Bus','Grab','Taxi','Other'].map(x=>`<button onclick="pickCheckinTransport('${x.replace(/'/g,"\\'")}')"><b>${x}</b></button>`).join('')}
    </div><button class="checkin-skip" onclick="pickCheckinTransport('')">Skip transport</button></div>`;
  }else if(checkinCtx.step==='spend'){
    body.innerHTML=`<div class="checkin-question"><h4>Any spend for ${esc(checkinCtx.item.title)}?</h4><p>Ticket, entry fee or something directly tied to this activity. If not, tap No spend.</p>
      <div class="checkin-inline"><input id="checkinAmount" inputmode="decimal" type="number" step="0.01" min="0" placeholder="Amount"><select id="checkinCurrency"><option>${esc(checkinCtx.currency)}</option><option>${checkinCtx.currency==='MYR'?'THB':'MYR'}</option></select></div>
      <button class="checkin-next" onclick="savePlanCheckinSpend()">Save activity</button><button class="checkin-skip" onclick="finishPlanCheckin(0,'')">No spend</button></div>`;
  }else if(checkinCtx.step==='food'){
    body.innerHTML=`<div class="checkin-question"><h4>What did you eat?</h4><p>Keep it casual — “nasi lemak at Jalan Alor” is enough.</p>
      <input id="mealTitle" style="width:100%;border:1px solid #dbe1e8;border-radius:11px;padding:10px" placeholder="e.g. Nasi lemak at Wanjo">
      <div class="checkin-inline" style="margin-top:8px"><input id="mealAmount" inputmode="decimal" type="number" step="0.01" min="0" placeholder="Amount (optional)"><select id="mealCurrency"><option>${esc(TRAVEL_META[guideCity].currency)}</option><option>${TRAVEL_META[guideCity].currency==='MYR'?'THB':'MYR'}</option></select></div>
      <button class="checkin-next" onclick="saveFoodCheckin()">Save food memory</button><button class="checkin-skip" onclick="skipFoodCheckin(true)">Skip</button></div>`;
  }
}
function pickCheckinTransport(mode){
  checkinCtx.transport=mode;checkinCtx.step='spend';document.getElementById('checkinModalTitle').textContent='Anything spent?';renderCheckinModal();
}
function savePlanCheckinSpend(){
  let amount=Number(document.getElementById('checkinAmount')?.value||0),cur=document.getElementById('checkinCurrency')?.value||checkinCtx.currency;
  finishPlanCheckin(amount,cur);
}
function finishPlanCheckin(amount,currency){
  let {d,state}=dailyState(),p=checkinCtx.item;
  if(!state.donePlans.includes(p.id))state.donePlans.push(p.id);
  if(checkinCtx.transport){
    // Avoid duplicate ride if one already exists for same destination today.
    let exists=(d.rides||[]).some(r=>r.date===todayISO() && (r.to||'').toLowerCase().includes((p.title||'').toLowerCase()));
    if(!exists && !/^walk$/i.test(checkinCtx.transport)){
      d.rides.push({id:uid(),date:todayISO(),time:'',service:checkinCtx.transport,city:p.city||guideCity,from:citySetup().stay||CITY_META[p.city||guideCity]?.base||'',to:p.title,fare:0,currency:currency||TRAVEL_META[p.city||guideCity]?.currency||'',ref:'Daily check-in',paidBy:''});
    }
  }
  if(Number(amount)>0){
    d.expenses.push({id:uid(),date:todayISO(),city:p.city||guideCity,category:'Activity',paidBy:'',title:p.title,amount:Number(amount),currency:(currency||TRAVEL_META[p.city||guideCity]?.currency||'').toUpperCase(),notes:checkinCtx.transport?`Daily check-in • ${checkinCtx.transport}`:'Daily check-in'});
  }
  appendJourneyStopToData(d,todayISO(),p.city||guideCity,p.title,'Activity',p.time||nowHHMM(),'daily-checkin');
  saveDailyState(d);closeModal('checkinModal');renderApp();
}
function startFoodCheckin(){
  checkinCtx={step:'food'};document.getElementById('checkinModalTitle').textContent='Food memory';renderCheckinModal();openModal('checkinModal');
}
function skipFoodCheckin(close=false){
  let {d,state}=dailyState();state.askedFood=true;saveDailyState(d);if(close)closeModal('checkinModal');renderSmartCheckin();
}
function saveFoodCheckin(){
  let title=document.getElementById('mealTitle')?.value.trim();if(!title)return;
  let amount=Number(document.getElementById('mealAmount')?.value||0),currency=(document.getElementById('mealCurrency')?.value||TRAVEL_META[guideCity].currency).toUpperCase();
  let {d,state}=dailyState();state.askedFood=true;
  d.expenses.push({id:uid(),date:todayISO(),city:guideCity,category:'Food',paidBy:'',title,amount,currency,notes:'Food memory'});
  appendJourneyStopToData(d,todayISO(),guideCity,title,'Food',nowHHMM(),'food-memory');
  saveDailyState(d);closeModal('checkinModal');renderApp();
}
function quickExpense(category){
  openModal('expenseModal');expenseCategory.value=category;expenseDate.value=todayISO();expenseCity.value=guideCity;expenseCurrency.value=TRAVEL_META[guideCity].currency;
  let placeholders={Food:'e.g. Dinner / coffee / street food',Activity:'e.g. Museum / snorkeling / ticket',Shopping:'e.g. Market / clothes / souvenir'};
  expenseTitle.placeholder=placeholders[category]||'What did you spend on?';
}
function quickRideLog(){
  openModal('rideModal');rideDate.value=todayISO();rideCity.value=guideCity;rideCurrency.value=TRAVEL_META[guideCity].currency;
  let s=citySetup();if(!rideFrom.value)rideFrom.value=s.stay||CITY_META[guideCity].base;
}


function setQuickMode(mode,btn){
  quickMode=mode;localStorage.setItem('tripQuickMode',mode);
  document.querySelectorAll('#easyModeRow button').forEach(b=>b.classList.toggle('on',b===btn));
  renderSmartNext();renderNearbyChoices();
}
function syncQuickMode(){
  document.querySelectorAll('#easyModeRow button').forEach(b=>b.classList.toggle('on',b.dataset.mode===quickMode));
}
function goWhatNow(){
  showTab('home',document.getElementById('navHome'));
  setTimeout(()=>document.getElementById('whatNowCard')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
function renderHomeCityHeadline(){
  let el=document.getElementById('homeCityHeadline');if(el)el.textContent=guideCity;
  syncQuickMode();
}



function recordDoneRowToJourney(row){
  let key=row.dataset.key||'',parts=key.split('|'),kind=parts[0],city=parts[1]||guideCity;
  if(!['act','rec'].includes(kind))return;
  if(kind==='rec'&&parts[2]==='Stay areas')return;
  let name=row.querySelector('.act-copy strong,.rec-copy strong')?.textContent?.trim()||parts[parts.length-1]||'Experience';
  let d=appData();appendJourneyStopToData(d,todayISO(),city,name,'Activity',nowHHMM(),'done-mark');saveApp(d);
}
function journeyDoneRows(){
  return [...document.querySelectorAll('.stateable')].filter(r=>(localStorage.getItem('trip3:'+r.dataset.key)||'open')==='done').map(r=>{
    let parts=(r.dataset.key||'').split('|');
    let city=parts[1]||'';
    let name=parts[parts.length-1]||r.querySelector('strong,h3')?.textContent?.trim()||'Experience';
    let text=(r.textContent||'')+' '+name;
    let tags=classifyActivityText(text);
    return {city,name,tags,time:localStorage.getItem('trip3time:'+r.dataset.key)||'',key:r.dataset.key};
  });
}
function journeyCheckedPlans(){
  let d=appData(),ids=new Set();
  Object.values(d.dailyCheckins||{}).forEach(s=>(s.donePlans||[]).forEach(id=>ids.add(id)));
  return (d.plans||[]).filter(p=>ids.has(p.id)).map(p=>({
    city:p.city||'',name:p.title||'Plan',tags:classifyActivityText((p.type||'')+' '+(p.title||'')+' '+(p.notes||'')),time:(p.date||'')+(p.time?'T'+p.time:'')
  }));
}


let journeySelectedDate=todayISO(), journeyStopType='Place', toastTimer=null;

function showToast(msg){
  let el=document.getElementById('appToast');if(!el)return;
  el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),1800);
}
function nowHHMM(){
  let d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function journeyStopsFor(date=journeySelectedDate){
  return appData().journeyStops?.[date]||[];
}
function appendJourneyStopToData(d,date,city,place,type='Place',time='',source='manual',note=''){
  if(!place||!String(place).trim())return;
  d.journeyStops=d.journeyStops||{};
  d.journeyStops[date]=d.journeyStops[date]||[];
  let arr=d.journeyStops[date],name=String(place).trim();
  let last=arr[arr.length-1];
  if(last&&last.place.toLowerCase()===name.toLowerCase()&&last.city===(city||guideCity))return last;
  let stop={id:uid(),city:city||guideCity,place:name,type:type||'Place',time:time||'',source,note:note||'',createdAt:new Date().toISOString()};
  arr.push(stop);
  if(date===todayISO()&&typeof NOW_GEO_SOURCES!=='undefined'&&NOW_GEO_SOURCES.includes(source))window._geoNow.push({date,id:stop.id});
  return stop;
}
function openJourneyStopModal(){
  journeyStopType='Place';
  document.querySelectorAll('#journeyStopTypes button').forEach((b,i)=>b.classList.toggle('on',i===0));
  journeyStopPlace.value='';journeyStopTime.value=nowHHMM();journeyStopCity.value=guideCity;journeyStopNote.value='';
  openModal('journeyStopModal');
}
function pickStopType(type,btn){
  journeyStopType=type;document.querySelectorAll('#journeyStopTypes button').forEach(b=>b.classList.toggle('on',b===btn));
}
function setJourneyDate(date){
  journeySelectedDate=date||todayISO();renderDailyJourney();
}
function shiftJourneyDay(delta){
  let d=new Date((journeySelectedDate||todayISO())+'T12:00:00');d.setDate(d.getDate()+delta);
  journeySelectedDate=d.toISOString().slice(0,10);let input=document.getElementById('journeyDate');if(input)input.value=journeySelectedDate;renderDailyJourney();
}
function journeyBackToStay(){
  let stay=citySetup().stay||selectedBaseArea()||CITY_META[guideCity].base;
  let d=appData();appendJourneyStopToData(d,journeySelectedDate,guideCity,stay,'Hotel',journeySelectedDate===todayISO()?nowHHMM():'','back-to-stay');saveApp(d);renderApp();showToast('Back to stay added ✓');
}
function stopIcon(type){
  return {Food:'🍜',Shop:'🛍',Activity:'🎟',Relax:'💆',Hotel:'🏠',Ride:'🚕',Place:'📍'}[type]||'📍';
}
function removeJourneyStop(id){
  let d=appData(),arr=d.journeyStops?.[journeySelectedDate]||[];d.journeyStops[journeySelectedDate]=arr.filter(x=>x.id!==id);saveApp(d);renderApp();
}
function selectedJourneyCity(stops){
  if(stops.length){
    let counts={};stops.forEach(s=>counts[s.city]=(counts[s.city]||0)+1);
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]||guideCity;
  }
  return guideCity;
}
function daySpendMap(date){
  let rows=(appData().expenses||[]).filter(x=>x.date===date),map={};
  rows.forEach(x=>{let c=(x.currency||'').toUpperCase()||'—';map[c]=(map[c]||0)+Number(x.amount||0)});
  return map;
}
function canvasWrap(ctx,text,x,y,maxWidth,lineHeight,maxLines=2){
  let words=String(text).split(/\s+/),line='',lines=[];
  for(let w of words){
    let test=line?line+' '+w:w;
    if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=w}else line=test;
  }
  if(line)lines.push(line);
  lines=lines.slice(0,maxLines);
  lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));
  return y+lines.length*lineHeight;
}

function renderApp(){
 renderProfile();updateCountdown();renderCityPickers();renderGuide();renderCitySetup();renderWeatherCard();renderTransportAssistant();renderQuickStay();renderHomeWeather();renderNearbyChoices();renderSmartPlan();renderSmartNext();renderFlightContext();enhanceActivityRows();renderTonightV6();renderStayAreas();renderNightTravel();renderDaybook();renderKeyDates();renderRouteEditor();renderToday();renderUpcomingTickets();renderTrip();renderWallet();renderHomeMoney();renderHomeCityHeadline();renderJourney();
}
function deleteItem(kind,id){
 let d=appData();
 d[kind]=d[kind].filter(x=>x.id!==id);
 if(kind==='tickets'||kind==='rides'){
   d.expenses=d.expenses.filter(x=>!(x.sourceKind===kind&&x.sourceId===id));
 }
 saveApp(d);renderApp();
}
function wireForms(){
 profileForm.addEventListener('submit',e=>{e.preventDefault();let d=appData();d.profile={name:profileName.value.trim(),email:profileEmail.value.trim()};saveApp(d);showOnboardingStep(2)});
 arrivalSetupForm.addEventListener('submit',e=>{
   e.preventDefault();
   let d=appData();
   d.arrival={city:arrivalCity.value,date:arrivalDate.value,time:arrivalTime.value,airport:arrivalAirport.value.trim()||TRAVEL_META[arrivalCity.value].airport,flight:arrivalFlight.value.trim()};
   d.settings.start=arrivalDate.value||d.settings.start;
   guideCity=arrivalCity.value;localStorage.setItem('tripGuideCity',guideCity);
   let cs=d.citySetup[guideCity]||{};cs.date=arrivalDate.value;cs.time=arrivalTime.value;cs.arrivalPoint=d.arrival.airport;d.citySetup[guideCity]=cs;
   saveApp(d);showOnboardingStep(3);
 });


 journeyStopForm.addEventListener('submit',submitJourneyStop);
 profileEditForm.addEventListener('submit',e=>{e.preventDefault();let d=appData();d.profile={name:editName.value.trim(),email:editEmail.value.trim()};saveApp(d);closeModal('profileModal');renderApp()});
 tripSettingsForm.addEventListener('submit',e=>{e.preventDefault();let d=appData();d.settings={tripName:tripName.value.trim()||'Malaysia × Thailand',start:tripStart.value,end:tripEnd.value,travellers:tripTravellers.value.trim(),homeCurrency:homeCurrency.value.trim().toUpperCase(),emergencyContact:emergencyContact.value.trim()};saveApp(d);closeModal('tripSettingsModal');renderApp()});
 planForm.addEventListener('submit',e=>{
 e.preventDefault();let d=appData();
 let plan={id:uid(),date:planDate.value,time:planTime.value,city:planCity.value,type:planType.value,title:planTitle.value.trim(),cost:Number(planCost.value||0),currency:planCurrency.value.trim().toUpperCase(),notes:planNotes.value.trim()};
 d.plans.push(plan);saveApp(d);planForm.reset();closeModal('planModal');renderApp();showPlanAdded(plan);
});
 ticketForm.addEventListener('submit',e=>{
 e.preventDefault();let d=appData(),id=uid(),amount=Number(ticketAmount.value||0),currency=ticketCurrency.value.trim().toUpperCase(),type=ticketType.value,title=ticketTitle.value.trim(),date=ticketDate.value||todayISO();
 d.tickets.push({id,type,provider:ticketProvider.value.trim(),title,date,time:ticketTime.value,ref:ticketRef.value.trim(),seat:ticketSeat.value,amount,currency,notes:ticketNotes.value.trim()});
 if(amount>0)d.expenses.push({id:uid(),date,city:'',category:type==='Hotel'?'Stay':type==='Activity'||type==='Event'?'Activity':'Flight / transport',paidBy:'',title,amount,currency,notes:'Auto-counted from ticket / booking',sourceKind:'tickets',sourceId:id});
 saveApp(d);ticketForm.reset();closeModal('ticketModal');renderApp();
});
 rideForm.addEventListener('submit',e=>{
 e.preventDefault();let d=appData(),id=uid(),fare=Number(rideFare.value||0),currency=rideCurrency.value.trim().toUpperCase(),date=rideDate.value||todayISO(),city=rideCity.value,from=rideFrom.value.trim(),to=rideTo.value.trim(),service=rideService.value,paidBy=ridePaidBy.value.trim();
 d.rides.push({id,date,time:rideTime.value,service,city,from,to,fare,currency,ref:rideRef.value.trim(),paidBy});
 if(from)appendJourneyStopToData(d,date,city,from,'Ride',rideTime.value,'ride-start');
 if(to)appendJourneyStopToData(d,date,city,to,'Place',rideTime.value,'ride-end');
 if(fare>0)d.expenses.push({id:uid(),date,city,category:'Ride',paidBy,title:`${service}: ${from} → ${to}`,amount:fare,currency,notes:'Auto-counted from ride log',sourceKind:'rides',sourceId:id});
 saveApp(d);rideForm.reset();closeModal('rideModal');renderApp();
});
 expenseForm.addEventListener('submit',e=>{
 e.preventDefault();let d=appData(),date=expenseDate.value||todayISO(),city=expenseCity.value||guideCity,category=expenseCategory.value,title=expenseTitle.value.trim();
 d.expenses.push({id:uid(),date,city,category,paidBy:expensePaidBy.value.trim(),title,amount:Number(expenseAmount.value||0),currency:expenseCurrency.value.trim().toUpperCase(),notes:expenseNotes.value.trim()});
 let stopType={'Food':'Food','Shopping':'Shop','Activity':'Activity','Nightlife':'Activity','Relax / massage':'Relax'}[category];
 if(stopType&&title)appendJourneyStopToData(d,date,city,title,stopType,date===todayISO()?nowHHMM():'','expense-log');
 saveApp(d);expenseForm.reset();closeModal('expenseModal');renderApp();showToast(stopType?'Spend + Journey updated ✓':'Spend saved ✓');
});
 budgetForm.addEventListener('submit',e=>{e.preventDefault();let d=appData(),c=budgetCurrency.value.trim().toUpperCase();d.budgets[c]=Number(budgetAmount.value||0);saveApp(d);budgetForm.reset();closeModal('budgetModal');renderApp()});
 detailForm.addEventListener('submit',e=>{e.preventDefault();let d=appData();d.details.push({id:uid(),category:detailCategory.value,city:detailCity.value,label:detailLabel.value.trim(),value:detailValue.value.trim()});saveApp(d);detailForm.reset();closeModal('detailModal');renderApp()});
 noteForm.addEventListener('submit',e=>{e.preventDefault();let d=appData();d.notes.push({id:uid(),city:noteCity.value,tag:noteTag.value.trim(),text:noteText.value.trim()});saveApp(d);noteForm.reset();closeModal('noteModal');renderApp()});
}
function exportTripData(){
 let payload={app:'Tamseel + Ayesha Trip Companion',version:1,exportedAt:new Date().toISOString(),data:appData()};
 let blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='trip-companion-backup-'+todayISO()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
}
function importTripData(event){
 let file=event.target.files?.[0];if(!file)return;let r=new FileReader();
 r.onload=()=>{try{let payload=JSON.parse(r.result);let data=payload.data||payload;if(!data||typeof data!=='object')throw Error('Invalid');saveApp(data);renderApp();alert('Backup imported successfully.')}catch(e){alert('That file does not look like a valid trip backup.')}event.target.value=''};
 r.readAsText(file);
}


if('serviceWorker' in navigator && location.protocol!=='file:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}


arrivalCity?.addEventListener('change',()=>{
  arrivalAirport.value=TRAVEL_META[arrivalCity.value].airport;
});

ensureTripDates();
renderExploreContent();
paintAllStates();
fillSelects();
wireForms();
renderApp();
loadFx().then(()=>{renderWallet();renderJourney()});
if(appData().onboardingDone){showTab('home',document.getElementById('navHome'));setTimeout(()=>refreshOfficialWeather(true),250)}
else{document.getElementById('onboarding').classList.remove('hidden')}

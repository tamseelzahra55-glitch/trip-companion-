/* Extra Malaysia destinations. Compact format — see TRIP_DATA.add in data-base.js.
   recs rows: [name, BADGE, note, diet('halal'|'pork'|''), sourceUrl]
   acts rows: [name, cost label, 'free'|'paid'|'mixed', kind, best time]
   picks rows: [name, kind, 'Tag/Tag', 'outdoor'|'mixed'|'indoor', how to get there, why]
   night rows: [name, when, why, how] */
(function(){
const add = window.TRIP_DATA.add;
const MICHELIN_MY = 'https://guide.michelin.com/my/en/article/michelin-guide-ceremony/full-list-michelin-guide-my-2026';
const KTMB = ['KTMB ETS train','https://www.ktmb.com.my/ETS.html'];
const BOT_MY = ['BusOnlineTicket MY','https://www.busonlineticket.com/'];
const REDBUS = ['redBus Malaysia','https://www.redbus.my/'];

add({
  name:'Penang', country:'MY', region:'North-west coast', emoji:'🍜', accent:'#e11d48',
  coords:[5.4141,100.3288], metName:'George Town',
  tagline:'Malaysia’s street-food capital with a UNESCO-listed old town',
  famous:['Hawker food','George Town street art','Clan Jetties','Penang Hill','Kek Lok Si temple','Peranakan mansions'],
  nov:['mixed','One of Penang’s wetter months: sticky mornings, heavy afternoon downpours. Walk and do Penang Hill early; hawker-hop in the evening.'],
  base:'George Town heritage core',
  why:'Eat your way through Malaysia’s best street food, wander UNESCO lanes full of murals and shophouses, and catch a hilltop sunset.',
  next:'Prioritize a hawker night, the street-art walk + Clan Jetties, Penang Hill at sunset and Kek Lok Si.',
  avoid:'Don’t base yourself in Batu Ferringhi if food and heritage are the point — it’s 40+ minutes from George Town in traffic.',
  alts:['Gurney Drive — seafront hawker centre + malls','Batu Ferringhi — beach-resort strip and night market','Tanjung Tokong / Straits Quay — calmer, marina side'],
  sigs:['Street-art walk','Clan Jetties','Penang Hill','Kek Lok Si','Hawker night','Pinang Peranakan Mansion'],
  own:['Penang Hill + Kek Lok Si (both on the Air Itam side)','Penang National Park if you want a jungle-to-beach hike'],
  getThere:'Fly into Penang (PEN), or take the ETS train KL → Butterworth (about 4 hours) and the short ferry across to George Town. Buses from KL take about 5 hours.',
  tips:['Many famous Chinese hawker dishes use pork or lard — nasi kandar, capati and Malay stalls are the easy halal options.',
        'Hawkers often sell out by early afternoon and close one weekday — check before crossing town for one stall.',
        'The heritage core is walkable; Grab for Penang Hill, Kek Lok Si, Gurney and Batu Ferringhi.'],
  airport:'Penang International Airport (PEN)',
  advice:'George Town’s core is walkable. Use Grab for Penang Hill, Kek Lok Si, Gurney Drive and Batu Ferringhi; Rapid Penang buses are cheap but slow in traffic.',
  intercity:[KTMB,BOT_MY,REDBUS],
  stays:[
    ['George Town heritage core','george town|armenian|love lane|chulia|lebuh|heritage|beach street','Best all-round','Walk to street art, the jetties, hawkers and cafés. Shophouse boutique hotels and hostels.'],
    ['Gurney Drive','gurney','Seafront + malls','Gurney Drive Hawker Centre and Gurney Plaza on your doorstep; Grab into the old town.'],
    ['Batu Ferringhi','batu ferringhi|ferringhi','Beach resort','Resort beaches and a night market, but far from the food-and-heritage action.'],
    ['Tanjung Tokong / Straits Quay','tanjung tokong|straits quay|tanjung bungah','Quieter','Calmer apartments by the marina — good if you want space and don’t mind Grabbing.']
  ],
  recs:{
    'Food':[
      ['Line Clear Nasi Kandar','NASI KANDAR','Penang Road icon: rice “flooded” with mixed curries, open late.','halal'],
      ['Deens Maju Nasi Kandar','NASI KANDAR','Jalan Gurdwara favourite for fried chicken + curry flood; the queue moves fast.','halal','https://www.malaymail.com/news/eat-drink/2025/04/17/a-day-of-eating-in-george-town-penang-char-koay-teow-nasi-kandar-capati-bak-kwa-and-more/173343'],
      ['Restoran Haji Kamal (MAJ)','CAPATI','Lebuh Ah Quee spot for capati, chicken curry and teh tarik.','halal','https://www.malaymail.com/news/eat-drink/2025/04/17/a-day-of-eating-in-george-town-penang-char-koay-teow-nasi-kandar-capati-bak-kwa-and-more/173343'],
      ['Penang Road Famous Laksa','ASAM LAKSA','Michelin Bib Gourmand pick for tangy, fish-based asam laksa.','',MICHELIN_MY],
      ['Penang Road Famous Teochew Chendul','DESSERT','The classic cendol queue on Lebuh Keng Kwee, just off Penang Road.'],
      ['Siam Road Char Koay Teow','CHAR KOAY TEOW','Charcoal-fired, Bib Gourmand-listed CKT — traditionally cooked with lard.','pork',MICHELIN_MY],
      ['Gurney Drive Hawker Centre','HAWKER CENTRE','Seafront sampler for first-timers — check each stall’s halal sign.']
    ],
    'Cafés':[
      ['China House','CAFÉ + CAKES','Long shophouse running from Beach Street with a famous cake counter; live music some nights at the back.'],
      ['Mugshot Café','BAGELS + YOGHURT','Chulia Street favourite for wood-fired bagels and homemade yoghurt.'],
      ['Hin Bus Depot','ART SPACE','Old bus depot turned gallery and cafés, with a makers’ market on Sundays.']
    ],
    'Social / night':[
      ['Love Lane → Chulia Street','NIGHT','Bars, hawker carts and backpacker energy across a few heritage lanes.'],
      ['Penang Hill at sunset','SUNSET','Funicular up for golden hour and city lights; The Habitat canopy walk is the paid add-on.']
    ],
    'Hidden / small':[
      ['Clan Jetties (Chew Jetty)','STILT VILLAGE','Wooden homes on stilts over the water. Go early or near sunset — people live here, so keep it respectful.'],
      ['Khoo Kongsi','CLAN TEMPLE','Ornate clan house tucked behind Cannon Square.'],
      ['Penang Botanic Gardens','NATURE','Free green escape with jungle trails (watch your snacks — monkeys).']
    ],
    'Big memory':[
      ['Penang Hill + The Habitat','VIEW','Funicular up, canopy walkway and treetop views over the island.'],
      ['Kek Lok Si Temple','TEMPLE','Huge hillside temple complex with a seven-tier pagoda and giant Kuan Yin statue.'],
      ['Penang National Park','HIKE + BEACH','Jungle trail to Monkey Beach or Turtle Beach; boats back are easy to arrange.']
    ]
  },
  acts:[
    ['Armenian Street street-art walk','FREE','free','Street art / heritage','Morning'],
    ['Clan Jetties','FREE','free','Stilt village','Morning / sunset'],
    ['Khoo Kongsi','PAID','paid','Clan temple','Morning'],
    ['Pinang Peranakan Mansion','PAID','paid','Museum / Peranakan','Rain backup'],
    ['Cheong Fatt Tze Blue Mansion tour','PAID','paid','Heritage house','Guided tour slots'],
    ['Fort Cornwallis + Esplanade','LOW PAID','mixed','History / seafront','Late afternoon'],
    ['Penang Hill funicular','PAID','paid','View','Sunset'],
    ['The Habitat Penang Hill','PAID','paid','Canopy walk / nature','Morning'],
    ['Kek Lok Si Temple','LOW PAID','mixed','Temple / views','Morning'],
    ['Penang Botanic Gardens','FREE','free','Park / jungle trail','Early morning'],
    ['Penang National Park hike','FREE/PAID','free','Hike / beach','Dedicated morning'],
    ['Gurney Drive Hawker Centre','FREE ENTRY','free','Hawker food','Night'],
    ['Chulia Street night hawkers','FREE ENTRY','free','Street food','Night'],
    ['Batu Ferringhi night market','FREE ENTRY','free','Night market / shopping','Evening'],
    ['Hin Bus Depot Sunday market','FREE','free','Art / makers market','Sunday'],
    ['Entopia butterfly farm','PAID','paid','Nature / indoor','Rain backup'],
    ['Escape Penang adventure park','PAID','paid','Ziplines / outdoor adventure','Dedicated day'],
    ['Trishaw ride around the heritage core','PAID','paid','Old-school ride','Evening']
  ],
  clusters:[
    'Armenian Street murals → Khoo Kongsi → Clan Jetties → Chulia Street hawkers',
    'Penang Hill → Kek Lok Si (same Air Itam side) → asam laksa',
    'Fort Cornwallis → Esplanade → Gurney Drive sunset → Gurney Hawker Centre',
    'Penang National Park → Escape / Entopia → Batu Ferringhi night market'
  ],
  picks:[
    ['Street-art walk + Clan Jetties','Culture','Culture/Food/Cafe','outdoor','WALK','Do it before 11 AM — Penang heat is no joke.'],
    ['Hawker night (Chulia Street or Gurney)','Food','Food/Nightlife/Social','mixed','WALK / GRAB','The reason most people come to Penang.'],
    ['Penang Hill sunset','View','Nature/Relax','outdoor','GRAB + FUNICULAR','Clear evenings give the best city-light views.'],
    ['Kek Lok Si Temple','Culture','Culture','mixed','GRAB','Pair it with Penang Hill — same side of the island.'],
    ['Pinang Peranakan Mansion','Museum','Culture/Shopping','indoor','WALK','Perfect for an afternoon downpour.'],
    ['Penang National Park','Adventure','Nature/Adventure','outdoor','GRAB','Go early; take a boat back if your legs are done.']
  ],
  night:[
    ['Chulia Street + Love Lane','After 7 PM','Hawker carts, bars and backpacker energy, all within a few lanes of the heritage core.','WALK'],
    ['Gurney Drive Hawker Centre','After sunset','Classic seafront hawker sampler once the heat drops.','GRAB'],
    ['Batu Ferringhi night market','After 7 PM','Beach-strip night market for browsing and snacks — combine with a beach sunset.','GRAB']
  ]
});

add({
  name:'Melaka', country:'MY', region:'South-west coast', emoji:'⛵', accent:'#b91c1c',
  coords:[2.1896,102.2501], metName:'Melaka',
  tagline:'Colonial port town with Nyonya food, river walks and a weekend night market',
  famous:['Jonker Walk night market','Dutch Square (the red buildings)','Nyonya / Peranakan food','Chicken rice balls','Melaka River at night','Straits Mosque sunset'],
  nov:['mixed','Warm with frequent afternoon or evening showers. The town is compact, so rain just means a café or museum break.'],
  base:'Jonker Street / heritage core',
  why:'An easy 2-hour hop from KL for UNESCO heritage, Nyonya food and a lively weekend night market.',
  next:'Plan a Friday–Sunday so you catch Jonker Walk Night Market, then do the river walk after dark.',
  avoid:'Melaka is compact — 1–2 nights is plenty. Don’t spend the hottest midday hours walking outdoor ruins.',
  alts:['Melaka River / Kampung Morten — quieter river views','Bandar Hilir / Mahkota — malls and newer hotels','Klebang — beach side with the famous coconut shake'],
  sigs:['Jonker Walk Night Market','Dutch Square + Christ Church','River walk at night','Nyonya lunch','Straits Mosque sunset'],
  own:['A Friday–Sunday evening for Jonker Walk'],
  getThere:'Bus from KL’s TBS terminal to Melaka Sentral (about 2–2.5 hours), then a short Grab into the old town. There’s no direct train to the city.',
  tips:['Jonker Walk Night Market runs Friday–Sunday evenings only.',
        'Midday is hot and the big sights are outdoors — start early, café through the afternoon, come back out at dusk.',
        'Malay asam pedas spots are halal; many Chinese and Nyonya restaurants serve pork, so ask.'],
  airport:'No major airport — arrive by bus from KL or KLIA',
  advice:'The heritage core is walkable. Grab for Melaka Sentral bus terminal, the Straits Mosque and Klebang.',
  intercity:[BOT_MY,REDBUS],
  stays:[
    ['Jonker Street / heritage core','jonker|heeren|tun tan cheng lock|hang jebat|chinatown','Best all-round','Walk to the night market, river, Dutch Square and food.'],
    ['Melaka River / Kampung Morten','river|kampung morten|morten','Quiet + pretty','River-view guesthouses and a lit-up riverside walk at night.'],
    ['Bandar Hilir / Mahkota','bandar hilir|mahkota|hatten','Malls + newer hotels','Bigger modern hotels near malls; 10–15 minutes’ walk to the old town.']
  ],
  recs:{
    'Food':[
      ['Chicken rice balls on Jonker Street','LOCAL ICON','Melaka’s signature — Hainanese chicken with rice rolled into balls. Expect queues at the famous shops.'],
      ['Asam pedas','MALAY CLASSIC','Sour-spicy fish stew Melaka is known for — Malay stalls and restaurants around town serve it.','halal'],
      ['Nyonya lunch','PERANAKAN','Ayam pongteh, buah keluak and kuih — book or go early at the popular spots and ask about pork.'],
      ['Cendol with gula Melaka','DESSERT','Shaved ice, coconut milk and the local palm sugar — the town’s sweet hero.'],
      ['Satay celup','DIP-IT-YOURSELF','Skewers dunked into a bubbling peanut-sauce pot — a fun group meal; Chinese-run spots include pork skewers.','pork']
    ],
    'Cafés':[
      ['The Daily Fix Café','BRUNCH','Hidden behind a Jonker Street shopfront; known for pandan pancakes.'],
      ['Klebang coconut shake','ROADSIDE','The famous coconut-water-and-ice-cream shake — pair it with a beach sunset.']
    ],
    'Social / night':[
      ['Jonker Walk Night Market','FRI–SUN','Street food, a karaoke stage, trinkets and crowds — the town’s big weekend energy.'],
      ['Melaka River night walk','FREE','Lit-up riverbanks, murals and bars along the water; cruise boats run into the evening.']
    ],
    'Hidden / small':[
      ['Harmony Street (Jalan Tukang Emas)','CULTURE','A mosque, a Hindu temple and Malaysia’s oldest Chinese temple on one short street.'],
      ['Kampung Morten','VILLAGE','Traditional Malay wooden houses right in town along the river.'],
      ['St Paul’s Hill at sunrise','VIEW','The ruined hilltop church before the tour buses arrive.']
    ],
    'Big memory':[
      ['Straits Mosque (Masjid Selat) sunset','SUNSET','The “floating mosque” glows at golden hour; dress modestly.'],
      ['Melaka River cruise','BOAT','Cruise past murals and Kampung Morten — best after dark.'],
      ['Baba & Nyonya Heritage Museum','MUSEUM','Guided walk through a Peranakan family townhouse.']
    ]
  },
  acts:[
    ['Dutch Square / Christ Church','FREE','free','Heritage','Early morning'],
    ['St Paul’s Hill + A Famosa','FREE','free','Ruins / view','Morning'],
    ['Jonker Walk Night Market','FREE ENTRY','free','Night market / food','Fri–Sun evening'],
    ['Melaka River cruise','PAID','paid','Boat ride','After dark'],
    ['Melaka River walk','FREE','free','Night walk','Evening'],
    ['Cheng Hoon Teng Temple','FREE','free','Temple','Morning'],
    ['Kampung Kling Mosque','FREE','free','Mosque','Outside prayer times'],
    ['Baba & Nyonya Heritage Museum','PAID','paid','Museum','Midday'],
    ['Straits Mosque sunset','FREE','free','Mosque / sunset','Sunset'],
    ['Menara Taming Sari','PAID','paid','Rotating tower view','Optional'],
    ['Kampung Morten','FREE','free','Malay village walk','Late afternoon'],
    ['Klebang Beach + coconut shake','LOW PAID','mixed','Sunset / snack','Sunset'],
    ['Maritime Museum (ship replica)','PAID','paid','Museum','Rain backup'],
    ['Trishaw ride','PAID','paid','Kitschy fun','Evening']
  ],
  clusters:[
    'Dutch Square → St Paul’s Hill → Maritime Museum → river walk',
    'Harmony Street → Cheng Hoon Teng → Jonker Street lunch → Baba & Nyonya Museum',
    'Klebang coconut shake → Straits Mosque sunset → Jonker Walk (Fri–Sun)'
  ],
  picks:[
    ['Dutch Square + St Paul’s Hill','Culture','Culture','outdoor','WALK','Before 10 AM to beat the heat and tour groups.'],
    ['Jonker Walk Night Market','Food','Food/Shopping/Nightlife/Social','mixed','WALK','Friday–Sunday only — plan your nights around it.'],
    ['Melaka River cruise','View','Relax/Culture','mixed','WALK','Best once the lights come on.'],
    ['Nyonya lunch','Food','Food/Culture','indoor','WALK / GRAB','Sit somewhere cool for the hottest hours.'],
    ['Straits Mosque sunset','View','Culture/Relax','outdoor','GRAB','About 10–15 minutes by Grab from Jonker Street.']
  ],
  night:[
    ['Jonker Walk Night Market','Fri–Sun, 6 PM+','The town really comes alive on weekend nights.','WALK'],
    ['Melaka River walk + cruise','After 7 PM','Murals and riverside bars glow after dark.','WALK']
  ]
});

add({
  name:'Ipoh', country:'MY', region:'Perak (between KL and Penang)', emoji:'☕', accent:'#92400e',
  coords:[4.5975,101.0901], metName:'Ipoh',
  tagline:'Laid-back food town of white coffee, limestone cave temples and murals',
  famous:['Ipoh white coffee','Bean sprout chicken','Cave temples','Old Town murals','Concubine Lane','Dim sum breakfasts'],
  nov:['mixed','Among Ipoh’s rainier months — showers are usually in the afternoon. Cave temples and kopitiams make good rain plans.'],
  base:'Old Town / Concubine Lane',
  why:'About 2–2.5 hours from KL by ETS train for eating, temples inside limestone cliffs and a slower small-city vibe.',
  next:'Old Town kopitiam breakfast → murals and Concubine Lane → Kek Lok Tong cave temple → bean sprout chicken dinner.',
  avoid:'The cave temples are spread out — Grab between them instead of trying to walk.',
  alts:['New Town — dim sum belt and food streets','Near Ipoh Railway Station — easy arrival day'],
  sigs:['White coffee in Old Town','Concubine Lane','Kek Lok Tong','Bean sprout chicken','Mirror Lake (Tasik Cermin)'],
  own:['Lost World of Tambun if you want a water park + hot springs day','Kellie’s Castle half-day'],
  getThere:'ETS train from KL Sentral to Ipoh (about 2–2.5 hours) — book ahead on KTMB. It’s also on the way to Penang or the Cameron Highlands.',
  tips:['Ipoh makes a perfect stop between KL and Penang — 1–2 nights is enough.',
        'Old-school coffee shops close by mid-afternoon; breakfast and lunch are the moments.',
        'Bean sprout chicken and most dim sum are Chinese-run (not halal); for halal, try the famous nasi kandar with red fried chicken.'],
  airport:'Sultan Azlan Shah Airport (few flights) — most people come by ETS train',
  advice:'Old Town is walkable. Grab for the cave temples, Tambun and Mirror Lake.',
  intercity:[KTMB,BOT_MY],
  stays:[
    ['Old Town','old town|concubine|panglima|bandar timah|ipoh lama','Best all-round','Walk to murals, kopitiams and Concubine Lane.'],
    ['New Town','new town|sultan iskandar|leong sin nam|yau tet shin','Food streets','The dim sum belt and bean sprout chicken strip on your doorstep.'],
    ['Railway Station area','railway|station','Easy arrival','Grand colonial station, quick hop to Old Town.']
  ],
  recs:{
    'Food':[
      ['Sin Yoon Loong / Nam Heong','WHITE COFFEE','Two Old Town kopitiams on the same street — white coffee at one, egg tarts at the other. Try both.'],
      ['Lou Wong Bean Sprout Chicken','NGA CHOY KAI','The famous bean sprout chicken corner in New Town (Jalan Yau Tet Shin).'],
      ['Thean Chun Coffee Shop','HOR FUN + CUSTARD','Old mirrored coffee shop known for chicken hor fun and caramel custard.','','https://goingplaces.malaysiaairlines.com/ipoh-eats/'],
      ['Jalan Leong Sin Nam dim sum','DIM SUM','Foh San, Ming Court and Yoke Fook Moon line the dim sum belt — go before 9 AM.','pork','https://goingplaces.malaysiaairlines.com/ipoh-eats/'],
      ['Nasi Ganja (Nasi Kandar Ayam Merah)','NASI KANDAR','Ipoh’s cult “addictive” rice with red fried chicken in Old Town.','halal'],
      ['Funny Mountain Soya Bean','DESSERT','Silky tau fu fa and soya milk; the queue moves quickly.']
    ],
    'Cafés':[
      ['Plan B (Kong Heng Square)','CAFÉ','Café in a restored shophouse block next to Concubine Lane.'],
      ['Old Town kopitiam hop','COFFEE','Order “kopi putih” and kaya toast — the whole point of Ipoh mornings.']
    ],
    'Social / night':[
      ['Concubine Lane + Kong Heng Square','EVENING','Lanterns, snack stalls and street life in the old core.'],
      ['Old Town dinner crawl','EVENING','Ipoh is quiet at night — make dinner the event, then dessert at Funny Mountain.']
    ],
    'Hidden / small':[
      ['Mirror Lake (Tasik Cermin)','HIDDEN LAKE','Turquoise lake hidden inside a limestone hill, reached through a short cave tunnel.'],
      ['Gunung Lang Recreational Park','NATURE','Short boat ride across a lake to limestone views.'],
      ['Old Town murals','STREET ART','Ernest Zacharevic’s murals scattered around the Old Town lanes.']
    ],
    'Big memory':[
      ['Kek Lok Tong','CAVE TEMPLE','A cave temple that opens onto a garden and lake ringed by cliffs — the best one for first-timers.'],
      ['Sam Poh Tong + Perak Tong','CAVE TEMPLES','Two more limestone cave temples; pick one if short on time.'],
      ['Lost World of Tambun','THEME + HOT SPRINGS','Water park, small zoo and evening hot springs — a full fun day.']
    ]
  },
  acts:[
    ['Old Town kopitiam breakfast','LOW PAID','mixed','Food / coffee','Morning'],
    ['Concubine Lane','FREE','free','Heritage lane / shopping','Morning'],
    ['Old Town mural trail','FREE','free','Street art','Morning'],
    ['Ipoh Railway Station','FREE','free','Architecture','Anytime'],
    ['Kek Lok Tong','FREE','free','Cave temple / garden','Morning'],
    ['Sam Poh Tong','FREE','free','Cave temple','Morning'],
    ['Perak Tong','FREE','free','Cave temple / climb','Morning'],
    ['Mirror Lake (Tasik Cermin)','LOW PAID','mixed','Hidden lake','Daytime'],
    ['Gunung Lang Recreational Park','LOW PAID','mixed','Lake / limestone','Afternoon'],
    ['Lost World of Tambun','PAID','paid','Water park / hot springs','Dedicated day'],
    ['Kellie’s Castle','PAID','paid','Ruined mansion','Half day'],
    ['Bean sprout chicken dinner','PAID','paid','Food','Evening'],
    ['Dim sum on Jalan Leong Sin Nam','PAID','paid','Food','Early morning']
  ],
  clusters:[
    'Old Town kopitiam → murals → Concubine Lane → Kong Heng Square',
    'Kek Lok Tong → Sam Poh Tong → Mirror Lake',
    'Lost World of Tambun → hot springs after dark'
  ],
  picks:[
    ['Old Town kopitiam breakfast','Food','Food/Cafe/Culture','mixed','WALK','Before 10 AM — that’s when Ipoh is at its best.'],
    ['Concubine Lane + murals','Culture','Culture/Shopping','outdoor','WALK','Quick and photogenic — combine with breakfast.'],
    ['Kek Lok Tong cave temple','Culture','Culture/Nature','mixed','GRAB','The cave stays cool even at midday.'],
    ['Mirror Lake (Tasik Cermin)','Nature','Nature/Adventure','outdoor','GRAB','Short and unusual — go when it isn’t pouring.'],
    ['Bean sprout chicken dinner','Food','Food','indoor','GRAB / WALK','Ipoh’s signature dinner.']
  ],
  night:[
    ['Bean sprout chicken strip','After 6 PM','Ipoh nights are about the food, not bars.','GRAB'],
    ['Concubine Lane evening','After sunset','Lanterns and snacks — low-key and pretty.','WALK']
  ]
});

add({
  name:'Cameron Highlands', country:'MY', region:'Central highlands', emoji:'🍃', accent:'#15803d',
  coords:[4.4706,101.3767], metName:'Cameron Highlands',
  tagline:'Cool-weather tea country with strawberry farms and a misty mossy forest',
  famous:['BOH tea plantations','Mossy Forest','Strawberry farms','Cool weather','Night market','Steamboat dinners'],
  nov:['mixed','Rainy afternoons and misty mornings; trails get muddy and the road can be slow after heavy rain. Bring a light jacket.'],
  base:'Tanah Rata',
  why:'Escape the heat: tea-plantation views, a moss-draped cloud forest and cosy steamboat nights.',
  next:'Tea estate + Mossy Forest in the morning, strawberries and the market in the afternoon.',
  avoid:'Weekends and Malaysian school holidays jam the single road up — go midweek if you can.',
  alts:['Brinchang — closer to farms and the night market','Kea Farm / Golden Hills — near the market, farm-stay feel'],
  sigs:['BOH tea plantation','Mossy Forest boardwalk','Strawberry farm','Kea Farm market','Steamboat dinner'],
  own:['One clear morning for a Land Rover tour: sunrise, Mossy Forest and the tea estate'],
  getThere:'Bus from KL (about 4 hours on a winding road — take motion-sickness tablets) or a shared minivan from Ipoh or Penang.',
  tips:['Mornings are clearest; clouds usually roll in by early afternoon.',
        'Mossy Forest is reached by registered 4x4 / Land Rover tours from Tanah Rata, and has its own entry fee.',
        'Evenings are genuinely cool — pack a jacket.'],
  airport:'No airport — bus or minivan from KL, Ipoh or Penang',
  advice:'Grab exists but cars can be scarce. Land Rover tours are the easy way to Mossy Forest and the tea estates.',
  intercity:[BOT_MY,REDBUS],
  stays:[
    ['Tanah Rata','tanah rata','Best all-round','Most guesthouses, restaurants and tour pickups.'],
    ['Brinchang','brinchang','Market side','Closer to the farms and the weekend night market.'],
    ['Kea Farm / Golden Hills','kea farm|golden hills','Farm views','Near the market; quiet at night.']
  ],
  recs:{
    'Food':[
      ['Steamboat dinner','LOCAL CLASSIC','Hot pot is the thing to eat in the cool air — many Tanah Rata spots, including halal ones.'],
      ['Strawberry everything','SWEET','Farms sell fresh strawberries, jam, milkshakes and ice cream.'],
      ['Night market snacks','STREET FOOD','Grilled corn, satay and strawberry treats — busiest Friday and Saturday nights.']
    ],
    'Cafés':[
      ['BOH Sungei Palas Tea Centre','TEA + VIEWS','Café hanging over the tea slopes — arrive early for a window seat.'],
      ['Cameron Valley Tea House','ROADSIDE TEA','Easy roadside stop for tea and scones with plantation views.']
    ],
    'Social / night':[
      ['Golden Hills / Brinchang night market','NIGHT MARKET','The main evening thing to do here; busiest at weekends.'],
      ['Tanah Rata steamboat night','EVENING','Low-key nights: hot pot and an early sleep before a sunrise tour.']
    ],
    'Hidden / small':[
      ['Parit Falls','WATERFALL','Small waterfall walk near Tanah Rata.'],
      ['Time Tunnel Museum','QUIRKY','Nostalgic memorabilia museum for a rainy hour.'],
      ['Gunung Jasar trail','HIKE','Steep jungle trail from Tanah Rata — check it’s open and never hike alone.']
    ],
    'Big memory':[
      ['Mossy Forest','CLOUD FOREST','Boardwalk through misty, moss-covered forest near the top of Gunung Brinchang.'],
      ['BOH Sungei Palas','TEA ESTATE','Rolling tea terraces and a peek into the factory.'],
      ['Sunrise Land Rover tour','SUNRISE','Many tours start before dawn for the sea-of-clouds view.']
    ]
  },
  acts:[
    ['Mossy Forest','PAID','paid','Cloud forest','Morning'],
    ['BOH Sungei Palas Tea Centre','FREE ENTRY','free','Tea estate / café','Morning'],
    ['Cameron Valley Tea House','LOW PAID','mixed','Tea / views','Anytime'],
    ['Strawberry farm picking','PAID','paid','Farm','Afternoon'],
    ['Cameron Lavender Garden','PAID','paid','Garden','Afternoon'],
    ['Kea Farm market','FREE ENTRY','free','Market / shopping','Daytime'],
    ['Golden Hills night market','FREE ENTRY','free','Night market','Fri–Sat evening'],
    ['Sunrise Land Rover tour','PAID','paid','Sunrise / tour','Pre-dawn'],
    ['Parit Falls','FREE','free','Waterfall walk','Morning'],
    ['Gunung Jasar trail','FREE','free','Hike','Morning, dry weather'],
    ['Time Tunnel Museum','PAID','paid','Museum','Rain backup'],
    ['Butterfly garden','PAID','paid','Nature / indoor','Rain backup']
  ],
  clusters:[
    'Sunrise tour → Mossy Forest → BOH Sungei Palas tea',
    'Kea Farm market → strawberry farm → lavender garden',
    'Tanah Rata → Parit Falls → steamboat dinner'
  ],
  picks:[
    ['Mossy Forest + BOH tea','Nature','Nature/Adventure','outdoor','LAND ROVER TOUR','Morning only — clouds close in by the afternoon.'],
    ['Strawberry farm + Kea Farm market','Food','Food/Shopping','mixed','GRAB','Easy afternoon even with drizzle.'],
    ['Cameron Valley Tea House','Cafe','Cafe/Relax','mixed','GRAB','Tea and scones with a view.'],
    ['Steamboat dinner','Food','Food/Social','indoor','WALK','Cosy, cheap and very Cameron.'],
    ['Golden Hills night market','Night','Food/Shopping/Nightlife','outdoor','GRAB','Weekend nights are best.']
  ],
  night:[
    ['Golden Hills / Brinchang night market','Fri–Sat, after 5 PM','The one evening “event” in the highlands.','GRAB'],
    ['Steamboat in Tanah Rata','After dark','Cold air + hot pot = the move.','WALK']
  ]
});

add({
  name:'Kota Kinabalu', country:'MY', region:'Sabah, Borneo', emoji:'🏔️', accent:'#0e7490',
  coords:[5.9804,116.0735], metName:'Kota Kinabalu',
  tagline:'Borneo gateway: island hopping, Mount Kinabalu views and seafood night markets',
  famous:['Mount Kinabalu','Island hopping','Waterfront sunsets','Seafood night market','Proboscis monkeys + fireflies','Kundasang highlands'],
  nov:['mixed','The wetter months begin. Mornings are usually fine for islands; afternoon storms are common. Kinabalu summit climbs need permits booked months ahead.'],
  base:'KK city centre / waterfront',
  why:'Borneo without a jungle expedition: islands 15 minutes away by boat, highland day trips and huge sunsets.',
  next:'Island-hop in the morning, waterfront sunset, night-market seafood — then a Kundasang highlands day.',
  avoid:'Don’t plan a Mount Kinabalu summit climb last-minute — permits and mountain beds sell out months ahead.',
  alts:['Tanjung Aru — beach + sunset, resort side','Gaya Street area — food and the Sunday market','Kundasang — 2 hours away, cool highland stay with Kinabalu views'],
  sigs:['Island hopping (Manukan / Sapi)','Waterfront sunset','Night-market seafood','Kundasang + Desa Dairy Farm','Klias river cruise'],
  own:['Kundasang highlands day (or overnight)','Klias river cruise — monkeys at dusk, fireflies after dark'],
  getThere:'Fly KL → Kota Kinabalu (about 2.5 hours). Sabah runs its own immigration check even on domestic flights — keep your passport handy.',
  tips:['Sabah and Sarawak stamp passports on arrival from Peninsular Malaysia — carry it on domestic flights.',
        'Island boats leave from Jesselton Point; go early for calmer water and fewer crowds.',
        'Sunsets here are a big deal — plan one evening around Tanjung Aru or the waterfront.'],
  airport:'Kota Kinabalu International Airport (BKI)',
  advice:'Grab is everywhere and cheap. Walk the waterfront and Gaya Street; boats to the islands leave from Jesselton Point.',
  intercity:[['AirAsia','https://www.airasia.com/'],['Malaysia Airlines','https://www.malaysiaairlines.com/']],
  stays:[
    ['KK city centre / waterfront','city centre|waterfront|gaya|jesselton|kk','Best all-round','Walk to the night market, Gaya Street and the island jetty.'],
    ['Tanjung Aru','tanjung aru','Beach + sunset','Resort side near the airport, with the best sunset beach.'],
    ['Kundasang','kundasang','Highland stay','Cool air and Kinabalu views, about 2 hours’ drive.']
  ],
  recs:{
    'Food':[
      ['Waterfront night market seafood','SEAFOOD','Pick your fish and squid at the stalls by the Filipino Market and have it grilled on the spot.'],
      ['Yii Siang Ngiu Chap','BEEF NOODLES','KK’s famous beef noodle soup — Sabah comfort food.','','https://theshutterwhale.com/blog/2023/1/9/top-places-to-check-out-in-kota-kinabalu-for-delicious-local-food-2023-edition'],
      ['Kedai Kopi Yee Fung','LAKSA','Gaya Street breakfast institution for laksa.','','https://theshutterwhale.com/blog/2023/1/9/top-places-to-check-out-in-kota-kinabalu-for-delicious-local-food-2023-edition'],
      ['Tuaran mee','SABAH NOODLE','Springy egg noodles fried with char siu or chicken — ask for the chicken version if you avoid pork.'],
      ['Hinava','KADAZAN DISH','Raw fish cured with lime, chilli and ginger — try it at a Sabahan restaurant.'],
      ['Welcome Seafood Restaurant','SEAFOOD HALL','Big live-tank seafood restaurant locals take visitors to; kam heong crab.']
    ],
    'Cafés':[
      ['Sabah tea','LOCAL TEA','Sabah-grown tea — the tea garden is on the way if you go to Kundasang.'],
      ['Gaya Street kopitiams','BREAKFAST','Old-school coffee shops for kaya toast and laksa before the islands.']
    ],
    'Social / night':[
      ['Waterfront sunset → night market','SUNSET','Watch the sky go orange, then walk to the seafood stalls.'],
      ['Gaya Street Sunday Market','SUNDAY','Morning market with crafts, food and plants.']
    ],
    'Hidden / small':[
      ['Signal Hill Observatory','VIEW','Short climb for a city-and-islands view.'],
      ['Kota Kinabalu City Mosque','MOSQUE','“Floating” mosque on a lagoon — best at sunset; dress modestly.'],
      ['Mari Mari Cultural Village','CULTURE','Guided tour of Sabah’s ethnic houses and traditions.']
    ],
    'Big memory':[
      ['Island hopping (Tunku Abdul Rahman Park)','ISLANDS','Manukan, Sapi, Mamutik — snorkel, beach, back by the afternoon.'],
      ['Kundasang + Kinabalu Park','HIGHLANDS','Desa Dairy Farm, the war memorial and Mount Kinabalu views.'],
      ['Klias river cruise','WILDLIFE','Proboscis monkeys at dusk and fireflies after dark.']
    ]
  },
  acts:[
    ['Island hopping (Manukan / Sapi / Mamutik)','PAID','paid','Islands / snorkel','Morning'],
    ['Snorkelling at Sapi','PAID','paid','Snorkel','Morning'],
    ['Waterfront sunset','FREE','free','Sunset','Sunset'],
    ['Waterfront night market','FREE ENTRY','free','Seafood / street food','Evening'],
    ['Gaya Street Sunday Market','FREE','free','Market','Sunday morning'],
    ['Signal Hill Observatory','FREE','free','View','Late afternoon'],
    ['Kota Kinabalu City Mosque','FREE','free','Mosque / architecture','Sunset'],
    ['Tanjung Aru beach sunset','FREE','free','Beach / sunset','Sunset'],
    ['Kundasang + Desa Dairy Farm','PAID','paid','Highlands / farm','Dedicated day'],
    ['Kinabalu Park botanical trails','PAID','paid','Nature / walk','Morning'],
    ['Poring hot springs + canopy walk','PAID','paid','Hot springs / canopy','Day trip'],
    ['Klias river cruise','PAID','paid','Wildlife / fireflies','Afternoon → night'],
    ['Mari Mari Cultural Village','PAID','paid','Culture','Half day'],
    ['Mount Kinabalu climb','PAID','paid','Summit trek','Permits months ahead']
  ],
  clusters:[
    'Jesselton Point → Manukan / Sapi → waterfront sunset → night market',
    'Kundasang → Desa Dairy Farm → Kinabalu Park → Sabah tea',
    'City Mosque → Signal Hill → Gaya Street'
  ],
  picks:[
    ['Island hopping','Adventure','Adventure/Nature/Relax','outdoor','BOAT FROM JESSELTON POINT','Go early — calmer sea, fewer people.'],
    ['Waterfront sunset','View','Relax/Nature','outdoor','WALK','KK sunsets are the city’s free show.'],
    ['Night-market seafood dinner','Food','Food/Social','mixed','WALK','Point, pay, grilled — easy and cheap.'],
    ['Kundasang highlands day','Day trip','Nature/Adventure','outdoor','DRIVER / TOUR','Clear mornings show Kinabalu best.'],
    ['Klias river cruise','Wildlife','Nature/Adventure','outdoor','TOUR','Monkeys at dusk, fireflies at night.']
  ],
  night:[
    ['Waterfront night market','After sunset','Grill smoke, sunset crowds, cheap and lively.','WALK'],
    ['Tanjung Aru sunset','Around 5:30–6:30 PM','One of Borneo’s famous sunsets — go before the night market.','GRAB']
  ]
});

add({
  name:'Kuching', country:'MY', region:'Sarawak, Borneo', emoji:'🐈', accent:'#c2410c',
  coords:[1.5535,110.3593], metName:'Kuching',
  tagline:'Cat City: orangutans, proboscis monkeys and Sarawak laksa',
  famous:['Semenggoh orangutans','Bako National Park','Sarawak laksa','Kuching Waterfront','Cat statues','Sarawak Cultural Village'],
  nov:['mixed','Monsoon season begins: expect afternoon rain, and Bako boats can be cancelled on rough days — keep a buffer day.'],
  base:'Kuching Waterfront / Main Bazaar',
  why:'See semi-wild orangutans and proboscis monkeys within an hour of a relaxed riverside city.',
  next:'Semenggoh morning feeding, the waterfront and Main Bazaar, then a full Bako day.',
  avoid:'Orangutans don’t always show up at Semenggoh (especially in fruiting season) — treat sightings as a bonus, not a guarantee.',
  alts:['Padungan — cafés, bars and old Chinatown','Damai / Santubong — beach resorts near the Cultural Village'],
  sigs:['Semenggoh feeding','Bako National Park','Sarawak laksa breakfast','Waterfront + Darul Hana Bridge','Borneo Cultures Museum'],
  own:['Bako National Park — full day (boat from Kampung Bako)','Sarawak Cultural Village half-day'],
  getThere:'Fly KL → Kuching (about 1h 45m). Sarawak runs its own immigration check — carry your passport.',
  tips:['Semenggoh feeding times are 9–10 AM and 3–3:30 PM; arrive before they start.',
        'Bako boats depend on tide and sea conditions — go early and confirm your return time.',
        'Kolo mee is traditionally made with pork lard; halal versions use beef or chicken oil.'],
  airport:'Kuching International Airport (KCH)',
  advice:'The waterfront core is walkable. Grab for Semenggoh, the Bako jetty and the Cultural Village.',
  intercity:[['AirAsia','https://www.airasia.com/'],['Malaysia Airlines','https://www.malaysiaairlines.com/']],
  stays:[
    ['Waterfront / Main Bazaar','waterfront|main bazaar|india street|carpenter','Best all-round','Walk to the river, museums, cafés and food.'],
    ['Padungan','padungan','Cafés + nightlife','Old Chinatown strip with bars, cafés and kolo mee.'],
    ['Damai / Santubong','damai|santubong','Beach + Cultural Village','Resort side about 40 minutes out, near Mount Santubong.']
  ],
  recs:{
    'Food':[
      ['Sarawak laksa','LAKSA','The breakfast Kuching is famous for — Choon Hui and Chong Choon are classic stops; go before 10 AM.'],
      ['Mee Kolok Haji Salleh','KOLO MEE','Halal kolo mee made with beef or chicken oil instead of lard (Jalan Satok).','halal','https://www.bateriku.com/news/best-mee-kolok-laksa-sarawak-kuching-food-guide'],
      ['Topspot Food Court','SEAFOOD','Rooftop seafood court in Padungan — try midin fern with belacan.','','https://www.bateriku.com/news/best-mee-kolok-laksa-sarawak-kuching-food-guide'],
      ['Kek lapis Sarawak','SOUVENIR CAKE','Colourful layered cakes — buy boxed ones to take home.']
    ],
    'Cafés':[
      ['Black Bean Coffee & Tea','LOCAL COFFEE','Tiny Carpenter Street shop serving Sarawak-grown coffee.'],
      ['Mita Cake House','CAKES','Kuching’s much-loved butter cake.','','https://www.bateriku.com/news/best-mee-kolok-laksa-sarawak-kuching-food-guide']
    ],
    'Social / night':[
      ['Waterfront at night','EVENING','Riverside promenade with the lit-up Darul Hana Bridge and the parliament building across the water.'],
      ['Padungan + Carpenter Street','NIGHT','Laid-back bars and street food in the old Chinatown.']
    ],
    'Hidden / small':[
      ['Cat statues + Cat Museum','QUIRKY','Kuching leans into its “cat” name — the Cat Museum is on the hill north of the river.'],
      ['Fort Margherita','HISTORY','Brooke-era fort across the river; take the little sampan ferry.'],
      ['Siniawan Old Night Market','NIGHT MARKET','Old shophouse street that turns into a weekend night market, about 25 minutes out.','','https://www.bateriku.com/news/best-mee-kolok-laksa-sarawak-kuching-food-guide']
    ],
    'Big memory':[
      ['Bako National Park','RAINFOREST + COAST','Proboscis monkeys, pitcher plants and sea stacks — boat-only access.'],
      ['Semenggoh Wildlife Centre','ORANGUTANS','Semi-wild orangutans come in at feeding time.','','https://sarawaktourism.com/blog/semenggoh-wildlife-centre'],
      ['Sarawak Cultural Village','CULTURE','Living museum of longhouses with dance shows.']
    ]
  },
  acts:[
    ['Semenggoh Wildlife Centre','PAID','paid','Orangutans','9 AM or 3 PM feeding'],
    ['Bako National Park','PAID','paid','Rainforest / wildlife','Full day'],
    ['Kuching Waterfront walk','FREE','free','River promenade','Evening'],
    ['Darul Hana Bridge','FREE','free','Bridge / view','Sunset'],
    ['Main Bazaar + Carpenter Street','FREE','free','Old shops / crafts','Morning'],
    ['Borneo Cultures Museum','PAID','paid','Museum','Rain backup'],
    ['Fort Margherita + sampan ride','LOW PAID','mixed','History / boat','Afternoon'],
    ['Cat Museum','LOW PAID','mixed','Quirky museum','Optional'],
    ['Sarawak Cultural Village','PAID','paid','Longhouses / culture','Half day'],
    ['Annah Rais Longhouse','PAID','paid','Bidayuh longhouse','Half day'],
    ['Wind Cave + Fairy Cave','PAID','paid','Caves','Half day'],
    ['Siniawan Old Night Market','FREE ENTRY','free','Night market','Weekend evenings'],
    ['Sarawak laksa breakfast','LOW PAID','mixed','Food','Before 10 AM']
  ],
  clusters:[
    'Semenggoh 9 AM feeding → laksa brunch → Borneo Cultures Museum',
    'Main Bazaar → sampan to Fort Margherita → Darul Hana Bridge at sunset',
    'Bako National Park = full day'
  ],
  picks:[
    ['Semenggoh orangutan feeding','Wildlife','Nature/Adventure','outdoor','GRAB','Arrive before 9 AM or 3 PM.'],
    ['Bako National Park','Adventure','Nature/Adventure','outdoor','GRAB + BOAT','Go early and confirm the return boat.'],
    ['Sarawak laksa breakfast','Food','Food','indoor','WALK / GRAB','A breakfast worth planning a morning around.'],
    ['Waterfront sunset','View','Relax/Culture','outdoor','WALK','Bridge lights come on after dusk.'],
    ['Borneo Cultures Museum','Culture','Culture','indoor','WALK','Strong rainy-afternoon option.']
  ],
  night:[
    ['Kuching Waterfront','After sunset','The river promenade and bridge are the city’s evening hangout.','WALK'],
    ['Siniawan Old Night Market','Weekend evenings','Lantern-lit old-town street food 25 minutes away.','GRAB']
  ]
});

add({
  name:'Perhentian Islands', country:'MY', region:'East coast islands', emoji:'🐢', accent:'#0891b2',
  coords:[5.9030,102.7470],
  tagline:'Clear-water backpacker islands — but shut for the monsoon during a late-Nov trip',
  famous:['Snorkelling with turtles','Long Beach','No cars or roads','Cheap dive courses'],
  nov:['closed','Northeast monsoon: most island resorts and boats on Malaysia’s east coast stop from around November to February/March. Swap for Langkawi, Phuket or Krabi on this trip.'],
  base:'Perhentian Kecil (Long Beach) or Perhentian Besar',
  why:'Famous for clear water and turtles — listed so you know why it isn’t on a November trip.',
  next:'Save it for a March–September trip.',
  avoid:'Don’t book anything here for late November–December — boats and resorts are largely closed.',
  getThere:'Speedboat from Kuala Besut jetty (in season only).',
  tips:['East-coast islands (Perhentian, Redang, Tioman) are a no-go in late November.','The Andaman side (Langkawi, Phuket, Krabi, Phi Phi) is in season instead.'],
  airport:'Kota Bharu Airport (KBR), then Kuala Besut jetty',
  advice:'In season: walk, water taxis and jungle trails between beaches.',
  recs:{
    'Big memory':[['Turtle snorkelling','IN SEASON ONLY','Shallow-water turtles off Perhentian Besar — roughly March–September.']]
  },
  acts:[['Snorkelling trip','PAID','paid','Water / turtles','In season only (about Mar–Sep)']],
  picks:[],
  night:[]
});
})();

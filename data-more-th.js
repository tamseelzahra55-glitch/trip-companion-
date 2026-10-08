/* Extra Thailand destinations. Same compact format as data-more-my.js. */
(function(){
const add = window.TRIP_DATA.add;
const TWELVEGO = ['12Go (ferries, vans, buses)','https://12go.asia/en'];
const BOT_TH = ['BusOnlineTicket TH','https://www.busonlineticket.co.th/'];
const LOMPRAYAH = ['Lomprayah catamarans','https://www.lomprayah.com/'];
const SRT = ['SRT D-Ticket (trains)','https://dticket.railway.co.th/DTicketPublicWeb/home/Home'];

add({
  name:'Krabi', country:'TH', region:'Andaman coast', emoji:'🧗', accent:'#0d9488',
  coords:[8.0326,98.8236],
  tagline:'Limestone cliffs, longtail boats and the most dramatic beaches on the Andaman coast',
  famous:['Railay + Phra Nang Cave Beach','4 Islands / Hong Islands','Tiger Cave Temple','Rock climbing','Emerald Pool','Longtail boats'],
  nov:['good','Andaman high season kicks in — seas settle through November, though early-month showers still happen.'],
  base:'Ao Nang',
  why:'The most dramatic beach scenery in Thailand plus easy island days — a strong alternative or add-on to Phuket.',
  next:'Longtail to Railay, one island-hopping day, Tiger Cave Temple at sunrise.',
  avoid:'Don’t stack Phi Phi + 4 Islands + Hong Islands back-to-back — pick one or two boat days.',
  alts:['Railay — car-free, boat-only, stunning but pricier','Krabi Town — local, cheap, night markets','Klong Muang / Tubkaek — quiet resorts'],
  sigs:['Railay + Phra Nang Cave Beach','4 Islands or Hong Islands','Tiger Cave Temple','Emerald Pool + Hot Springs','Ao Nang sunset'],
  own:['One island-hopping day','Emerald Pool + hot springs + Tiger Cave Temple (half/full day)'],
  getThere:'Fly into Krabi (KBV), or take a ferry or van from Phuket (about 2–3 hours). Ferries also run Phuket → Phi Phi → Ao Nang.',
  tips:['Longtails to Railay leave from Ao Nang beach once enough people gather; the last boats run around sunset.',
        'Krabi has a large Muslim community — halal food is easy to find around Ao Nang and Krabi Town.',
        'Tiger Cave Temple has about 1,260 steep steps: go at sunrise, bring water, cover shoulders and knees.'],
  airport:'Krabi International Airport (KBV)',
  advice:'Songthaews and Grab/Bolt between Ao Nang, Krabi Town and the airport; longtail boats to Railay and the islands.',
  intercity:[TWELVEGO,BOT_TH],
  stays:[
    ['Ao Nang','ao nang','Best all-round','Beach, food, night market and every boat-tour pickup.'],
    ['Railay','railay','Boat-only beauty','Car-free cliffs and climbing; quiet at night, pricier, luggage goes by boat.'],
    ['Krabi Town','krabi town|chao fah','Local + budget','Riverside town with night markets, about 25 minutes from the beach.'],
    ['Klong Muang','klong muang|tubkaek','Quiet resorts','Calm beaches and resort pools; you’ll need transport.']
  ],
  recs:{
    'Food':[
      ['Raan Andaman Ao Nang Halal Food','KHAO GAENG','Curry-over-rice shop for southern Thai curries and fish tom yum.','halal','https://www.travelfish.org/eatandmeet/thailand/southern_thailand/krabi/ao_nang/eat'],
      ['Ao Nang Night Market (end of Soi 8)','NIGHT MARKET','Daily 5–10 PM: grilled seafood, pad thai, kebabs and fresh juice.','','https://www.travelfish.org/eatandmeet/thailand/southern_thailand/krabi/ao_nang/eat'],
      ['Krabi Town weekend Walking Street','WEEKEND MARKET','Friday–Sunday evening market with local food and live music.'],
      ['Southern Thai curries + roti','LOCAL','Southern food is spicier than Bangkok’s — say “mai phet” if you need to.']
    ],
    'Cafés':[
      ['Cafe 8.98','COFFEE','Ao Nang café for coffee and breakfast before boat pickups.','','https://www.travelfish.org/eatandmeet/thailand/southern_thailand/krabi/ao_nang/eat']
    ],
    'Massage':[
      ['Beachfront massage in Ao Nang','RECOVERY','Perfect after a climbing or island day — plenty of simple shops along the beach road.']
    ],
    'Social / night':[
      ['Railay West sunset','SUNSET','Watch the cliffs glow, then longtail or walk back depending on where you sleep.'],
      ['Ao Nang beach-road bars','NIGHT','Easy-going bars and live music — nothing like Patong.']
    ],
    'Hidden / small':[
      ['Phra Nang Cave Beach','BEACH','Walk from Railay East to the cave shrine and powder-white sand.'],
      ['Ao Thalane kayaking','KAYAK','Paddle through mangroves and cliffs — calmer than sea kayaking.'],
      ['Railay Viewpoint + Lagoon','SCRAMBLE','Steep rope-assisted climb — only with good shoes and dry weather.']
    ],
    'Big memory':[
      ['4 Islands tour','ISLANDS','Phra Nang, Chicken Island, the Tup Island sandbar and Poda.'],
      ['Hong Islands','LAGOON','Hidden lagoon ringed by cliffs — usually quieter than Phi Phi.'],
      ['Railay rock-climbing intro','CLIMB','Half-day beginner climb on world-famous limestone.']
    ]
  },
  acts:[
    ['Railay West + Phra Nang Cave Beach','LOW PAID','mixed','Beach / cliffs','Morning'],
    ['4 Islands tour','PAID','paid','Island hopping','Full / half day'],
    ['Hong Islands tour','PAID','paid','Lagoon / islands','Full day'],
    ['Tiger Cave Temple (1,260 steps)','FREE','free','Temple / climb','Sunrise'],
    ['Emerald Pool + Blue Pool','PAID','paid','Nature / swim','Morning'],
    ['Klong Thom Hot Springs','PAID','paid','Hot springs','Same day as Emerald Pool'],
    ['Railay rock-climbing course','PAID','paid','Climbing','Half day'],
    ['Ao Thalane mangrove kayaking','PAID','paid','Kayak','Half day'],
    ['Railay Viewpoint + Lagoon','FREE','free','Scramble','Dry morning'],
    ['Ao Nang sunset','FREE','free','Beach / sunset','Sunset'],
    ['Ao Nang Night Market','FREE ENTRY','free','Street food','Evening'],
    ['Krabi Town Walking Street','FREE ENTRY','free','Weekend market','Fri–Sun evening'],
    ['Phi Phi day trip from Ao Nang','PAID','paid','Islands','Full day'],
    ['Thai massage','PAID','paid','Recovery','Evening']
  ],
  clusters:[
    'Ao Nang longtail → Railay West → Phra Nang Cave Beach → Railay sunset',
    'Tiger Cave Temple at sunrise → Emerald Pool → Klong Thom Hot Springs',
    '4 Islands or Hong Islands = full boat day'
  ],
  picks:[
    ['Railay + Phra Nang Cave Beach','Beach','Nature/Adventure/Relax','outdoor','LONGTAIL BOAT','Go early for calm water and empty sand.'],
    ['Island-hopping day','Adventure','Adventure/Nature','outdoor','TOUR PICKUP','Pick 4 Islands or Hong Islands — not both.'],
    ['Tiger Cave Temple sunrise','Culture','Culture/Adventure','outdoor','GRAB','Cool air and the best light.'],
    ['Emerald Pool + hot springs','Nature','Nature/Relax','outdoor','TOUR / DRIVER','Swim before the tour buses arrive.'],
    ['Ao Nang Night Market','Food','Food/Shopping/Social','mixed','WALK','Easy dinner every night.']
  ],
  night:[
    ['Ao Nang beach road','After sunset','Sunset, seafood and low-key bars on one strip.','WALK'],
    ['Krabi Town Walking Street','Fri–Sun, 6 PM+','Local food and live music in the town centre.','SONGTHAEW / GRAB']
  ]
});

add({
  name:'Koh Phi Phi', country:'TH', region:'Andaman coast', emoji:'🏝️', accent:'#0284c7',
  coords:[7.7407,98.7784],
  tagline:'Iconic turquoise bays, Maya Bay and beach-party nights',
  famous:['Maya Bay','Phi Phi Viewpoint','Boat tours + snorkelling','Beach fire shows','Long Beach'],
  nov:['good','The season is getting going and seas usually settle. Maya Bay is open (it closes each year around August–September); swimming there isn’t allowed.'],
  base:'Tonsai Village',
  why:'Postcard Thailand: a viewpoint hike, a Phi Phi Leh boat tour, then fire shows on the beach.',
  next:'Viewpoint at sunrise or sunset, a longtail tour to Pileh Lagoon and Maya Bay, one beach-party night.',
  avoid:'Light sleepers: don’t stay near Loh Dalum party beach.',
  alts:['Loh Dalum — party beach, loud till late','Long Beach — quieter, longtail or walk to the village','Laem Tong — resort end, very quiet'],
  sigs:['Phi Phi Viewpoint','Maya Bay + Pileh Lagoon','Loh Dalum fire shows','Long Beach snorkel'],
  own:['Phi Phi Leh boat tour (early morning is calmest and least crowded)'],
  getThere:'Ferry from Phuket (Rassada Pier) or Krabi/Ao Nang, about 1.5–2 hours. A small island fee is collected at the pier.',
  tips:['No cars or Grab — you walk or take longtails, so pack light.',
        'Rooms are pricier than the mainland for what you get; book early in high season.',
        'Choose an early Maya Bay tour to dodge the crowds.'],
  airport:'No airport — ferry from Phuket or Krabi',
  advice:'Everything is on foot or by longtail; boats leave from Tonsai pier and the beach.',
  intercity:[TWELVEGO],
  stays:[
    ['Tonsai Village','tonsai|ton sai|village','Best all-round','Walk to the pier, food, viewpoint and nightlife.'],
    ['Loh Dalum','loh dalum|lo dalum','Party beach','Steps from the fire shows — and the noise.'],
    ['Long Beach','long beach|hat yao','Quiet beach','Snorkel off the beach; longtail into the village.']
  ],
  recs:{
    'Food':[
      ['Tonsai village Thai kitchens','LOCAL','Simple Thai food and roti carts in the village lanes.'],
      ['Beach seafood BBQ','BBQ','Evening grills along the beachfront.'],
      ['Late-night roti carts','STREET','Banana-Nutella roti after the fire show.']
    ],
    'Social / night':[
      ['Loh Dalum fire shows','NIGHT','Fire dancing and beach dance floors every night.'],
      ['Viewpoint sunset','SUNSET','A roughly 30-minute climb for the double-bay view.']
    ],
    'Hidden / small':[
      ['Long Beach snorkel','SNORKEL','Reef just offshore; blacktip reef sharks sometimes cruise past early in the morning.'],
      ['Monkey Beach','BEACH','Cute stop on boat tours — don’t feed the monkeys and guard your bag.']
    ],
    'Big memory':[
      ['Phi Phi Leh tour','ICONIC','Pileh Lagoon swim plus Maya Bay viewed from the boardwalk.'],
      ['Bamboo Island','BEACH','Powder-sand day trip north of Phi Phi Don.']
    ]
  },
  acts:[
    ['Phi Phi Viewpoint hike','LOW PAID','mixed','View / hike','Sunrise or sunset'],
    ['Phi Phi Leh longtail tour','PAID','paid','Lagoon / Maya Bay','Early morning'],
    ['Maya Bay (national park fee)','PAID','paid','Iconic bay','Early morning'],
    ['Bamboo Island trip','PAID','paid','Beach / snorkel','Half day'],
    ['Long Beach snorkel','FREE','free','Snorkel','Morning'],
    ['Loh Dalum Beach','FREE','free','Swim / party beach','Afternoon → night'],
    ['Fire shows','FREE TO WATCH','free','Nightlife','After 9 PM'],
    ['Sunset boat + plankton swim','PAID','paid','Boat / night swim','Evening'],
    ['Thai massage','PAID','paid','Recovery','Afternoon']
  ],
  clusters:[
    'Viewpoint hike → Loh Dalum swim → village dinner → fire show',
    'Longtail: Pileh Lagoon → Viking Cave → Maya Bay → Monkey Beach'
  ],
  picks:[
    ['Phi Phi Viewpoint','View','Nature/Adventure','outdoor','WALK','Sunrise is cooler and quieter.'],
    ['Phi Phi Leh boat tour','Adventure','Adventure/Nature','outdoor','LONGTAIL BOAT','Book the earliest slot.'],
    ['Loh Dalum fire-show night','Night','Nightlife/Social','outdoor','WALK','Stick together, watch your drinks.'],
    ['Long Beach snorkel','Nature','Nature/Relax','outdoor','LONGTAIL / WALK','Calm, easy snorkelling from the beach.']
  ],
  night:[
    ['Loh Dalum Beach','After 9 PM','Fire shows and beach bars — the island’s nightlife.','WALK']
  ]
});

add({
  name:'Koh Samui', country:'TH', region:'Gulf of Thailand', emoji:'🥥', accent:'#7c3aed',
  coords:[9.5120,100.0136],
  tagline:'Palm-fringed Gulf island of resorts, Fisherman’s Village and spa days',
  famous:['Fisherman’s Village (Bophut)','Big Buddha','Chaweng nightlife','Ang Thong Marine Park','Na Muang waterfalls','Resorts + spas'],
  nov:['wet','November is Samui’s wettest month: heavy rain spells and rough seas, and Ang Thong trips are often cancelled. Better saved for January–August.'],
  base:'Bophut / Fisherman’s Village',
  why:'Comfortable island resort life — but your dates hit its rainiest month.',
  next:'If you still go: Fisherman’s Village Friday walking street, Big Buddha and a spa day.',
  avoid:'Don’t plan boat days you can’t move — Gulf seas get rough in November.',
  alts:['Chaweng — busiest beach and nightlife','Lamai — mid-energy, local feel','Maenam — quiet, budget, long beach'],
  sigs:['Fisherman’s Village','Big Buddha','Lad Koh viewpoint','Na Muang waterfall','Spa day'],
  own:['Ang Thong Marine Park — only if trips are running and the sea is calm'],
  getThere:'Fly into Samui (USM) — fares are high — or fly to Surat Thani and take a bus + ferry combo (about 4–5 hours).',
  tips:['November is rainy season here: keep plans flexible.',
        'Taxis are expensive; Grab/Bolt work but drivers can be scarce.',
        'Samui → Koh Phangan → Koh Tao connect easily by ferry.'],
  airport:'Samui International Airport (USM)',
  advice:'Grab/Bolt or scooter; songthaews run around the ring road.',
  intercity:[TWELVEGO,LOMPRAYAH],
  stays:[
    ['Bophut / Fisherman’s Village','bophut|fisherman','Best all-round','Pretty beachfront village with good food and the Friday walking street.'],
    ['Chaweng','chaweng','Nightlife','Busiest beach with bars, clubs and malls.'],
    ['Lamai','lamai','Middle ground','Good beach, more local feel.'],
    ['Maenam','maenam','Quiet + budget','Long calm beach, cheaper stays.']
  ],
  recs:{
    'Food':[
      ['Fisherman’s Village walking street','FRI NIGHT','Street food and crafts along the old wooden shophouses.'],
      ['Lamai night market','LOCAL MARKET','Local food with fewer tourists.'],
      ['Southern Thai seafood','LOCAL','Grilled squid, crab curry and khanom jeen at local spots off the ring road.']
    ],
    'Massage':[
      ['Resort or day spa','RAINY-DAY WIN','Samui’s spas are the best way to use a stormy afternoon.']
    ],
    'Social / night':[
      ['Chaweng Beach Road','NIGHT','Clubs, bars and cabaret.'],
      ['Fisherman’s Village Friday night','SOCIAL','The island’s busiest market night.']
    ],
    'Hidden / small':[
      ['Lad Koh viewpoint','VIEW','Quick roadside view between Chaweng and Lamai.'],
      ['Secret Buddha Garden','HIDDEN','Jungle sculpture garden high in the hills (steep 4x4 road).'],
      ['Hin Ta Hin Yai rocks','QUIRKY','Famous cheeky rock formations at Lamai.']
    ],
    'Big memory':[
      ['Ang Thong Marine Park','ISLANDS','42-island park with a viewpoint hike — often cancelled in November and early December.'],
      ['Na Muang waterfalls','WATERFALL','Two tiers, with more flow in the rainy season.']
    ]
  },
  acts:[
    ['Big Buddha (Wat Phra Yai)','FREE','free','Temple / view','Morning'],
    ['Wat Plai Laem','FREE','free','Temple','Morning'],
    ['Fisherman’s Village walking street','FREE ENTRY','free','Night market','Friday evening'],
    ['Lad Koh viewpoint','FREE','free','View','Anytime'],
    ['Hin Ta Hin Yai rocks','FREE','free','Quirky sight','Afternoon'],
    ['Na Muang waterfalls','FREE','free','Waterfall','Morning'],
    ['Secret Buddha Garden','PAID','paid','Hidden garden','Dry day'],
    ['Ang Thong Marine Park tour','PAID','paid','Islands','Calm-sea days only'],
    ['Spa day','PAID','paid','Relax','Rainy afternoon'],
    ['Chaweng nightlife','PAID','paid','Nightlife','After 10 PM']
  ],
  clusters:[
    'Big Buddha → Wat Plai Laem → Fisherman’s Village',
    'Lad Koh viewpoint → Lamai → Hin Ta Hin Yai → Na Muang falls'
  ],
  picks:[
    ['Fisherman’s Village','Food','Food/Shopping/Social','mixed','GRAB','Friday night is the big one.'],
    ['Big Buddha + Wat Plai Laem','Culture','Culture','outdoor','GRAB','Quick, easy temple pair.'],
    ['Spa afternoon','Relax','Relax','indoor','GRAB','November’s best rainy-day plan.'],
    ['Na Muang waterfalls','Nature','Nature/Adventure','outdoor','GRAB','Go between showers; rocks get slippery.']
  ],
  night:[
    ['Fisherman’s Village walking street','Fri, 5 PM+','Best night of the week on Samui.','GRAB'],
    ['Chaweng Beach Road','After 10 PM','Clubs and bars cluster here.','GRAB']
  ]
});

add({
  name:'Koh Phangan', country:'TH', region:'Gulf of Thailand', emoji:'🌕', accent:'#a21caf',
  coords:[9.7100,100.0130],
  tagline:'Full Moon Party island — plus quiet jungle beaches on the other side',
  famous:['Full Moon Party (Haad Rin)','Half Moon + jungle parties','Bottle Beach','Thong Nai Pan','Yoga + wellness retreats'],
  nov:['wet','Gulf rainy season. The Full Moon Party lands on 24 Nov 2026 (same night as Loy Krathong) — dates occasionally shift, so confirm before booking.'],
  base:'Haad Rin (for the party) or Thong Sala (practical)',
  why:'Come for the Full Moon Party, or for slow jungle-beach days on the quiet north coast.',
  next:'For the party: stay in Haad Rin 1–2 nights around 24 Nov. Otherwise skip it in November.',
  avoid:'Don’t ride a scooter after drinking — Phangan’s steep hill roads cause a lot of accidents.',
  alts:['Thong Sala — ferry pier and night market','Srithanu — yoga/wellness west coast','Thong Nai Pan — gorgeous, remote north-east bays'],
  sigs:['Full Moon Party','Bottle Beach','Thong Sala night market','Than Sadet waterfall'],
  own:['Full Moon night — and the next day to recover'],
  getThere:'Ferry from Koh Samui (about 30–60 minutes) or Koh Tao; combo tickets run from Bangkok via Surat Thani or Chumphon.',
  tips:['Full Moon: closed shoes, minimal cash and phone, stick together, open your own drinks.',
        'Haad Rin rooms sell out and get pricier around Full Moon — book early.',
        'Taxis are shared pickup trucks — agree the price before you go.'],
  airport:'No airport — ferry from Koh Samui',
  advice:'Songthaew taxis or a scooter (only if you’re experienced — the roads are steep).',
  intercity:[TWELVEGO,LOMPRAYAH],
  stays:[
    ['Haad Rin','haad rin|hat rin','Party central','Walk to the Full Moon beach — and expect noise.'],
    ['Thong Sala','thong sala','Practical','Ferry pier, night market, middle of the island.'],
    ['Srithanu','srithanu|zen beach','Yoga + calm','West-coast wellness scene and sunsets.'],
    ['Thong Nai Pan','thong nai pan','Remote beauty','Two gorgeous bays at the end of a bumpy road.']
  ],
  recs:{
    'Food':[
      ['Thong Sala night market','NIGHT MARKET','Cheap street food every night by the pier.']
    ],
    'Social / night':[
      ['Full Moon Party','24 NOV 2026','Haad Rin beach, sound systems and neon paint until sunrise.'],
      ['Half Moon / jungle parties','JUNGLE','Smaller ticketed parties in the jungle on other dates.']
    ],
    'Hidden / small':[
      ['Bottle Beach','BEACH','Remote north bay reached by longtail or a jungle hike.'],
      ['Than Sadet waterfall','WATERFALL','Royal-visited waterfall — better after rain.']
    ],
    'Big memory':[
      ['Full Moon Party','PARTY','The famous one — go once, go safely.']
    ]
  },
  acts:[
    ['Full Moon Party (Haad Rin)','PAID','paid','Beach party','24 Nov 2026 night'],
    ['Half Moon / jungle party','PAID','paid','Party','Other dates'],
    ['Thong Sala night market','FREE ENTRY','free','Street food','Evening'],
    ['Bottle Beach','PAID','paid','Remote beach','Calm day'],
    ['Than Sadet waterfall','FREE','free','Waterfall','Daytime'],
    ['Srithanu sunset','FREE','free','Sunset','Sunset'],
    ['Yoga class','PAID','paid','Wellness','Morning']
  ],
  clusters:[
    'Haad Rin: sunset → dinner → Full Moon beach',
    'Thong Sala market → Srithanu sunset'
  ],
  picks:[
    ['Full Moon Party','Night','Nightlife/Social','outdoor','TAXI / WALK','24 Nov 2026 — go as a pair.'],
    ['Thong Sala night market','Food','Food/Social','mixed','TAXI','Food first, party later.'],
    ['Bottle Beach','Beach','Nature/Relax','outdoor','LONGTAIL BOAT','Only on a calm-sea day.']
  ],
  night:[
    ['Full Moon Party, Haad Rin','24 Nov 2026, from about 10 PM','Once-in-a-trip party — go together and keep valuables minimal.','TAXI / WALK'],
    ['Thong Sala night market','From 5 PM','Eat here before the party.','TAXI']
  ]
});

add({
  name:'Koh Tao', country:'TH', region:'Gulf of Thailand', emoji:'🤿', accent:'#0369a1',
  coords:[10.0956,99.8404],
  tagline:'Budget scuba-certification island with viewpoints and snorkel bays',
  famous:['Scuba certification','Koh Nang Yuan viewpoint','Shark Bay snorkelling','Sairee Beach sunsets'],
  nov:['wet','Rainiest month with the lowest dive visibility, and ferries cancel in storms. In November, Phuket or Krabi is the better place to dive.'],
  base:'Sairee Beach',
  why:'Learn to dive affordably on a small, social island.',
  next:'In November, dive from Phuket instead; save Koh Tao for roughly March–September.',
  avoid:'Don’t book a tight onward flight right after Koh Tao in November — weather delays ferries.',
  alts:['Mae Haad — ferry pier town','Chalok Baan Kao — quieter south with dive schools'],
  sigs:['Open Water course','Koh Nang Yuan','John-Suwan viewpoint','Sairee sunset'],
  own:['3–4 days if you’re doing an Open Water course'],
  getThere:'Catamaran from Chumphon (bus/train combo from Bangkok) or ferry from Koh Phangan / Koh Samui.',
  tips:['Dive schools are everywhere — pick one with small groups and good safety reviews.',
        'Koh Nang Yuan charges a landing fee and bans plastic bottles.',
        'Steep dirt roads: hire a taxi rather than a scooter if you’re new.'],
  airport:'No airport — ferry from Chumphon, Samui or Phangan',
  advice:'Walk around Sairee; taxi pickups or longtails for the bays.',
  intercity:[TWELVEGO,LOMPRAYAH],
  stays:[
    ['Sairee','sairee','Best all-round','Long beach, dive schools, bars and sunsets.'],
    ['Mae Haad','mae haad|mae hat','Pier town','Handy for ferries.'],
    ['Chalok Baan Kao','chalok','Quieter south','Calm bay with good snorkelling nearby.']
  ],
  recs:{
    'Social / night':[['Sairee Beach sunset + fire shows','NIGHT','The island’s social hub.']],
    'Big memory':[
      ['Open Water dive course','DIVE','One of the cheapest places in the world to get certified.'],
      ['Koh Nang Yuan','VIEWPOINT','Three islets joined by a sandbar — climb the viewpoint.']
    ]
  },
  acts:[
    ['Open Water dive course','PAID','paid','Scuba','3–4 days'],
    ['Koh Nang Yuan','PAID','paid','Viewpoint / snorkel','Morning'],
    ['John-Suwan viewpoint','LOW PAID','mixed','View','Sunrise / sunset'],
    ['Shark Bay snorkel','FREE','free','Snorkel','Calm morning'],
    ['Freedom Beach','LOW PAID','mixed','Beach','Afternoon'],
    ['Sairee Beach sunset','FREE','free','Sunset / social','Sunset']
  ],
  clusters:['Koh Nang Yuan (morning) → Sairee sunset','John-Suwan viewpoint → Freedom Beach → Chalok dinner'],
  picks:[
    ['Koh Nang Yuan viewpoint','View','Nature/Adventure','outdoor','LONGTAIL BOAT','Early, before day-trip boats arrive.'],
    ['Sairee sunset','Relax','Relax/Social','outdoor','WALK','The island gathers here every evening.'],
    ['Try-dive / Discover Scuba','Adventure','Adventure','outdoor','DIVE SCHOOL','Only on decent-visibility days.']
  ],
  night:[['Sairee Beach','After sunset','Fire shows and beach bars.','WALK']]
});

add({
  name:'Pattaya', country:'TH', region:'East coast (2 h from Bangkok)', emoji:'🎡', accent:'#db2777',
  coords:[12.9236,100.8825],
  tagline:'Big beach city near Bangkok: island day trips, shows, water parks and nightlife',
  famous:['Sanctuary of Truth','Koh Larn (Coral Island)','Walking Street','Cabaret shows','Water parks','Nong Nooch Garden'],
  nov:['great','Dry season is starting: sunny, with calmer seas for Koh Larn.'],
  base:'Pratumnak / Jomtien',
  why:'An easy 2-hour escape from Bangkok for an island day, a water park and a big night out.',
  next:'Koh Larn ferry day, Sanctuary of Truth, and one evening for a cabaret show or Walking Street.',
  avoid:'Central Pattaya’s beach isn’t the swim beach — go to Koh Larn or Jomtien for that.',
  alts:['Central Pattaya — nightlife and malls','Naklua / Wongamat — quieter north, near Sanctuary of Truth','Jomtien — longer, calmer beach'],
  sigs:['Koh Larn day','Sanctuary of Truth','Cabaret show','Pattaya Viewpoint','Thepprasit Night Market'],
  own:['Koh Larn day trip','Nong Nooch Garden or a water-park day'],
  getThere:'Bus from Bangkok’s Ekkamai or Mo Chit terminals (about 2–2.5 hours), direct buses from Suvarnabhumi, or a Grab.',
  tips:['Baht buses (blue songthaews) loop Beach Road and Second Road for a small flat fare — just hop on.',
        'Jet-ski “damage” scams are common — skip jet skis or photograph the ski first.',
        'Plenty of halal Middle Eastern and Indian restaurants around Beach Road.'],
  airport:'Nearest: Suvarnabhumi (BKK) or U-Tapao (UTP)',
  advice:'Baht buses on Beach and Second Road; Bolt/Grab elsewhere; ferries to Koh Larn from Bali Hai Pier.',
  intercity:[TWELVEGO,BOT_TH],
  stays:[
    ['Pratumnak / Jomtien','pratumnak|jomtien','Best all-round','Calmer than central, 5–10 minutes from the action, better beach.'],
    ['Central Pattaya','central|beach road|second road|walking street|terminal 21','Nightlife + malls','Walk to everything — and hear it all night.'],
    ['Naklua / Wongamat','naklua|wongamat','Quiet north','Near Sanctuary of Truth, nicer beach, resort feel.']
  ],
  recs:{
    'Food':[
      ['Lan Pho Naklua seafood market','SEAFOOD','Buy fresh seafood and have it cooked next door.'],
      ['Thepprasit Night Market','WEEKEND MARKET','Big Friday–Sunday local night market with street food.'],
      ['Jomtien night market','NIGHT MARKET','Beachside food stalls in the evening.']
    ],
    'Social / night':[
      ['Walking Street','NIGHT','Neon, clubs and bars — a spectacle even if you only walk it.'],
      ['Cabaret show','SHOW','Glitzy ladyboy cabaret (Tiffany’s or Alcazar) — a Pattaya classic.']
    ],
    'Hidden / small':[
      ['Pattaya Viewpoint (Pratumnak Hill)','VIEW','Free view over the bay — best at sunset.'],
      ['Wat Yansangwararam','TEMPLE','Large, peaceful temple complex south of the city.']
    ],
    'Big memory':[
      ['Koh Larn (Coral Island)','ISLAND','Cheap public ferry to clear-water beaches like Tien and Samae.'],
      ['Sanctuary of Truth','ICON','Giant hand-carved wooden temple by the sea.'],
      ['Water-park day','FUN DAY','Columbia Pictures Aquaverse or Cartoon Network Amazone — pick one.']
    ]
  },
  acts:[
    ['Koh Larn by public ferry','LOW PAID','mixed','Island / beach','Full day'],
    ['Sanctuary of Truth','PAID','paid','Wooden temple','Morning'],
    ['Pattaya Viewpoint','FREE','free','View','Sunset'],
    ['Nong Nooch Tropical Garden','PAID','paid','Gardens / shows','Half day'],
    ['Cabaret show','PAID','paid','Show','Evening'],
    ['Walking Street','FREE TO WALK','free','Nightlife','After 10 PM'],
    ['Thepprasit Night Market','FREE ENTRY','free','Night market','Fri–Sun evening'],
    ['Jomtien Beach','FREE','free','Beach','Afternoon'],
    ['Columbia Pictures Aquaverse','PAID','paid','Water park','Dedicated day'],
    ['Cartoon Network Amazone','PAID','paid','Water park','Dedicated day'],
    ['Wat Yansangwararam','FREE','free','Temple','Morning'],
    ['Terminal 21 Pattaya','FREE ENTRY','free','Mall','Rain backup']
  ],
  clusters:[
    'Bali Hai Pier ferry → Koh Larn (Samae / Tien beach) → back for Pattaya Viewpoint sunset',
    'Sanctuary of Truth → Naklua seafood lunch → Terminal 21',
    'Cabaret show → Walking Street'
  ],
  picks:[
    ['Koh Larn island day','Beach','Nature/Relax/Adventure','outdoor','FERRY FROM BALI HAI','Take an early ferry for the quietest beaches.'],
    ['Sanctuary of Truth','Culture','Culture','mixed','GRAB','Detailed carvings — give it 1–2 hours.'],
    ['Pattaya Viewpoint sunset','View','Relax/Nature','outdoor','GRAB','Free and pretty.'],
    ['Cabaret show','Night','Nightlife/Social','indoor','GRAB','Fun night out that isn’t clubbing.'],
    ['Thepprasit Night Market','Food','Food/Shopping','mixed','GRAB','Friday–Sunday only.']
  ],
  night:[
    ['Walking Street','After 10 PM','Pattaya’s nightlife strip — go as a pair and watch drink prices.','BAHT BUS / GRAB'],
    ['Cabaret show','Evening shows','The glitzy Pattaya night that isn’t clubbing.','GRAB']
  ]
});

add({
  name:'Chiang Rai', country:'TH', region:'Far north', emoji:'🤍', accent:'#64748b',
  coords:[19.9105,99.8406],
  tagline:'Art temples (White, Blue, Black), tea hills and the Golden Triangle',
  famous:['White Temple','Blue Temple','Black House (Baan Dam)','Golden Triangle','Doi Mae Salong tea hills','Clock Tower light show'],
  nov:['great','Cool, dry and clear — ideal. Nights get chilly up in the hills.'],
  base:'Clock Tower / Night Bazaar area',
  why:'Thailand’s most creative temples and misty tea mountains — an easy add-on from Chiang Mai.',
  next:'White Temple early, then the Blue Temple and Black House; add a Golden Triangle or tea-hills day.',
  avoid:'Don’t squeeze Chiang Rai into a rushed day trip from Chiang Mai — it’s about 3 hours each way. Stay at least one night.',
  alts:['Near the bus terminal — budget and practical','Kok River — riverside resorts'],
  sigs:['White Temple','Blue Temple','Black House','Clock Tower show','Night Bazaar'],
  own:['Golden Triangle + Mae Sai day','Doi Mae Salong tea hills'],
  getThere:'Green Bus from Chiang Mai (about 3–3.5 hours) or fly direct from Bangkok to CEI.',
  tips:['The White Temple charges foreigners an entry fee and expects modest dress — go at opening time.',
        'The Clock Tower has a short light-and-sound show in the evenings.',
        'Saturday and Sunday walking streets are the best food nights.'],
  airport:'Mae Fah Luang–Chiang Rai International Airport (CEI)',
  advice:'Grab/Bolt are cheap; hire a driver or join a tour for the Golden Triangle and Doi Mae Salong.',
  intercity:[['Green Bus','https://www.greenbusthailand.com/'],TWELVEGO],
  stays:[
    ['Clock Tower / Night Bazaar','clock tower|night bazaar|jet yod|phahonyothin','Best all-round','Walk to food, the night bazaar and the bus station.'],
    ['Kok River','kok river|riverside','Resort calm','Riverside resorts and sunsets; Grab into town.']
  ],
  recs:{
    'Food':[
      ['Khao Soi Vijittra','KHAO SOI','Local favourite for northern curry noodles and khanom jeen nam ngiao.','','https://blog.takemetour.com/?p=12178'],
      ['Salungkham','NORTHERN THAI','Homemade sai ua (pork sausage) and a big northern menu.','pork','https://blog.takemetour.com/?p=12178'],
      ['Night Bazaar food court','HOT POT','Jim jum clay-pot hot pot with a stage show.'],
      ['Saturday Walking Street','WEEKEND MARKET','Street food and crafts on Thanalai Road, Saturday evenings.']
    ],
    'Cafés':[
      ['Choui Fong tea plantation','TEA HILLS','Tea-terrace café on the way to Mae Sai.'],
      ['Doi Chaang coffee','COFFEE','Northern Thai coffee grown in the Chiang Rai hills.']
    ],
    'Social / night':[
      ['Clock Tower light show','EVENING','Short gold-and-colour show at the tower.'],
      ['Night Bazaar stage','NIGHT','Live music and hot pot in the food court.']
    ],
    'Hidden / small':[
      ['Wat Huay Pla Kang','GIANT GUANYIN','Huge white Guanyin statue you can go up inside.'],
      ['Singha Park','PARK','Tea fields, lake and a zipline; flowers bloom in the cool season.']
    ],
    'Big memory':[
      ['White Temple (Wat Rong Khun)','ICON','Dazzling white artwork-temple — go at opening.'],
      ['Golden Triangle','BORDER VIEW','Where Thailand, Laos and Myanmar meet; the Hall of Opium museum is excellent.'],
      ['Doi Mae Salong','TEA VILLAGE','Yunnanese tea village in the clouds.']
    ]
  },
  acts:[
    ['White Temple (Wat Rong Khun)','PAID','paid','Art temple','At opening'],
    ['Blue Temple (Wat Rong Suea Ten)','FREE','free','Temple','Morning'],
    ['Black House (Baan Dam)','PAID','paid','Art museum','Late morning'],
    ['Wat Huay Pla Kang','FREE','free','Giant Guanyin','Afternoon'],
    ['Clock Tower light show','FREE','free','Light show','Evening'],
    ['Night Bazaar','FREE ENTRY','free','Night market / food','Evening'],
    ['Saturday Walking Street','FREE ENTRY','free','Weekend market','Saturday evening'],
    ['Singha Park','LOW PAID','mixed','Park / tea fields','Afternoon'],
    ['Golden Triangle + Hall of Opium','PAID','paid','Border view / museum','Day trip'],
    ['Doi Mae Salong','LOW PAID','mixed','Tea village','Day trip'],
    ['Choui Fong tea plantation','LOW PAID','mixed','Tea terraces','Morning'],
    ['Khun Korn waterfall','FREE','free','Waterfall hike','Half day']
  ],
  clusters:[
    'White Temple at opening → Singha Park → Black House',
    'Blue Temple → Wat Huay Pla Kang → Clock Tower show',
    'Golden Triangle → Mae Sai → Choui Fong tea'
  ],
  picks:[
    ['White Temple','Culture','Culture','outdoor','GRAB','At opening — before the tour buses.'],
    ['Blue Temple','Culture','Culture','mixed','GRAB','Free and beautiful inside.'],
    ['Black House','Culture','Culture','mixed','GRAB','Dark, strange, memorable.'],
    ['Night Bazaar hot pot','Food','Food/Nightlife/Shopping','mixed','WALK','Easy, cheap dinner with a show.'],
    ['Doi Mae Salong tea hills','Day trip','Nature/Cafe','outdoor','DRIVER / TOUR','Mist and tea on a clear day.']
  ],
  night:[
    ['Night Bazaar food court','After 6 PM','Hot pot and live music under the lights.','WALK'],
    ['Saturday Walking Street','Sat, 5 PM+','The best food night in town.','WALK']
  ]
});

add({
  name:'Pai', country:'TH', region:'Mae Hong Son mountains', emoji:'🌄', accent:'#ca8a04',
  coords:[19.3594,98.4413],
  tagline:'Mountain valley town: canyon sunsets, waterfalls, hot springs and a nightly walking street',
  famous:['Pai Canyon sunset','Walking Street night market','Yun Lai sunrise','Waterfalls + hot springs','Bamboo Bridge','The 762-curve road'],
  nov:['great','Cool season: foggy, chilly mornings (bring a jacket) and sunny days. Sea-of-fog sunrises at Yun Lai.'],
  base:'Pai town / Walking Street',
  why:'A slow, social mountain town — easy to meet people, very cheap and gorgeous in November.',
  next:'Yun Lai sunrise, Bamboo Bridge and a waterfall, Pai Canyon at sunset, Walking Street dinner.',
  avoid:'If you’ve never ridden a scooter, don’t learn here — hire a driver or join a day tour.',
  alts:['Rice-field bungalows just outside town — views + calm','Across the river — quieter guesthouses'],
  sigs:['Pai Canyon sunset','Walking Street','Yun Lai sunrise','Bamboo Bridge','Tha Pai hot springs'],
  own:['Tham Lod Cave + Ban Jabo (about 35 km away) — half or full day'],
  getThere:'Minivan from Chiang Mai’s Arcade bus station (about 3 hours, 762 curves) — take motion-sickness tablets.',
  tips:['Yun Lai viewpoint has a small entry fee — go for sunrise with a jacket.',
        'Bamboo Bridge charges a small fee in the day and is free after 5 PM.',
        'Tha Pai hot springs charge foreigners ฿300 — go early or late, bring cash.'],
  airport:'Tiny airstrip — most people arrive by minivan from Chiang Mai',
  advice:'Walk in town; scooters, local drivers or tours for everything outside.',
  intercity:[TWELVEGO],
  stays:[
    ['Pai town','walking street|town|chaisongkhram|rangsiyanon','Best all-round','Walk to the market, bars and cafés.'],
    ['Rice-field bungalows','bungalow|rice field|resort|mae hee','Views + calm','Gorgeous mornings; you’ll need transport after dark.']
  ],
  recs:{
    'Food':[
      ['Walking Street stalls','NIGHT MARKET','Khao soi, roti, pad thai and mango sticky rice every night.','','https://themanduls.com/things-to-do-in-pai/'],
      ['Om Garden Café','BREAKFAST','Leafy garden café for a slow breakfast.','','https://themanduls.com/things-to-do-in-pai/'],
      ['Ban Jabo noodle soup','VIEW MEAL','Mountain-edge noodle soup with valley views on the Tham Lod road.']
    ],
    'Cafés':[
      ['Malamong Art Café','COFFEE','Relaxed, arty café.','','https://themanduls.com/things-to-do-in-pai/'],
      ['Reung-Rao Coffee & Bread','QUIET CAFÉ','Calm spot for coffee and bread.','','https://themanduls.com/things-to-do-in-pai/']
    ],
    'Massage':[
      ['Phakamong Thai Massage','MASSAGE','Classic Thai massage praised for quality and value.','','https://themanduls.com/things-to-do-in-pai/']
    ],
    'Social / night':[
      ['Almost Famous / Blah Blah Bar','NIGHT','Cocktails and live music — small, friendly, social.','','https://themanduls.com/things-to-do-in-pai/'],
      ['Pai Canyon sunset crowd','SUNSET','Everyone gathers here — easy place to meet people.']
    ],
    'Hidden / small':[
      ['White Buddha (Wat Phra That Mae Yen)','VIEW','About 350 steps for a valley sunset; cover shoulders and knees.'],
      ['Santichon Chinese village','VILLAGE','Yunnanese village with tea and mountain views.']
    ],
    'Big memory':[
      ['Yun Lai sunrise','SEA OF FOG','Cool-season mornings can fill the valley with mist.'],
      ['Tham Lod Cave','CAVE','Guided lantern tour with a bamboo raft section.'],
      ['Pai Canyon sunset','SUNSET','Narrow, dusty ridges with no railings — careful near the edges.']
    ]
  },
  acts:[
    ['Pai Canyon','FREE','free','Canyon / sunset','Sunset'],
    ['Walking Street','FREE ENTRY','free','Night market','5–10:30 PM'],
    ['Yun Lai viewpoint','LOW PAID','mixed','Sunrise view','Sunrise'],
    ['Bamboo Bridge (Boon Ko Ku So)','LOW PAID','mixed','Rice-field bridge','Free after 5 PM'],
    ['Tha Pai hot springs','PAID','paid','Hot springs','Early or late'],
    ['Mor Paeng waterfall','LOW PAID','mixed','Waterfall swim','Midday'],
    ['White Buddha (Wat Phra That Mae Yen)','FREE','free','Temple / view','Sunset'],
    ['Santichon Chinese village','FREE','free','Village / tea','Morning'],
    ['Tham Lod Cave','PAID','paid','Cave tour','Half / full day'],
    ['Ban Jabo village','LOW PAID','mixed','Mountain village','With Tham Lod'],
    ['Thai massage','PAID','paid','Recovery','Evening']
  ],
  clusters:[
    'Yun Lai sunrise → Santichon village breakfast → Mor Paeng waterfall',
    'Bamboo Bridge → hot springs → Pai Canyon sunset → Walking Street',
    'Tham Lod Cave + Ban Jabo = half or full day'
  ],
  picks:[
    ['Yun Lai sunrise','View','Nature/Relax','outdoor','DRIVER / SCOOTER','Jacket — it’s cold before sunrise.'],
    ['Pai Canyon sunset','Nature','Nature/Adventure/Social','outdoor','DRIVER / SCOOTER','Arrive 30 minutes before sunset.'],
    ['Walking Street dinner','Food','Food/Shopping/Social','mixed','WALK','Every night, best after 6 PM.'],
    ['Tha Pai hot springs','Relax','Relax/Nature','outdoor','DRIVER','Morning or late afternoon.'],
    ['Bamboo Bridge','Nature','Nature/Culture','outdoor','DRIVER / SCOOTER','Free after 5 PM.']
  ],
  night:[
    ['Walking Street','5–10:30 PM nightly','The town’s whole evening happens here.','WALK'],
    ['Live-music bars','After 9 PM','Small, friendly and sociable.','WALK']
  ]
});

add({
  name:'Kanchanaburi', country:'TH', region:'West of Bangkok', emoji:'🌉', accent:'#4d7c0f',
  coords:[14.0228,99.5328],
  tagline:'River Kwai history, the Death Railway and turquoise Erawan Falls',
  famous:['Bridge on the River Kwai','Death Railway train','Erawan seven-tier waterfall','Hellfire Pass','Raft houses'],
  nov:['great','Dry season starts while the waterfalls still have good flow from the rains.'],
  base:'River Kwai Road / riverside',
  why:'WWII history that hits hard, plus one of Thailand’s prettiest waterfalls — 2–3 hours from Bangkok.',
  next:'Erawan Falls early, the River Kwai Bridge and museum, a Death Railway ride, a night on a raft house.',
  avoid:'Erawan gets packed by late morning — be at the gate early and wear swimwear under your clothes.',
  alts:['Raft houses — sleep on the river','Town centre — practical, near the bus station'],
  sigs:['Erawan Falls','River Kwai Bridge','Death Railway ride','Hellfire Pass','War Cemetery'],
  own:['Erawan Falls day','Death Railway + Hellfire Pass day'],
  getThere:'Train from Bangkok’s Thonburi station (about 3 hours, slow and scenic) or a minivan/bus (about 2–3 hours).',
  tips:['Erawan National Park charges a foreigner entry fee; little fish nibble your feet in the pools.',
        'The scenic stretch of the Death Railway is over the Wampo viaduct.',
        'The war cemetery and Hellfire Pass are memorials — keep it respectful.'],
  airport:'No airport — from Bangkok by train or van',
  advice:'Bicycle or scooter in town; tours or the public bus to Erawan.',
  intercity:[SRT,TWELVEGO],
  stays:[
    ['River Kwai Road','river kwai|mae nam khwae|riverside','Best all-round','Guesthouses, cafés and river views near the bridge.'],
    ['Raft houses','raft|floating','On the water','Floating bungalows — magical and basic.'],
    ['Town centre','town|bus station','Practical','Near the bus station and markets.']
  ],
  recs:{
    'Food':[
      ['Riverside floating restaurants','RIVER VIEW','Thai food on the water near the bridge.'],
      ['Town night market','NIGHT MARKET','Local street food in the evening.']
    ],
    'Social / night':[
      ['River Kwai Bridge at night','EVENING','The bridge lights up; riverside bars along Mae Nam Khwae Road.']
    ],
    'Hidden / small':[
      ['Krasae Cave','CAVE','Cave shrine beside the Wampo viaduct track.'],
      ['Sai Yok Noi waterfall','WATERFALL','Roadside waterfall near the end of the railway line.']
    ],
    'Big memory':[
      ['Erawan Falls','WATERFALL','Seven turquoise tiers; swim at the middle levels.'],
      ['Death Railway train','HISTORY RIDE','Slow train hugging cliffs over the Wampo viaduct.'],
      ['Hellfire Pass Memorial','MEMORIAL','Moving walk through the hand-cut railway cutting.']
    ]
  },
  acts:[
    ['Erawan National Park (7 tiers)','PAID','paid','Waterfall swim','Early morning'],
    ['Bridge on the River Kwai','FREE','free','History / bridge','Morning or night'],
    ['Death Railway train ride','LOW PAID','mixed','Scenic train','Morning'],
    ['Hellfire Pass Memorial','FREE','free','WWII memorial','Half day'],
    ['Kanchanaburi War Cemetery','FREE','free','Memorial','Morning'],
    ['Thailand–Burma Railway Centre','PAID','paid','Museum','Rain backup'],
    ['JEATH War Museum','PAID','paid','Museum','Midday'],
    ['Krasae Cave + Wampo viaduct','FREE','free','Cave / viaduct','With the train'],
    ['Sai Yok Noi waterfall','FREE','free','Waterfall','Afternoon'],
    ['Raft-house night','PAID','paid','Stay on the river','Overnight']
  ],
  clusters:[
    'Erawan Falls (morning) → lunch → River Kwai Bridge at sunset',
    'Death Railway train → Krasae Cave → Sai Yok Noi → Hellfire Pass',
    'War Cemetery → Thailand–Burma Railway Centre → the bridge'
  ],
  picks:[
    ['Erawan Falls','Nature','Nature/Adventure','outdoor','TOUR / PUBLIC BUS','Be at the gate early.'],
    ['River Kwai Bridge','Culture','Culture','outdoor','BIKE / WALK','Walk across, then the museums.'],
    ['Death Railway ride','Adventure','Culture/Adventure','outdoor','TRAIN','Sit on the river side for views.'],
    ['Thailand–Burma Railway Centre','Museum','Culture','indoor','WALK','Do this before the cemetery.']
  ],
  night:[
    ['River Kwai Bridge + Mae Nam Khwae Road','After sunset','Lit bridge and quiet riverside bars.','WALK / BIKE']
  ]
});
})();

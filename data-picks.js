/* Review-ranked top picks + weekly markets for the route cities.
   Ranked by rating × review volume where platforms show it (Klook / GetYourGuide / Tripadvisor, checked Oct 2026),
   otherwise by what recent local guides consistently recommend. Ratings are a snapshot — the app links to live reviews. */
(function(){
const TD = window.TRIP_DATA;
const KLOOK_LGK = 'https://www.klook.com/destination/c190-langkawi/1010-cruises/';
const GYG_PHUKET = 'https://www.getyourguide.com/phuket-l32123/boat-parties-tc821/';
const BKK_SPIRIT = 'https://www.bangkok-spirit.com/guides/best-dinner-cruises-bangkok/';

/* days: 0 = Sunday … 6 = Saturday */
TD.weekly = [
  {city:'Kuala Lumpur', name:'Taman Connaught Night Market', days:[3], time:'from ~5 pm', slot:'night', where:'Cheras', why:'One of KL’s biggest pasar malam — a long street of hawker snacks.'},
  {city:'Langkawi', name:'Ulu Melaka Night Market', days:[1], time:'5–9 pm', slot:'evening', where:'Padang Gaong', why:'Langkawi’s night markets move around the island — Monday’s is here.'},
  {city:'Langkawi', name:'Kedawang Night Market', days:[2], time:'5–10 pm', slot:'evening', where:'Kampung Chedek Kura', why:'Tuesday’s night market — nearest one to the Cenang side that night.'},
  {city:'Langkawi', name:'Kuah Town Night Market', days:[3,6], time:'4–10 pm', slot:'evening', where:'Kuah', why:'Wednesday and Saturday market in Kuah town — satay, murtabak, cheap drinks.'},
  {city:'Langkawi', name:'Temonyong Night Market', days:[4], time:'6–11 pm', slot:'evening', where:'near Pantai Cenang', why:'Thursday’s market — the closest one to Pantai Cenang.'},
  {city:'Langkawi', name:'Padang Matsirat Night Market', days:[0], time:'6–10 pm', slot:'evening', where:'Padang Matsirat', why:'Sunday’s night market, near the airport side.'},
  {city:'Phuket', name:'Lard Yai Sunday Walking Street', days:[0], time:'4–10 pm', slot:'evening', where:'Thalang Road, Old Town', why:'Phuket Old Town closes to traffic for street food and live music.'},
  {city:'Phuket', name:'Naka Weekend Market', days:[0,6], time:'4–10 pm', slot:'evening', where:'Chao Fa West Rd', why:'Phuket’s biggest weekend bazaar — food, clothes, souvenirs.'},
  {city:'Phuket', name:'Chillva Market', days:[3,4,5,6], time:'4–10 pm', slot:'night', where:'Phuket Town', why:'Hip container-style night market with food and small bars.'},
  {city:'Phuket', name:'Boat Avenue Fun Friday', days:[5], time:'4–9 pm', slot:'evening', where:'Cherng Talay', why:'Friday evening market — easy if you’re near Bang Tao.'},
  {city:'Bangkok', name:'Chatuchak Weekend Market', days:[0,6], time:'9 am–6 pm', slot:'morning', where:'MRT Chatuchak Park / BTS Mo Chit', why:'Bangkok’s giant weekend market — go early before the heat.'},
  {city:'Bangkok', name:'Ong Ang Walking Street', days:[0,5,6], time:'4–10 pm', slot:'evening', where:'canal-side, Old City', why:'Friday–Sunday canal walking street with street food and lights.'},
  {city:'Chiang Mai', name:'Sunday Walking Street', days:[0], time:'4–11 pm', slot:'evening', where:'Ratchadamnoen Rd, Old City', why:'Chiang Mai’s best market — crafts, food and buskers right through the old city.'},
  {city:'Chiang Mai', name:'Wualai Saturday Walking Street', days:[6], time:'4–10:30 pm', slot:'evening', where:'Wualai Rd (south gate)', why:'Saturday’s walking street by the silver temple — less crowded than Sunday.'}
];

/* rank order = array order. rating:'4.9★ · 759 reviews' when a platform shows it. */
TD.topPicks = {
  'Kuala Lumpur': [
    {cat:'hike', name:'Broga Hill sunrise', badge:'Most popular', why:'KL’s most-hiked sunrise hill: open grassy ridges and a classic sunrise photo, 30–90 min up.',
     tip:'Start by 5:30 am. Free Selangor Forestry permit needed (forestry.selangor.gov.my). MRT to Kajang + ~17 km Grab. Skip after heavy rain.',
     src:'https://rollinggrace.com/2026/05/04/broga-hill-hiking-guide/', srcLabel:'Rolling Grace, May 2026', q:'Broga Hill Semenyih'},
    {cat:'hike', name:'Bukit Gasing', badge:'Easiest jungle walk', why:'Easy 1–2.5 h jungle loop with a suspension bridge, about 15 min from the city. No fee.',
     src:'https://thesmartlocal.com/read/hiking-trails-kl/', srcLabel:'TheSmartLocal', q:'Bukit Gasing Petaling Jaya'},
    {cat:'hike', name:'Taman Tugu trail', badge:'In the city', why:'Free rainforest trail right next to the city centre — the quickest nature fix in KL.', q:'Taman Tugu Kuala Lumpur'}
  ],
  'Langkawi': [
    {cat:'cruise', name:'Signature / Explorer Sunset Party Cruise', badge:'Best rated', rating:'4.9★ · 759 reviews · Klook',
     why:'The best-rated sunset cruise with a big review count: sunset, buffet dinner and music — the social one.', price:'from ~US$57', src:KLOOK_LGK, srcLabel:'Klook'},
    {cat:'cruise', name:'Langkawi Sunset Cruise Experience', badge:'Most booked', rating:'4.2★ · 1.5K reviews · 40K+ booked · Klook',
     why:'The island’s most-booked sunset cruise: swim stop, sea jacuzzi net and dinner. Cheapest of the three.', price:'from ~US$30', src:'https://www.klook.com/en-MY/activity/8551-sunset-dinner-cruise-langkawi/', srcLabel:'Klook'},
    {cat:'cruise', name:'Tropical Charters sunset cruise', badge:'Long-running classic', rating:'4.3★ · 273 reviews · Tripadvisor',
     why:'Friendly crew and a rope-net swim. Some reviewers say the boat feels dated and gets crowded.', src:'https://www.tripadvisor.com.my/Attraction_Review-g298283-d1595504-Reviews-Tropical_Charters_Langkawi-Langkawi_Langkawi_District_Kedah.html', srcLabel:'Tripadvisor', q:'Tropical Charters Langkawi'},
    {cat:'hike', name:'Seven Wells (Telaga Tujuh)', badge:'Best first hike', why:'~200 steps to the lower pools, 638 to the upper rock pools above the waterfall. Free entry; pair it with SkyCab next door.',
     tip:'Go early. Stay inside the barriers at the top — the upper pool runs over the edge.', src:'https://foreverbreak.com/travel/malaysia/langkawi/seven-wells-waterfall', srcLabel:'Foreverbreak', q:'Telaga Tujuh Waterfall Langkawi'},
    {cat:'hike', name:'Kilim Hill sunrise', badge:'Short + scenic', why:'30–50 min climb for sunrise over the Kilim mangroves and karst islands.', src:'https://www.langkawibook.my/blogs/best-hiking-trails-jungle-trekking-langkawi', srcLabel:'LangkawiBook, Apr 2026', q:'Kilim Geoforest Park Langkawi'},
    {cat:'hike', name:'Gunung Raya', badge:'Hard', why:'Langkawi’s highest peak — a tough ~4.5 h round trip through rainforest. Only if you’re fit and it’s dry.', src:'https://www.langkawibook.my/blogs/best-hiking-trails-jungle-trekking-langkawi', srcLabel:'LangkawiBook, Apr 2026', q:'Gunung Raya Langkawi'}
  ],
  'Phuket': [
    {cat:'cruise', name:'YONA Floating Beach Club', badge:'Best boat party', rating:'4.6★ · 3,193 reviews · GetYourGuide',
     why:'Phuket’s best-reviewed party-on-the-water day: a floating beach club with DJs, food and swim decks.', price:'from ~US$59', src:GYG_PHUKET, srcLabel:'GetYourGuide'},
    {cat:'cruise', name:'James Bond Island Luxury Sunset Cruise', badge:'Highest rated', rating:'4.9★ · 1,897 reviews · GetYourGuide',
     why:'Calmer, premium Phang Nga Bay trip that ends with sunset — the one people rave about.', price:'from ~US$154', src:GYG_PHUKET, srcLabel:'GetYourGuide'},
    {cat:'cruise', name:'Sunset Catamaran Party (Racha + Coral Islands)', badge:'Party + sunset', rating:'4.6★ · 88 reviews · GetYourGuide',
     why:'DJ catamaran with island swim stops and sunset. Fewer reviews than the top two.', price:'from ~US$116', src:GYG_PHUKET, srcLabel:'GetYourGuide'},
    {cat:'hike', name:'Black Rock Viewpoint + Laem Krating', badge:'Best for beginners', why:'Easy–moderate ~2 h from Rawai, with views over Nai Harn beach, Promthep Cape and the islands.',
     src:'https://www.comohotels.com/stories/the-como-guide-to-phuket-hiking', srcLabel:'COMO guide', q:'Black Rock Viewpoint Phuket'},
    {cat:'hike', name:'Kata → Big Buddha trail', badge:'Jungle + views', why:'Moderate–hard ~95 min uphill through forest (monkeys!) to the Big Buddha. Cover shoulders and knees at the top.',
     src:'https://www.comohotels.com/stories/the-como-guide-to-phuket-hiking', srcLabel:'COMO guide', q:'Big Buddha Phuket'},
    {cat:'hike', name:'Khao Phra Thaeo rainforest', badge:'Longest', why:'~4 h from Ton Sai waterfall to Bang Pae waterfall, ending at the Gibbon Rehabilitation Project.',
     src:'https://www.comohotels.com/stories/the-como-guide-to-phuket-hiking', srcLabel:'COMO guide', q:'Ton Sai Waterfall Phuket'}
  ],
  'Bangkok': [
    {cat:'cruise', name:'Wonderful Pearl dinner cruise', badge:'Best all-round', why:'The pick for one solid, slightly romantic river dinner cruise. Boards at ICONSIAM.',
     price:'฿1,200–1,600', tip:'Ask for halal / Muslim meals when booking — not guaranteed.', src:BKK_SPIRIT, srcLabel:'Bangkok Spirit, 2026'},
    {cat:'cruise', name:'Chao Phraya Princess', badge:'Reliable classic', why:'The predictable first-timer cruise: buffet, live music and the lit-up temples. Boards at River City.',
     price:'฿1,100–1,500', src:BKK_SPIRIT, srcLabel:'Bangkok Spirit, 2026'},
    {cat:'cruise', name:'Saffron Cruise (Banyan Tree)', badge:'Best food', why:'The splurge: set-menu dining on a smaller boat. Boards near Sathorn.',
     price:'฿2,000–2,500+', src:BKK_SPIRIT, srcLabel:'Bangkok Spirit, 2026'}
  ],
  'Chiang Mai': [
    {cat:'festival', name:'Yi Peng in the old city (free)', badge:'Best value', why:'Lantern-lit Wat Phan Tao and Wat Chedi Luang, the parade at Tha Phae Gate, and krathongs off Nawarat Bridge on Loy Krathong night.',
     tip:'Sky lanterns are banned inside the city — watch, don’t launch. Go early; it gets packed.', src:'https://www.thailandhighlights.com/thailand/yi-peng-festival', srcLabel:'Thailand Highlights', q:'Tha Phae Gate Chiang Mai'},
    {cat:'festival', name:'CAD Khomloy mass lantern release', badge:'The big photo moment', why:'The largest ticketed release, best for first-timers who want the sky-full-of-lanterns moment. 24–25 Nov.',
     price:'~US$220 with transfers', tip:'Sells out months ahead. Buy only from the official site — resellers are common. The transfer is long.', src:'https://yipenglanternfestival.in.th/', srcLabel:'Official site', q:'CAD Cultural Centre Lanna Mae On'},
    {cat:'festival', name:'Yeepeng Lanna (Gassan Panorama)', badge:'Calmer + cheaper', why:'Smaller ticketed release with a calmer crowd. Heritage Sky Lanterns is the culture-first alternative (~US$145–150).',
     price:'~US$100–125', src:'https://www.kkday.com/en/blog/81177/chiang-mai-yi-peng-lantern-festival', srcLabel:'KKday blog (sells tickets)', q:'Gassan Panorama Golf Club Lamphun'},
    {cat:'hike', name:'Monk’s Trail → Wat Pha Lat', badge:'Best first hike', why:'45–50 min shaded climb from the end of Suthep Rd to a jungle temple with city views. Free; continue ~75 min to Doi Suthep if keen.',
     tip:'Start 7–8 am, bring 1.5 L water, cover shoulders and knees (monks use the trail).', src:'https://www.tielandtothailand.com/hiking-monk-trail-doi-suthep-chiang-mai/', srcLabel:'Tieland to Thailand', q:'Wat Pha Lat Chiang Mai'},
    {cat:'hike', name:'Doi Inthanon — Kew Mae Pan', badge:'Sea of clouds', why:'2.8 km loop (2–3 h) on Thailand’s highest mountain. Opens 1 Nov; a local guide is required.',
     price:'฿300 park + ฿200 guide per group', tip:'Be at the gate by ~6:30 am — the clouds fade by 9.', src:'https://www.thaiholidayguide.com/attraction/kew-mae-pan/', srcLabel:'Thai Holiday Guide', q:'Kew Mae Pan Nature Trail'},
    {cat:'hike', name:'Sticky Waterfall (Bua Tong)', badge:'Most fun', why:'Climb straight up the grippy limestone falls. Free, 8 am–5 pm, ~1.5 h north.',
     tip:'Arrive before 9 am. Grab rarely does the return trip — book a driver or a tour (฿600–1,200).', src:'https://www.thaiholidayguide.com/attraction/bua-tong-sticky-waterfall/', srcLabel:'Thai Holiday Guide', q:'Bua Tong Sticky Waterfall'}
  ]
};

/* Festival hooks the day-by-day plan uses (city-specific beats country-wide). */
TD.eventPlan = {
  deepavali: {'2026-11-07':{name:'Brickfields Deepavali bazaar', slot:'evening'}, '2026-11-08':{name:'Deepavali lights in Brickfields (Little India)', slot:'evening'}},
  yipeng: {'2026-11-23':{name:'Yi Peng opening — Tha Phae Gate + lantern-lit temples', slot:'evening'},
           '2026-11-24':{name:'Loy Krathong night — float a krathong at Nawarat Bridge', slot:'evening'},
           '2026-11-25':{name:'Yi Peng parade + Wat Phan Tao lanterns', slot:'evening'}},
  loykrathong: {'2026-11-24':{name:'Loy Krathong — float a krathong on the river', slot:'evening'}},
  fullmoon: {'2026-11-24':{name:'Full Moon Party, Haad Rin', slot:'night'}}
};
})();

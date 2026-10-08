/* Trip data schema, country defaults, essentials, phrasebook and key dates.
   City content lives in data-core.js (original route) and data-more.js (extra cities). */
(function(){
  const GRAB_MY='https://grab.onelink.me/2695613898?af_ad=my&af_adset=grab_website&af_channel=transport&af_dp=grab%3A%2F%2Fopen%3FscreenType%3DBOOKING&af_force_deeplink=true&af_sub1=book_ride&af_web_dp=https%3A%2F%2Fwww.grab.com%2Fmy%2Fdownload%2F&c=organic_web&is_retargeting=true&pid=organic_web';
  const GRAB_TH='https://grab.onelink.me/2695613898?af_ad=th&af_adset=grab_website&af_channel=transport&af_dp=grab%3A%2F%2Fopen%3FscreenType%3DBOOKING&af_force_deeplink=true&af_sub1=book_ride&af_web_dp=https%3A%2F%2Fwww.grab.com%2Fth%2Fdownload%2F&c=organic_web&is_retargeting=true&pid=organic_web';

  const TD = window.TRIP_DATA = {
    version: '2026-10-09',
    route: ['Kuala Lumpur','Langkawi','Phuket','Bangkok','Chiang Mai'],
    tripDefaults: {start:'2026-11-06', end:'2026-11-27'},
    defaultNights: {'Kuala Lumpur':3,'Langkawi':3,'Phuket':5,'Bangkok':5,'Chiang Mai':5},
    cities: {},
    countries: {
      MY: {
        name:'Malaysia', flag:'🇲🇾', currency:'MYR', symbol:'RM',
        travel:{cc:'MY',currency:'MYR',weather:'https://www.met.gov.my/en/ramalan/',radar:'https://www.met.gov.my/en/pencerapan/radar-malaysia/',grab:GRAB_MY,indrive:'https://indrive.com/en-my/'}
      },
      TH: {
        name:'Thailand', flag:'🇹🇭', currency:'THB', symbol:'฿',
        travel:{cc:'TH',currency:'THB',weather:'https://www.tmd.go.th/en/weather',radar:'https://weather.tmd.go.th/cmp.php',grab:GRAB_TH,indrive:'https://indrive.com/en-th/'}
      }
    },
    novFit: {
      great:{label:'Great in Nov',cls:'great'},
      good:{label:'Good in Nov',cls:'good'},
      mixed:{label:'Showery in Nov',cls:'mixed'},
      wet:{label:'Rainy season',cls:'wet'},
      closed:{label:'Closed in Nov',cls:'closed'}
    },
    keyDates: [
      {id:'deepavali',title:'Deepavali (Diwali)',where:'Malaysia — Kuala Lumpur, Penang and most states',country:'MY',start:'2026-11-08',end:'2026-11-09',
        note:'Sunday 8 Nov, with Monday 9 Nov as the replacement holiday in most states (not Sarawak). Brickfields, KL’s Little India, is the place for lights and festive food; some shops close, malls get busy.'},
      {id:'yipeng',title:'Yi Peng lantern festival',where:'Chiang Mai',cities:['Chiang Mai'],start:'2026-11-23',end:'2026-11-25',
        note:'Lantern-lit temples, the parade and krathongs on the Ping River. Mass sky-lantern releases happen only at ticketed sites outside the city. Rooms sell out — book early.'},
      {id:'loykrathong',title:'Loy Krathong',where:'All of Thailand',country:'TH',start:'2026-11-24',end:'2026-11-24',
        note:'Float a krathong on any river or lake. In Chiang Mai it merges with Yi Peng; in Bangkok the Chao Phraya riverside is lovely. A few calendars list 25 Nov, so confirm locally.'},
      {id:'fullmoon',title:'Full Moon Party',where:'Koh Phangan (Haad Rin)',cities:['Koh Phangan'],start:'2026-11-24',end:'2026-11-24',
        note:'Same night as Loy Krathong this year. Party dates occasionally shift — confirm before booking.'}
    ],
    essentials: {
      MY: [
        {icon:'🛂',title:'Entry',items:[
          'Pakistani passports need a Malaysia <b>eVISA</b> before flying — apply on the official portal, not a reseller.',
          'Everyone also fills the free <b>MDAC</b> (Malaysia Digital Arrival Card) within 3 days before arrival.'],
          links:[['Malaysia eVISA','https://malaysiavisa.imi.gov.my/evisa/'],['MDAC arrival card','https://imigresen-online.imi.gov.my/mdac/main']]},
        {icon:'💵',title:'Money',items:[
          'Ringgit (RM / MYR). Malls and chains take cards; hawkers, markets and small shops want cash.',
          'Touch ’n Go card/eWallet is used on trains, tolls and plenty of stalls.']},
        {icon:'🚕',title:'Getting around',items:[
          'Grab for door-to-door everywhere. In KL use LRT/MRT/Monorail; KLIA Ekspres from the airport.',
          'ETS trains link KL → Ipoh → Butterworth (Penang). Fly to Sabah/Sarawak — they run their own passport check even on domestic flights.']},
        {icon:'📶',title:'SIM + power',items:[
          'Tourist SIM or eSIM at KLIA (bring your passport).',
          'Sockets are <b>Type G (UK 3-pin)</b>, 240V — Pakistani 2-pin plugs need an adapter.']},
        {icon:'🙏',title:'Etiquette',items:[
          'Remove shoes and cover shoulders/knees in mosques and temples (robes are often lent at big mosques).',
          'Give and receive with your right hand. Keep public affection low-key.']},
        {icon:'🍛',title:'Food',items:[
          'Muslim-majority country: halal food is everywhere — look for the JAKIM halal logo.',
          'Chinese hawker dishes (char koay teow, kolo mee, many noodles) often use pork or lard. Use the “Hide pork” switch in Food lists.']},
        {icon:'⚠️',title:'Watch out for',items:[
          'Bag snatching from passing motorbikes — carry bags on the side away from the road.',
          'Taxis at tourist spots that won’t use the meter — just book a Grab.',
          'Drug laws are extremely strict.']},
        {icon:'🆘',title:'Emergency',items:['<b>999</b> police / ambulance (or <b>112</b> from a mobile).']}
      ],
      TH: [
        {icon:'🛂',title:'Entry',items:[
          'Pakistani passports need a Thai <b>e-Visa</b> before travel — apply on the official portal.',
          'Everyone fills the free <b>TDAC</b> (Thailand Digital Arrival Card) within 72 hours before arrival.'],
          links:[['Thai e-Visa','https://www.thaievisa.go.th/'],['TDAC arrival card','https://tdac.immigration.go.th/arrival-card/']]},
        {icon:'💵',title:'Money',items:[
          'Baht (฿ / THB). Thai ATMs charge foreign cards a fee on every withdrawal (often around ฿220–250) — take out bigger amounts less often.',
          'Street food, markets, songthaews and tuk-tuks are cash.']},
        {icon:'🚕',title:'Getting around',items:[
          'Grab and Bolt in big cities. Bangkok: BTS Skytrain + MRT + river boats.',
          'Islands = ferries and longtail boats. North = Green Bus or short flights.']},
        {icon:'📶',title:'SIM + power',items:[
          'AIS, TrueMove H or dtac tourist SIM at the airport, or an eSIM before you fly.',
          'Sockets are Type A/B/C/O, 220V — most Pakistani 2-pin plugs fit.']},
        {icon:'🙏',title:'Etiquette',items:[
          'Never insult the royal family — it is a serious crime.',
          'Temples: shoulders and knees covered, shoes off, don’t point your feet at Buddha images, don’t touch people’s heads.']},
        {icon:'🍛',title:'Food',items:[
          'Thai food often contains pork and fish sauce. Say <b>“mai sai moo”</b> (no pork).',
          'Halal food is easy in the south (Phuket, Krabi) and around mosques in Bangkok and Chiang Mai — look for the green Thai halal sign.']},
        {icon:'⚠️',title:'Watch out for',items:[
          '“The Grand Palace is closed today” + cheap tuk-tuk tour = gem-shop scam.',
          'Jet-ski “damage” scams in Phuket and Pattaya; taxis that refuse the meter.',
          '<b>Vapes and e-cigarettes are illegal</b> (fines or arrest). Cannabis rules were tightened in 2025 — just avoid it.']},
        {icon:'🆘',title:'Emergency',items:['Tourist Police <b>1155</b> (English) · Police <b>191</b> · Ambulance <b>1669</b>.']}
      ]
    },
    phrases: {
      MY: {lang:'ms-MY', label:'Malay', items:[
        ['Hello','Hai / Selamat pagi','Hai / Selamat pagi'],
        ['Thank you','Terima kasih','Terima kasih'],
        ['How much?','Berapa harga?','Berapa harga?'],
        ['Not spicy, please','Tak pedas, ya','Tak pedas, ya'],
        ['Is this halal?','Ini halal?','Ini halal?'],
        ['Where is the toilet?','Tandas di mana?','Tandas di mana?'],
        ['Can you lower the price a bit?','Boleh kurang sikit?','Boleh kurang sikit?'],
        ['Delicious!','Sedap!','Sedap!'],
        ['Sorry / excuse me','Maaf','Maaf'],
        ['No thanks, it’s okay','Tak apa, terima kasih','Tak apa, terima kasih']
      ]},
      TH: {lang:'th-TH', label:'Thai (polite female “ka”)', items:[
        ['Hello','Sawasdee ka','สวัสดีค่ะ'],
        ['Thank you','Khop khun ka','ขอบคุณค่ะ'],
        ['How much?','Tao rai ka?','เท่าไหร่คะ'],
        ['Not spicy','Mai phet ka','ไม่เผ็ดค่ะ'],
        ['A little spicy','Phet nit noi','เผ็ดนิดหน่อย'],
        ['No pork, please','Mai sai moo ka','ไม่ใส่หมูค่ะ'],
        ['Where is the toilet?','Hong nam yoo tee nai ka?','ห้องน้ำอยู่ที่ไหนคะ'],
        ['Can you give a discount?','Lot dai mai ka?','ลดได้ไหมคะ'],
        ['Please use the meter','Poet meter duay ka','เปิดมิเตอร์ด้วยค่ะ'],
        ['Very delicious!','Aroi mak!','อร่อยมาก'],
        ['No thanks / don’t want','Mai ao ka','ไม่เอาค่ะ']
      ]}
    },
    intercity: [],
    weatherTranslate: {}
  };

  function modeOf(label){
    const l=(label||'').toLowerCase();
    if(/^walk/.test(l)) return 'walk';
    if(/train|mrt|bts|lrt|bus|ferry|rail/.test(l) && !/grab/.test(l)) return 'transit';
    if(/grab|bolt|taxi/.test(l)) return 'grab';
    return 'route';
  }
  TD.modeOf = modeOf;

  TD.loadCore = function(core){
    Object.assign(TD.cities, core.cities);
    TD.intercity = core.intercity || [];
    TD.weatherTranslate = core.weatherTranslate || {};
  };

  /* Compact city format → normalized city object */
  TD.add = function(c){
    const toRec = r => Array.isArray(r) ? {name:r[0],badge:r[1],note:r[2],...(r[3]?{diet:r[3]}:{}),...(r[4]?{src:r[4]}:{})} : r;
    const stays = (c.stays||[]).map(s=>({area:s[0],aliases:String(s[1]).split('|'),fit:s[2],why:s[3],near:[]}));
    const recs = {};
    recs['Stay areas'] = (c.recs&&c.recs['Stay areas']) ? c.recs['Stay areas'].map(toRec)
      : stays.map((s,i)=>({name:s.area,badge:i?s.fit.toUpperCase():'PRIMARY',note:s.why}));
    Object.entries(c.recs||{}).forEach(([k,v])=>{ if(k!=='Stay areas') recs[k]=v.map(toRec); });
    TD.cities[c.name] = {
      name:c.name, country:c.country, region:c.region, emoji:c.emoji, accent:c.accent,
      tagline:c.tagline, famous:c.famous||[], nov:{fit:c.nov[0],note:c.nov[1]},
      base:c.base, why:c.why, next:c.next, avoid:c.avoid,
      altBases:c.alts||[], signatures:c.sigs||[], ownTime:c.own||[],
      getThere:c.getThere||'', tips:c.tips||[],
      coords:{lat:c.coords[0],lon:c.coords[1]},
      travel:{airport:c.airport||'',advice:c.advice||'',intercity:c.intercity||[],...(c.metName?{metName:c.metName}:{})},
      stays, recs,
      activities:(c.acts||[]).map(a=>({name:a[0],cost:a[1],costClass:a[2],kind:a[3],when:a[4]})),
      clusters:c.clusters||[],
      picks:(c.picks||[]).map(p=>({name:p[0],kind:p[1],tags:String(p[2]).split('/'),weather:p[3],modeLabel:p[4],mode:modeOf(p[4]),why:p[5]})),
      night:(c.night||[]).map(n=>({name:n[0],time:n[1],why:n[2],mode:n[3]})),
      added:true
    };
  };
})();

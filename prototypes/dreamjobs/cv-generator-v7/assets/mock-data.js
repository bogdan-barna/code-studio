/* DreamJobs prototípus – demó adatok: állások, a csatolt PDF-ből "kiolvasott" CV, kérdések. */
(function (DJP) {
  DJP.jobs = {
    startuphub: {
      id: 'startuphub',
      title: 'Ügyfélkapcsolati munkatárs (B2B és B2C)',
      titleI18n: { en: 'Customer Relations Associate', ro: 'Specialist relații clienți' },
      company: 'StartUp HUB',
      city: 'Kolozsvár',
      location: 'Cluj-Napoca, România',
      companyAddress: 'Sepsiszentgyörgy, Románia',
      salary: '3000 - 5000 RON',
      level: 'Junior',
      type: 'Teljes munkaidős',
      deadline: 'november 06.',
      logo: 'assets/startuphub-logo.jpg',
      url: 'allas.html',
      projects: 'tecalificam.ro és cursurispecializare.ro',
      /* a hirdetés és a cégprofil szövegéből – a motivációs levél ezeket is felhasználja */
      mission: 'a régió gazdasági fejlődésének támogatása innováció, vállalkozásfejlesztés és szakképzés révén',
      taskText: 'a bejövő és kimenő hívások kezelése, az érdeklődők tájékoztatása a képzésekről, a jelentkezések feldolgozása és az ügyféladatok CRM-ben való rögzítése',
      values: ['a megbízhatóság', 'a pontosság', 'a csapatmunka'],
      culture: 'képzésekkel, konferenciákkal és Erasmus-programokkal támogatják a kollégák fejlődését, a csapatmegbeszéléseken pedig mindenki véleménye számít',
      trains: 'a professzionális ügyfélkezelési és telefonos technikákat, a CRM használatát és a projektadminisztrációt betanítják',
      tasks: ['Ügyfelekkel való kapcsolattartás', 'Adminisztratív feladatok', 'Adatok rögzítése', 'Kimenő hívások indítása'],
      requirements: [
        { key: 'crm', label: 'CRM rendszer ismerete', need: '3 / 5' },
        { key: 'comm', label: 'Jó kommunikációs képesség', need: '5 / 5' },
        { key: 'sales', label: 'Értékesítési és ügyfélkapcsolati készségek', need: '4 / 5' },
        { key: 'ba', label: 'Képzettség: BA diploma', need: 'Általános' },
        { key: 'ro', label: 'Román nyelvtudás', need: 'Tárgyalóképes' },
        { key: 'phone', label: 'Telefonos ügyfélkezelés (in- és outbound)', need: 'Előny' },
        { key: 'soft', label: 'Proaktív, szorgalmas, csapatjátékos, pontos', need: 'Kompetencia' }
      ]
    },
    pmassist: {
      id: 'pmassist',
      title: 'Projektmenedzser asszisztens',
      titleI18n: { en: 'Project Management Assistant', ro: 'Asistent manager de proiect' },
      company: 'StartUp HUB',
      city: 'Marosvásárhely',
      location: 'Târgu Mureș, România',
      companyAddress: 'Sepsiszentgyörgy, Románia',
      salary: '4000 - 6000 RON',
      level: 'Medior',
      type: 'Teljes munkaidős',
      deadline: 'november 20.',
      logo: 'assets/startuphub-logo.jpg',
      url: 'allas.html',
      projects: 'európai uniós projektjeink',
      mission: 'a régió gazdasági fejlődésének támogatása innováció, vállalkozásfejlesztés és szakképzés révén',
      taskText: 'a projektdokumentáció vezetése, a határidők követése és a partnerekkel való kommunikáció',
      values: ['a megbízhatóság', 'a pontosság', 'a csapatmunka'],
      culture: 'képzésekkel, konferenciákkal és Erasmus-programokkal támogatják a kollégák fejlődését',
      trains: 'a projektadminisztráció részleteit betanítják',
      tasks: ['Projektdokumentáció vezetése', 'Határidők követése', 'Partnerekkel való kommunikáció', 'Riportok készítése'],
      requirements: [
        { key: 'pm', label: 'Projektmenedzsment alapismeretek', need: '3 / 5' },
        { key: 'comm', label: 'Jó kommunikációs képesség', need: '4 / 5' },
        { key: 'office', label: 'Office programok', need: 'Haladó' },
        { key: 'ro', label: 'Román nyelvtudás', need: 'Tárgyalóképes' }
      ]
    }
  };

  /* Szakasz-típusok (a Jobseeker szerkesztő mintájára) */
  DJP.SECTION_TYPES = {
    profile: { type: 'text', title: 'Bemutatkozás', placeholder: 'Pár mondat rólad: ki vagy, mit tudsz, mit keresel.' },
    experience: { type: 'entries', title: 'Szakmai tapasztalat', labels: { title: 'Pozíció', subtitle: 'Munkáltató', city: 'Város' } },
    education: { type: 'entries', title: 'Tanulmányok', labels: { title: 'Végzettség / szak', subtitle: 'Intézmény', city: 'Város' } },
    courses: { type: 'entries', title: 'Kurzusok és tanúsítványok', labels: { title: 'Kurzus', subtitle: 'Szolgáltató', city: 'Helyszín' } },
    projects: { type: 'entries', title: 'Projektek', labels: { title: 'Projekt', subtitle: 'Szerep / platform', city: 'Link' } },
    internships: { type: 'entries', title: 'Szakmai gyakorlat', labels: { title: 'Pozíció', subtitle: 'Cég', city: 'Város' } },
    references: { type: 'entries', title: 'Referenciák', labels: { title: 'Név', subtitle: 'Cég / beosztás', city: 'Elérhetőség' } },
    skills: { type: 'skills', title: 'Készségek' },
    languages: { type: 'languages', title: 'Nyelvtudás' },
    achievements: { type: 'text', title: 'Eredmények', placeholder: 'Számszerűsíthető eredmények, díjak.' },
    hobbies: { type: 'text', title: 'Hobbik', placeholder: 'Pl. túrázás, fotózás, főzés.' },
    interests: { type: 'text', title: 'Érdeklődési körök', placeholder: 'Szakmai érdeklődési területek.' },
    driving: { type: 'text', title: 'Jogosítvány', placeholder: 'Pl. B kategória' },
    salary: { type: 'text', title: 'Bérigény', placeholder: 'Pl. nettó 4500 – 6000 RON' },
    values: { type: 'tags', title: 'Ezek fontosak egy munkahelynél', suggest: ['Fejlődési lehetőség', 'Jó csapat', 'Rugalmas munkaidő', 'Stabilitás', 'Képzések', 'Hibrid munka', 'Értelmes munka'] },
    traits: { type: 'tags', title: 'Ilyen vagyok', suggest: ['Proaktív', 'Megbízható', 'Kommunikatív', 'Precíz', 'Csapatjátékos', 'Kitartó', 'Segítőkész'] },
    custom: { type: 'text', title: 'Egyéni szakasz', placeholder: 'Bármi, ami fontos lehet.' }
  };

  DJP.EXTRA_FIELDS = [
    { key: 'birthDate', label: 'Születési dátum' },
    { key: 'birthPlace', label: 'Születési hely' },
    { key: 'driving', label: 'Jogosítvány' },
    { key: 'gender', label: 'Nem' },
    { key: 'nationality', label: 'Állampolgárság' },
    { key: 'civil', label: 'Családi állapot' },
    { key: 'website', label: 'Weboldal' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'address2', label: 'Második cím' }
  ];

  DJP.LANG_LEVELS = ['Anyanyelv', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
  /* készségszintek 1–5 pontos skálán (a szerkesztőben pontokkal jelölhető) */
  DJP.SKILL_LEVELS = ['Kezdő', 'Alapszint', 'Közepes', 'Haladó', 'Szakértő'];
  DJP.skillScore = function (lvl) { return DJP.SKILL_LEVELS.indexOf(lvl) + 1; };

  /* a DreamJobs A4-5 / A4-4 / A4-3 sablontervek */
  DJP.TEMPLATES = [
    { id: 'red', name: 'DreamJobs Piros', accent: '#E1415A', font: 'Poppins', group: 0 },
    { id: 'blue', name: 'DreamJobs Kék', accent: '#1E64E1', font: 'Roboto', group: 0 },
    { id: 'gradient', name: 'DreamJobs Gradiens', accent: '#1E64E1', font: 'Inter', group: 0 },
    { id: 'classic', name: 'Klasszikus (sötét oldalsáv)', accent: '#E1415A', font: 'Poppins', group: 1 },
    { id: 'modern', name: 'Modern (színes fejléc)', accent: '#E1415A', font: 'Poppins', group: 1 },
    { id: 'minimal', name: 'Minimál (egyoszlopos)', accent: '#E1415A', font: 'Poppins', group: 1 }
  ];
  DJP.ACCENTS = ['#E1415A', '#1E64E1', '#1E2328', '#0E9F6E', '#7C3AED', '#EA7D38'];
  DJP.FONTS = ['Poppins', 'Inter', 'Roboto', 'Montserrat', 'Lato', 'Open Sans', 'Nunito', 'Source Sans 3', 'Merriweather', 'Playfair Display', 'Zilla Slab', 'Arial', 'Georgia'];
  DJP.SERIF_FONTS = { 'Merriweather': 1, 'Playfair Display': 1, 'Zilla Slab': 1, 'Georgia': 1 };

  var n = 0;
  function sid() { n += 1; return 's' + n; }
  function iid() { n += 1; return 'i' + n; }

  DJP.newSection = function (kind) {
    var t = DJP.SECTION_TYPES[kind];
    var s = { id: DJP.uid('sec'), kind: kind, type: t.type, title: t.title };
    if (t.type === 'text') s.text = '';
    else s.items = [];
    return s;
  };

  DJP.newItem = function (type) {
    if (type === 'skills') return { id: DJP.uid('it'), name: '', level: '', detail: '' };
    if (type === 'languages') return { id: DJP.uid('it'), name: '', level: 'B2' };
    if (type === 'tags') return { id: DJP.uid('it'), name: '' };
    return { id: DJP.uid('it'), title: '', subtitle: '', city: '', start: '', end: '', desc: '' };
  };

  /* Üres CV: csak a regisztrációs adatok */
  DJP.blankCV = function (user) {
    return {
      template: 'red', accent: '#E1415A', font: 'Poppins', spacing: 'normal',
      personal: {
        firstName: user.firstName || '', lastName: user.lastName || '', headline: '',
        email: user.email || '', phone: user.phone || '', address: '', postCode: '', city: '',
        photo: null, extra: []
      },
      sections: ['profile', 'experience', 'education', 'skills', 'languages', 'hobbies'].map(DJP.newSection)
    };
  };

  function S(kind, extra) {
    var t = DJP.SECTION_TYPES[kind];
    return Object.assign({ id: sid(), kind: kind, type: t.type, title: t.title }, extra);
  }
  function E(o) { return Object.assign({ id: iid(), city: '', start: '', end: '', desc: '' }, o); }
  function K(name, detail, level) { return { id: iid(), name: name, detail: detail || '', level: level || '' }; }

  /* A csatolt Kovacs-Anna-CV.pdf teljes tartalma, magyarra strukturálva */
  DJP.parsedCV = function () {
    return {
      template: 'red', accent: '#E1415A', font: 'Poppins', spacing: 'normal',
      personal: {
        firstName: 'Anna', lastName: 'Kovács', headline: 'Product Manager',
        email: 'anna.kovacs@example.com', phone: '(+40) 700 123 456',
        address: 'Strada Exemplu, Nr. 12', postCode: '400000',
        city: 'Kolozsvár, Kolozs megye, Románia', photo: null,
        extra: [
          { key: 'birthDate', label: 'Születési dátum', value: '1997.03.14.' },
          { key: 'birthPlace', label: 'Születési hely', value: 'Kolozsvár, Kolozs megye' },
          { key: 'nationality', label: 'Állampolgárság', value: 'román' },
          { key: 'gender', label: 'Nem', value: 'Nő' },
          { key: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/kovacs-anna-demo' },
          { key: 'whatsapp', label: 'WhatsApp', value: '+40 700 123 456' }
        ]
      },
      sections: [
        S('profile', {
          text: 'Motivált szakember, aki az IT terület felé vált, és már két end-to-end leszállított webes projekttel rendelkezik. Korábbi üzleti tapasztalatomat a technológia iránti szenvedéllyel ötvözöm. Aktívan veszek részt Full-Stack fejlesztői képzéseken, hogy elsajátítsam a front-end és back-end architektúrát. Product Manager szerepet keresek, ahol gyorsan fejlődhetek, és tapasztalt csapat mellett működő megoldásokhoz járulhatok hozzá. Célom, hogy szilárd karriert építsek egy professzionális környezetben, ahol az üzleti logikát és a fejlődő technikai kompetenciáimat egyaránt alkalmazhatom.'
        }),
        S('projects', {
          items: [
            E({
              title: 'www.vitafarm.ro', subtitle: 'E-commerce webáruház (PrestaShop)', city: 'www.vitafarm.ro',
              desc: '• Front-end design és testreszabás: az új, reszponzív felület teljes megtervezése és megvalósítása UX/UI fókusszal; gyorsabb betöltés, intuitív navigáció, magasabb ügyfél-elégedettség és konverziós arány.\n• Technikai fejlesztés (PrestaShop): folyamatos karbantartás, optimalizálás és kódszintű fejlesztések (HTML, CSS, JS, PHP); Google Analytics integráció, haladó SEO & GEO optimalizálás.\n• Operatív menedzsment: a termékkatalógus, készletek és modulok teljes körű kezelése, GDPR-megfelelés biztosítása.'
            }),
            E({
              title: 'www.decorhaz.ro', subtitle: 'E-commerce webáruház (PrestaShop)', city: 'www.decorhaz.ro',
              desc: '• End-to-end fejlesztés: önállóan fejlesztett és üzemeltetett e-commerce projekt a designtól az indításig és a karbantartásig.\n• Front-end & UX/UI: az alapsablon haladó testreszabása (HTML, CSS, JS), egyedi design megvalósítása.\n• Back-end & adatbázis: PHP-kódszintű beavatkozások, MySQL-optimalizálás, összetett modulok beállítása (fizetés, szállítás, termékimport).\n• Megfelelőség: GDPR-követelmények biztosítása, SEO & GEO optimalizálás.'
            })
          ]
        }),
        S('experience', {
          items: [
            E({
              title: 'Online marketing specialista', subtitle: 'Vitafarm SRL', city: 'Kolozsvár', start: '2023.11', end: '2026.04',
              desc: 'A www.vitafarm.ro e-commerce platform fejlesztéséért, karbantartásáért és optimalizálásáért felelek, a technikai feladatokat digitális marketingstratégiával ötvözve.\n• Design & UI/UX: a webáruház front-end designjának megtervezése és megvalósítása.\n• Technikai karbantartás: a back-end kezelése és frissítése, hibaelhárítás, folyamatos működés biztosítása.\n• Adatbázis-kezelés: a termékadatbázis adminisztrálása, tömeges frissítések, adatstruktúra optimalizálása.\n• SEO & GEO: organikus láthatóság növelése, oldalindexelés, termékfeedek kezelése.\n• AI-automatizálás: munkafolyamatok gyorsítása mesterséges intelligenciával a tartalomgyártástól a működési folyamatokig.\n• PPC-kampányok: Google Ads és Meta Ads kampányok létrehozása és optimalizálása adatelemzés alapján.\n• Adatelemzés: teljesítménymérés Google Analyticsszel, piackutatás, stratégiai döntések előkészítése.\n• Menedzsment & operatív feladatok: számlázás, pénzügyi menedzsment, árképzés, rendelésfeldolgozás, folyamatoptimalizálás.\n• Kapcsolattartás a beszállítókkal és az ügyfélkommunikáció kezelése.'
            }),
            E({
              title: 'Szabadúszó webfejlesztő', subtitle: 'Önálló tevékenység', city: 'Online, Románia', start: '2023', end: 'jelenleg',
              desc: '• E-commerce és bemutatkozó weboldalak fejlesztése PrestaShop és WordPress alapon.\n• UX/UI testreszabás, SEO-alapok, GDPR-megfelelés.'
            }),
            E({
              title: 'Gyógyszertári asszisztens', subtitle: 'Vitafarm SRL', city: 'Kolozsvár', start: '2020.08', end: '2023.10',
              desc: '• Ügyfelek kiszolgálása és tanácsadása a gyógyszertárban.\n• Rendelések és készlet adminisztrációja.'
            }),
            E({
              title: 'Statisztikai referens', subtitle: 'Farmacia Aurora SRL', city: 'Kolozsvár', start: '2018.04', end: '2018.09',
              desc: '• Adatgyűjtés, -rögzítés és statisztikai kimutatások készítése.'
            })
          ]
        }),
        S('education', {
          items: [
            E({ title: 'Mesterképzés – Üzletfejlesztési menedzsment', subtitle: 'Babeș-Bolyai Tudományegyetem', city: 'Kolozsvár', start: '2021', end: '2023', desc: 'Közgazdaság- és Gazdálkodástudományi Kar · Menedzsment · EKKR 7. szint' }),
            E({ title: 'Alapképzés (BA) – Vállalatgazdaságtan', subtitle: 'Babeș-Bolyai Tudományegyetem', city: 'Kolozsvár', start: '2018', end: '2021', desc: 'Közgazdaság- és Gazdálkodástudományi Kar · Üzleti adminisztráció · EKKR 6. szint' }),
            E({ title: 'Posztliceális oklevél – Gyógyszertári asszisztens', subtitle: '„Gábor Áron” Egészségügyi Posztliceális Iskola', city: 'Kolozsvár', start: '2017', end: '2020' }),
            E({ title: 'Vezetői kompetenciafejlesztő program', subtitle: 'Ifjúsági Vezetőképző Akadémia', city: 'Budapest, Magyarország', start: '2017', end: '2017' }),
            E({ title: 'Érettségi – Társadalomtudományok', subtitle: '„Mikes Kelemen” Elméleti Líceum', city: 'Kolozsvár', start: '2013', end: '2017' })
          ]
        }),
        S('courses', {
          items: [
            E({ title: 'AI SEO: Mastering Generative Engine Optimization (GEO)', subtitle: 'SkillUp (Coursera)', city: 'Online', start: '2026.01', end: '2026.02' }),
            E({ title: 'Full-Stack Engineer Professional Certification', subtitle: 'Codecademy', city: 'Online', start: '2025.11', end: 'folyamatban', desc: 'Full-Stack Development' }),
            E({ title: 'Microsoft Full-Stack Developer Professional Certificate', subtitle: 'Microsoft (Coursera)', city: 'Online', start: '2025.10', end: 'folyamatban', desc: 'Full-Stack Development' }),
            E({ title: 'AI For Business Specialization', subtitle: 'University of Pennsylvania (Coursera)', city: 'Online', start: '2025.10', end: 'folyamatban' })
          ]
        }),
        S('skills', {
          items: [
            K('Front-end fejlesztés', 'HTML5 (haladó) · CSS3 (haladó) · Bootstrap · JavaScript (kezdő) · TypeScript (kezdő) · PWA'),
            K('Back-end & adatbázis', 'PHP (kezdő) · Laravel (kezdő) · SQL & MySQL (közepes) · Node.js (kezdő) · Python (kezdő) · REST API (kezdő)'),
            K('CMS & e-commerce', 'PrestaShop (haladó) · Drupal, Joomla · WordPress (haladó) · WooCommerce (haladó) · cPanel'),
            K('Fejlesztői eszközök', 'AI Coding & Productivity · Google Antigravity · Git & GitHub (közepes) · Visual Studio Code · XAMPP'),
            K('Design & generatív AI', 'Figma · UI/UX design · Photoshop · Canva · Generatív AI (közepes) · Nano Banana & Seedream'),
            K('Digitális marketing & SEO', 'Google Analytics · Google Ads · Google Webmaster Tools · Meta Ads · SEO & GEO optimalizálás'),
            K('Személyes kompetenciák', 'Problémamegoldás · Logikus gondolkodás · Stressztűrés és kitartás · Precizitás, részletorientáltság · Önfejlesztési motiváció · Office programok (haladó)')
          ]
        }),
        S('languages', {
          items: [
            { id: iid(), name: 'Magyar', level: 'Anyanyelv' },
            { id: iid(), name: 'Román', level: 'C1' },
            { id: iid(), name: 'Angol', level: 'B2' }
          ]
        }),
        S('driving', { text: 'B kategória' }),
        S('hobbies', { text: 'Foci, kézilabda, kerékpározás, túrázás és hegyi kirándulások, kertészkedés és növénygondozás, fotózás (képszerkesztéssel együtt), webdesign és weboldalkészítés, főzés.' }),
        S('interests', { text: 'Személyes fejlődés és csapatvezetés · Gazdasági-pénzügyi elemzés és adatalapú döntéshozatal · Üzletfejlesztés és vállalkozás · Adminisztratív folyamatok optimalizálása, digitális eszközök használata' })
      ]
    };
  };

  /* A demó CV angol és román változata a fordítási memóriában (a román az eredeti PDF szövegét követi) */
  [
    ['Kolozsvár, Kolozs megye, Románia', 'Cluj-Napoca, Cluj County, Romania', 'Cluj-Napoca, județul Cluj, România'],
    ['1997.03.14.', '14/03/1997', '14/03/1997'],
    ['Kolozsvár, Kolozs megye', 'Cluj-Napoca, Cluj County', 'Cluj-Napoca, județul Cluj'],
    ['román', 'Romanian', 'română'],
    ['Nő', 'Female', 'Feminin'],
    ['Motivált szakember, aki az IT terület felé vált, és már két end-to-end leszállított webes projekttel rendelkezik. Korábbi üzleti tapasztalatomat a technológia iránti szenvedéllyel ötvözöm. Aktívan veszek részt Full-Stack fejlesztői képzéseken, hogy elsajátítsam a front-end és back-end architektúrát. Product Manager szerepet keresek, ahol gyorsan fejlődhetek, és tapasztalt csapat mellett működő megoldásokhoz járulhatok hozzá. Célom, hogy szilárd karriert építsek egy professzionális környezetben, ahol az üzleti logikát és a fejlődő technikai kompetenciáimat egyaránt alkalmazhatom.',
      'Motivated professional transitioning into IT, with two web projects already delivered end-to-end. I combine my previous business experience with a passion for technology. I am actively taking Full-Stack Development courses to master front-end and back-end architecture. I am looking for a Product Manager role where I can grow quickly and contribute to working solutions alongside an experienced team. My goal is to build a solid career in a professional environment where I can apply both business logic and my growing technical skills.',
      'Profesionist motivat în tranziție către IT, având deja la activ două proiecte web livrate end-to-end. Combin experiența anterioară de business cu o pasiune pentru tehnologie. Urmez activ cursuri de specializare Full-Stack Development pentru a stăpâni arhitectura Front-End și Back-End. Caut un rol de Product Manager care să îmi ofere oportunitatea de a crește rapid și de a contribui la soluții funcționale, sub îndrumarea unei echipe experimentate. Obiectivul meu este să îmi construiesc o carieră solidă într-un mediu profesionist, unde pot aplica atât logica de afaceri, cât și competențele tehnice în creștere.'],
    ['E-commerce webáruház (PrestaShop)', 'E-commerce web shop (PrestaShop)', 'Magazin e-commerce (PrestaShop)'],
    ['Front-end design és testreszabás: az új, reszponzív felület teljes megtervezése és megvalósítása UX/UI fókusszal; gyorsabb betöltés, intuitív navigáció, magasabb ügyfél-elégedettség és konverziós arány.',
      'Front-end design & customisation: designed and implemented the new responsive interface end-to-end with a UX/UI focus; faster loading, intuitive navigation, higher customer satisfaction and conversion rate.',
      'Design & personalizare Front-End: am conceput și implementat integral noul design responsiv al interfeței, cu focus pe UX/UI; încărcare mai rapidă, navigare intuitivă, satisfacție mai mare a clienților și o rată de conversie mai bună.'],
    ['Technikai fejlesztés (PrestaShop): folyamatos karbantartás, optimalizálás és kódszintű fejlesztések (HTML, CSS, JS, PHP); Google Analytics integráció, haladó SEO & GEO optimalizálás.',
      'Technical development (PrestaShop): ongoing maintenance, optimisation and code-level improvements (HTML, CSS, JS, PHP); Google Analytics integration, advanced SEO & GEO optimisation.',
      'Dezvoltare tehnică (PrestaShop): mentenanță, optimizare și intervenții constante la nivel de cod (HTML, CSS, JS, PHP); integrarea Google Analytics, optimizare avansată SEO & GEO.'],
    ['Operatív menedzsment: a termékkatalógus, készletek és modulok teljes körű kezelése, GDPR-megfelelés biztosítása.',
      'Operations management: full management of the product catalogue, stock and modules, ensuring GDPR compliance.',
      'Gestiune operațională: administrarea completă a catalogului, stocurilor și modulelor, asigurarea conformității GDPR.'],
    ['End-to-end fejlesztés: önállóan fejlesztett és üzemeltetett e-commerce projekt a designtól az indításig és a karbantartásig.',
      'End-to-end development: e-commerce project built and run independently, from design to launch and maintenance.',
      'Dezvoltare End-to-End: proiect e-commerce dezvoltat și gestionat integral pe cont propriu, de la design la lansare și mentenanță.'],
    ['Front-end & UX/UI: az alapsablon haladó testreszabása (HTML, CSS, JS), egyedi design megvalósítása.',
      'Front-end & UX/UI: advanced customisation of the base template (HTML, CSS, JS) and implementation of a unique design.',
      'Front-End & UX/UI: personalizare avansată a template-ului de bază (HTML, CSS, JS) și implementarea unui design unic.'],
    ['Back-end & adatbázis: PHP-kódszintű beavatkozások, MySQL-optimalizálás, összetett modulok beállítása (fizetés, szállítás, termékimport).',
      'Back-end & databases: PHP code-level changes, MySQL optimisation, configuration of complex modules (payment, shipping, product import).',
      'Back-End & baze de date: intervenții la nivel de cod PHP, optimizare MySQL și configurare de module complexe (plată, livrare, import produse).'],
    ['Megfelelőség: GDPR-követelmények biztosítása, SEO & GEO optimalizálás.', 'Compliance: ensuring GDPR requirements, SEO & GEO optimisation.', 'Conformitate: asigurarea cerințelor GDPR și optimizarea SEO & GEO.'],
    ['Online marketing specialista', 'Online Marketing Specialist', 'Specialist marketing online'],
    ['Szabadúszó webfejlesztő', 'Freelance Web Developer', 'Dezvoltator web freelancer'],
    ['Önálló tevékenység', 'Self-employed', 'Activitate independentă'],
    ['Gyógyszertári asszisztens', 'Pharmacy Assistant', 'Asistent farmacist'],
    ['Statisztikai referens', 'Statistical Officer', 'Referent statistician'],
    ['A www.vitafarm.ro e-commerce platform fejlesztéséért, karbantartásáért és optimalizálásáért felelek, a technikai feladatokat digitális marketingstratégiával ötvözve.',
      'Responsible for developing, maintaining and optimising the www.vitafarm.ro e-commerce platform, combining technical tasks with digital marketing strategy.',
      'Responsabil pentru dezvoltarea, mentenanța și optimizarea platformei e-commerce www.vitafarm.ro, combinând atribuții tehnice cu strategii de marketing digital.'],
    ['Design & UI/UX: a webáruház front-end designjának megtervezése és megvalósítása.', 'Design & UI/UX: designing and implementing the web shop\'s front-end.', 'Design & UI/UX: proiectarea și implementarea design-ului Front-End al magazinului online.'],
    ['Technikai karbantartás: a back-end kezelése és frissítése, hibaelhárítás, folyamatos működés biztosítása.', 'Technical maintenance: managing and updating the back-end, troubleshooting, ensuring continuous operation.', 'Mentenanță tehnică: gestionarea și actualizarea Back-End-ului, depanarea erorilor și asigurarea funcționalității continue.'],
    ['Adatbázis-kezelés: a termékadatbázis adminisztrálása, tömeges frissítések, adatstruktúra optimalizálása.', 'Database management: administering the product database, bulk updates, optimising the data structure.', 'Gestionare baze de date: administrarea bazei de date de produse, actualizări în masă și optimizarea structurii datelor.'],
    ['SEO & GEO: organikus láthatóság növelése, oldalindexelés, termékfeedek kezelése.', 'SEO & GEO: increasing organic visibility, page indexing, managing product feeds.', 'SEO & GEO: creșterea vizibilității organice, indexarea paginilor și gestionarea feed-urilor de produse.'],
    ['AI-automatizálás: munkafolyamatok gyorsítása mesterséges intelligenciával a tartalomgyártástól a működési folyamatokig.', 'AI automation: speeding up workflows with artificial intelligence, from content creation to operational processes.', 'Automatizare cu AI: accelerarea fluxurilor de lucru cu inteligență artificială, de la generarea de conținut la procesele operaționale.'],
    ['PPC-kampányok: Google Ads és Meta Ads kampányok létrehozása és optimalizálása adatelemzés alapján.', 'PPC campaigns: creating and optimising Google Ads and Meta Ads campaigns based on data analysis.', 'Campanii PPC: crearea și optimizarea campaniilor Google Ads și Meta Ads, bazate pe analiza datelor.'],
    ['Adatelemzés: teljesítménymérés Google Analyticsszel, piackutatás, stratégiai döntések előkészítése.', 'Data analysis: performance tracking with Google Analytics, market research, preparing strategic decisions.', 'Analiză date: monitorizarea performanței prin Google Analytics, cercetări de piață și pregătirea deciziilor strategice.'],
    ['Menedzsment & operatív feladatok: számlázás, pénzügyi menedzsment, árképzés, rendelésfeldolgozás, folyamatoptimalizálás.', 'Management & operations: invoicing, financial management, pricing, order processing, process optimisation.', 'Management & operațional: facturare, management financiar, calcularea prețurilor, procesarea comenzilor, optimizarea fluxurilor.'],
    ['Kapcsolattartás a beszállítókkal és az ügyfélkommunikáció kezelése.', 'Liaising with suppliers and managing customer communication.', 'Menținerea relațiilor cu furnizorii și gestionarea comunicării cu clienții.'],
    ['E-commerce és bemutatkozó weboldalak fejlesztése PrestaShop és WordPress alapon.', 'Developing e-commerce and presentation websites on PrestaShop and WordPress.', 'Dezvoltarea de magazine online și site-uri de prezentare pe PrestaShop și WordPress.'],
    ['UX/UI testreszabás, SEO-alapok, GDPR-megfelelés.', 'UX/UI customisation, SEO basics, GDPR compliance.', 'Personalizare UX/UI, SEO de bază, conformitate GDPR.'],
    ['Ügyfelek kiszolgálása és tanácsadása a gyógyszertárban.', 'Serving and advising customers in the pharmacy.', 'Servirea și consilierea clienților în farmacie.'],
    ['Rendelések és készlet adminisztrációja.', 'Administration of orders and stock.', 'Administrarea comenzilor și a stocurilor.'],
    ['Adatgyűjtés, -rögzítés és statisztikai kimutatások készítése.', 'Data collection and entry, preparing statistical reports.', 'Colectarea și introducerea datelor, realizarea de rapoarte statistice.'],
    ['Mesterképzés – Üzletfejlesztési menedzsment', 'Master\'s degree – Business Development Management', 'Masterat în Managementul Dezvoltării Afacerilor'],
    ['Babeș-Bolyai Tudományegyetem', 'Babeș-Bolyai University', 'Universitatea Babeș-Bolyai'],
    ['Közgazdaság- és Gazdálkodástudományi Kar', 'Faculty of Economics and Business Administration', 'Facultatea de Științe Economice și Gestiunea Afacerilor'],
    ['Menedzsment', 'Management', 'Management'],
    ['EKKR 7. szint', 'EQF level 7', 'Nivelul 7 CEC'],
    ['Alapképzés (BA) – Vállalatgazdaságtan', 'Bachelor\'s degree (BA) – Business Economics', 'Licență în Științe Economice – Economia Firmei'],
    ['Üzleti adminisztráció', 'Business Administration', 'Administrarea Afacerilor'],
    ['EKKR 6. szint', 'EQF level 6', 'Nivelul 6 CEC'],
    ['Posztliceális oklevél – Gyógyszertári asszisztens', 'Post-secondary diploma – Pharmacy Assistant', 'Diplomă de școală postliceală – Asistent medical de farmacie'],
    ['„Gábor Áron” Egészségügyi Posztliceális Iskola', '"Gábor Áron" Medical Post-secondary School', 'Școala Postliceală Sanitară „Gábor Áron”'],
    ['Vezetői kompetenciafejlesztő program', 'Leadership Skills Development Programme', 'Program de dezvoltare a competențelor de leadership'],
    ['Érettségi – Társadalomtudományok', 'Baccalaureate – Social Sciences', 'Diplomă de bacalaureat – Științe sociale'],
    ['„Mikes Kelemen” Elméleti Líceum', '"Mikes Kelemen" Theoretical High School', 'Liceul Teoretic „Mikes Kelemen”'],
    ['Front-end fejlesztés', 'Front-end development', 'Dezvoltare Front-End'],
    ['Back-end & adatbázis', 'Back-end & databases', 'Dezvoltare Back-End & baze de date'],
    ['CMS & e-commerce', 'CMS & e-commerce', 'Platforme CMS & e-commerce'],
    ['Fejlesztői eszközök', 'Development tools', 'Instrumente de dezvoltare'],
    ['Design & generatív AI', 'Design & generative AI', 'Design & AI generativ'],
    ['Digitális marketing & SEO', 'Digital marketing & SEO', 'Marketing digital & SEO'],
    ['Személyes kompetenciák', 'Personal skills', 'Competențe personale'],
    ['Problémamegoldás', 'Problem solving', 'Rezolvarea problemelor'],
    ['Logikus gondolkodás', 'Logical thinking', 'Gândire logică'],
    ['Stressztűrés és kitartás', 'Stress tolerance and stamina', 'Rezistență la stres și anduranță'],
    ['Precizitás, részletorientáltság', 'Precision, attention to detail', 'Precizie și atenție la detalii'],
    ['Önfejlesztési motiváció', 'Motivation for self-development', 'Motivație pentru dezvoltare personală'],
    ['Office programok (haladó)', 'Office software (advanced)', 'Programe Office (avansat)'],
    ['Foci, kézilabda, kerékpározás, túrázás és hegyi kirándulások, kertészkedés és növénygondozás, fotózás (képszerkesztéssel együtt), webdesign és weboldalkészítés, főzés.',
      'Football, handball, cycling, hiking and mountain trips, gardening and plant care, photography (including photo editing), web design and website building, cooking.',
      'Fotbal, handbal, ciclism, drumeții în natură și explorări montane, grădinărit și îngrijirea plantelor, foto (inclusiv editarea imaginii), design web și crearea de site-uri, gătit.'],
    ['Személyes fejlődés és csapatvezetés', 'Personal development and team leadership', 'Dezvoltare personală și leadership în echipă'],
    ['Gazdasági-pénzügyi elemzés és adatalapú döntéshozatal', 'Economic and financial analysis, data-driven decision making', 'Analiză economico-financiară și luarea deciziilor pe bază de date'],
    ['Üzletfejlesztés és vállalkozás', 'Business development and entrepreneurship', 'Dezvoltarea afacerilor și antreprenoriat'],
    ['Adminisztratív folyamatok optimalizálása, digitális eszközök használata', 'Optimising administrative processes, using digital tools', 'Optimizarea proceselor administrative și utilizarea instrumentelor digitale']
  ].forEach(function (x) { DJP.T(x[0], x[1], x[2]); });

  /* Felturbózás: 5 kérdés – ügyfélkapcsolat, szoftverek, eredmények, román nyelv, motiváció (a 6. – kezdés – kimarad) */
  function boostFive(base) { return base.slice(0, 5); }

  /* Felturbózás kérdései – az álláshirdetés követelményeihez kötve */
  DJP.boostQuestions = function (job) {
    return boostFive([
      {
        id: 'q1', req: 'comm',
        q: 'Volt már tapasztalatod telefonos vagy személyes ügyfélkommunikációban?',
        hint: 'A hirdetés kiemelten kéri a bejövő és kimenő hívások kezelését (' + job.company + ').',
        chips: ['Igen, gyógyszertárban napi 40–60 ügyféllel', 'Igen, beszállítókkal telefonon és e-mailben', 'Webshop-ügyfélszolgálat (e-mail, chat)'],
        multi: true
      },
      {
        id: 'q2', req: 'crm',
        q: 'Milyen CRM-et, ügyfélnyilvántartót vagy adminrendszert használtál?',
        hint: 'A pozícióban az ügyféladatokat CRM-ben kell rögzíteni (elvárt szint: 3/5).',
        chips: ['PrestaShop admin (rendelések, ügyfelek)', 'Google Analytics', 'Gyógyszertári nyilvántartó szoftver', 'Excel / Google Sheets'],
        multi: true
      },
      {
        id: 'q3', req: 'sales',
        q: 'Van számszerűsíthető eredményed értékesítésben vagy ügyfélkezelésben?',
        hint: 'A számok (%, darab, ügyfél/nap) jelentősen erősítik a CV-t.',
        chips: ['A webshop konverziós aránya ~25%-kal nőtt az új UX után', 'Havonta 300+ online rendelés feldolgozása', 'PPC-kampányokkal ~2× több organikus + fizetett látogató'],
        multi: true
      },
      {
        id: 'q4', req: 'ro',
        q: 'Milyen szinten beszélsz románul szóban és írásban?',
        hint: 'A CV-dből kiolvastuk: C1. A hirdetés tárgyalóképes szintet kér.',
        chips: ['C1 – magabiztos szóban és írásban is', 'Telefonon is gördülékenyen', 'Hivatalos e-maileket is írok románul'],
        multi: true,
        prefill: 'C1 – magabiztos szóban és írásban is'
      },
      {
        id: 'q5', req: 'soft',
        q: 'Mi vonz a képzési, felnőttoktatási területen?',
        hint: 'Az új kolléga a ' + job.projects + ' projekteken dolgozik majd.',
        chips: ['Szeretek embereknek segíteni a fejlődésben', 'Magam is folyamatosan tanulok (Coursera, Codecademy)', 'Fontos számomra a régió fejlődése'],
        multi: true
      },
      {
        id: 'q6', req: 'soft',
        q: 'Vállalod a kolozsvári irodai munkát, és mikortól tudnál kezdeni?',
        hint: 'Teljes munkaidő, törzsidő 8:00–16:30, a kezdés akár holnaptól.',
        chips: ['Igen, Kolozsvárra költözöm', 'Azonnal kezdeni tudok', '2 hét felmondási idővel'],
        multi: true
      }
    ]);
  };

  /* Felturbózás bármilyen feltöltött CV-hez (nem a demó adataira szabott válaszlehetőségek) */
  DJP.boostQuestionsGeneric = function (job, cv) {
    var lg = (cv && cv.sections || []).find(function (s) { return s.kind === 'languages'; });
    var ro = lg && lg.items.find(function (l) { var c = DJP.langCanon && DJP.langCanon(l.name); return c && c[0] === 'Román'; });
    var roPre = ro ? (ro.level === 'Anyanyelv' ? 'Anyanyelvi szinten' : /C[12]/.test(ro.level) ? 'C1 – magabiztos szóban és írásban' : /B[12]/.test(ro.level) ? 'B2 – tárgyalóképes' : 'Alapszinten') : '';
    return boostFive([
      { id: 'q1', req: 'comm', multi: true,
        q: 'Milyen ügyfél- vagy partnerkapcsolati tapasztalatod van?',
        hint: job ? DJP.Az(job.company) + ' hirdetése kiemelten kéri az ügyfélkommunikációt – ebből írjuk a bemutatkozást.' : 'Ebből írjuk meg a bemutatkozásod első mondatait.',
        chips: ['Személyes ügyfélkiszolgálás', 'Telefonos ügyfélszolgálat', 'E-mailes / chates ügyfélkezelés', 'Kapcsolattartás partnerekkel, beszállítókkal'] },
      { id: 'q2', req: 'crm', multi: true,
        q: 'Milyen szoftvereket, nyilvántartó- vagy CRM-rendszereket használtál?',
        hint: job ? 'A pozícióban az ügyféladatokat CRM-ben kell rögzíteni.' : 'Ezek külön készségcsoportként kerülnek a CV-dbe.',
        chips: ['Microsoft Office', 'Excel / Google Sheets', 'CRM (pl. Salesforce, HubSpot, Pipedrive)', 'Számlázó- vagy ERP-rendszer'] },
      { id: 'q3', req: 'sales', multi: true,
        q: 'Van számszerűsíthető eredményed?',
        hint: 'A számok (%, darab, ügyfél/nap) jelentősen erősítik a CV-t – írd be a sajátodat is.',
        chips: ['Napi 30+ ügyfél vagy megkeresés kezelése', 'Az eredmények / forgalom 10–20%-os növelése', 'Csapat vagy projekt koordinálása', 'Folyamat gyorsítása vagy egyszerűsítése'] },
      { id: 'q4', req: 'ro', multi: false,
        q: 'Milyen szinten beszélsz románul szóban és írásban?',
        hint: (ro ? 'A CV-dből kiolvastuk: ' + ro.level + '. ' : 'A CV-dben nem találtunk román nyelvtudást. ') + (job ? 'A hirdetés tárgyalóképes szintet kér.' : ''),
        chips: ['Anyanyelvi szinten', 'C1 – magabiztos szóban és írásban', 'B2 – tárgyalóképes', 'Alapszinten'],
        prefill: roPre || undefined },
      { id: 'q5', req: 'soft', multi: true,
        q: job ? 'Mi vonz ebben az állásban?' : 'Mi motivál a következő munkahelyeden?',
        hint: 'Ezt a bemutatkozásban és a motivációs levélben is felhasználjuk.',
        chips: ['Szeretek embereknek segíteni a fejlődésben', 'Magam is folyamatosan tanulok', 'Fontos számomra a régió fejlődése'] },
      { id: 'q6', req: 'soft', multi: true,
        q: job && job.id === 'startuphub' ? 'Vállalod a kolozsvári irodai munkát, és mikortól tudnál kezdeni?' : 'Mikortól tudnál kezdeni?',
        hint: job && job.id === 'startuphub' ? 'Teljes munkaidő, törzsidő 8:00–16:30, a kezdés akár holnaptól.' : 'Rendelkezésre állásként kerül a CV-be.',
        chips: (job && job.id === 'startuphub' ? ['Igen, Kolozsvárra költözöm'] : []).concat(['Azonnal kezdeni tudok', '2 hét felmondási idővel']) }
    ]);
  };

  /* Új CV AI-val: 10 lépés, mindegyik a hozzá illő mezőkkel (lépésről lépésre oldal); ezekből az AI megírja az önéletrajzot.
     A javaslatok kattintásra kitöltik a mezőket (tapasztalat, tanulmány, projekt: egész bejegyzés). */
  DJP.newCvAiQuestions = function (job) {
    var jt = job ? job.title.replace(/\s*\(.*\)/, '') : '';
    return [
      { id: 'g1', title: 'Szakmai megnevezés', q: 'Mi a jelenlegi munkaköröd, vagy milyen szerepkört keresel elsősorban?',
        hint: 'Ebből lesz az önéletrajz címsora.' + (job ? ' A megpályázott pozíció: ' + jt + '.' : ''),
        sugg: (jt ? [jt] : []).concat(['Online marketing specialista', 'Projektkoordinátor', 'Irodai asszisztens']).filter(function (x, i, a) { return a.indexOf(x) === i; }) },
      { id: 'g2', title: 'Szakmai bemutatkozás', q: '2–3 mondatban hogyan jellemeznéd a szakmai hátteredet, legnagyobb erősségeidet és karriercéljaidat?',
        hint: 'Nem kell tökéletesnek lennie – az AI ebből írja meg a bemutatkozást.',
        sugg: ['Ügyfélközpontú és megbízható vagyok.', 'Erősségem a kommunikáció és a pontosság.', 'Szeretek emberekkel dolgozni és problémákat megoldani.', 'Hosszú távon ügyfélkapcsolati területen szeretnék fejlődni.'] },
      { id: 'g3', title: 'Munkatapasztalat', q: 'Sorold fel a jelenlegi és legutóbbi pozícióidat: munkakör, cégnév és időszak.',
        hint: 'A legutóbbival kezdd. Ha pályakezdő vagy, ezt a lépést kihagyhatod.',
        sugg: [
          { label: 'Online marketing specialista – Vitafarm SRL', v: { title: 'Online marketing specialista', company: 'Vitafarm SRL', start: '2023', end: '', current: true } },
          { label: 'Gyógyszertári asszisztens – Vitafarm SRL', v: { title: 'Gyógyszertári asszisztens', company: 'Vitafarm SRL', start: '2020', end: '2023', current: false } },
          { label: 'Szabadúszó webfejlesztő', v: { title: 'Szabadúszó webfejlesztő', company: 'Önálló tevékenység', start: '2023', end: '', current: true } }] },
      { id: 'g4', title: 'Feladatok és eredmények', q: 'Mik voltak a fő feladataid, és mi 2–3 eredmény, amire a legbüszkébb vagy? Ha tudsz, írj számokat is.',
        hint: 'A számok (%, darab, ügyfél/nap) jelentősen erősítik a CV-t – az AI eredményorientált pontokba szedi.',
        suggTasks: ['Ügyfelek személyes és telefonos kiszolgálása', 'Rendelések és ügyféladatok pontos rögzítése', 'Kapcsolattartás beszállítókkal és partnerekkel', 'Webshop-üzemeltetés és online marketing'],
        suggResults: ['Napi 40–60 ügyfél kiszolgálása', 'A webshop konverziója kb. 25%-kal nőtt', 'Havonta 300+ online rendelés feldolgozása'] },
      { id: 'g5', title: 'Tanulmányok', q: 'Mi a végzettséged? Add meg a képzettséget, szakot, intézményt és a végzés évét.',
        hint: 'A legmagasabb végzettséggel kezdd.' + (job ? ' A hirdetés BA diplomát vár.' : ''),
        sugg: [
          { label: 'Mesterképzés – Üzletfejlesztési menedzsment (BBTE)', v: { degree: 'Mesterképzés', field: 'Üzletfejlesztési menedzsment', school: 'Babeș-Bolyai Tudományegyetem', year: '2023' } },
          { label: 'Alapképzés (BA) – Vállalatgazdaságtan (BBTE)', v: { degree: 'Alapképzés (BA)', field: 'Vállalatgazdaságtan', school: 'Babeș-Bolyai Tudományegyetem', year: '2021' } },
          { label: 'Érettségi', v: { degree: 'Érettségi', field: '', school: '', year: '2018' } }] },
      { id: 'g6', title: 'Alapkészségek', q: 'Sorold fel az 5–10 legfontosabb szakmai készségedet (hard és soft skillek).',
        hint: 'Írd be, majd Enter – vagy válassz a javaslatok közül.' + (job ? ' A hirdetés a kommunikációt, az ügyfélkezelést és a CRM-ismeretet emeli ki.' : ''),
        sugg: ['Kommunikáció', 'Ügyfélkezelés', 'Értékesítés', 'Pontosság', 'Csapatmunka', 'Problémamegoldás', 'Stressztűrés'] },
      { id: 'g7', title: 'Eszközök és technológiák', q: 'Milyen szoftverekben, platformokban vagy iparági eszközökben vagy jártas?',
        hint: 'Írd be, majd Enter – külön készségcsoportként kerülnek a CV-be.',
        sugg: ['Microsoft Office', 'Excel / Google Sheets', 'CRM-rendszerek', 'PrestaShop', 'WordPress', 'Google Analytics'] },
      { id: 'g8', title: 'Fontos projektek', opt: true, q: 'Írj le röviden egy-két jelentős projektet: mi volt a cél, és mi volt a te hozzájárulásod?',
        hint: 'Opcionális – kihagyhatod.',
        sugg: [
          { label: 'vitafarm.ro webáruház', v: { name: 'vitafarm.ro webáruház', desc: 'Online gyógyszertár elindítása – a teljes fejlesztést és üzemeltetést én vezettem.' } },
          { label: 'decorhaz.ro', v: { name: 'decorhaz.ro', desc: 'E-commerce platform bevezetése a nulláról – tervezés, fejlesztés, marketing.' } }] },
      { id: 'g9', title: 'Tanúsítványok és nyelvek', opt: true, q: 'Van releváns szakmai tanúsítványod? Beszélsz más nyelveket az anyanyelveden kívül?',
        hint: 'Opcionális.' + (job ? ' A pozícióhoz tárgyalóképes román nyelvtudás kell.' : ''),
        suggLangs: [{ label: 'Román – C1', v: { name: 'Román', level: 'C1' } }, { label: 'Angol – B2', v: { name: 'Angol', level: 'B2' } }, { label: 'Német – A2', v: { name: 'Német', level: 'A2' } }],
        suggCerts: [{ label: 'Google Ads tanúsítvány', v: { name: 'Google Ads tanúsítvány', issuer: 'Google', year: '2022' } }, { label: 'Ügyfélszolgálati tréning', v: { name: 'Ügyfélszolgálati és kommunikációs tréning', issuer: '', year: '' } }] },
      { id: 'g10', title: 'Jövőbeli szerepkör', q: 'Milyen munkakörnyezetet, iparágat vagy szerepkört keresel következőként?',
        hint: 'Ebből zárjuk a bemutatkozást – és a motivációs levélben is felhasználjuk.',
        suggRole: ['Ügyfélkapcsolati munkatárs', 'Értékesítési munkatárs', 'Projektkoordinátor'],
        suggIndustry: ['Képzés, felnőttoktatás', 'E-commerce', 'IT és szolgáltatások'] }
    ];
  };
  DJP.WORK_MODES = ['Irodai', 'Hibrid', 'Távmunka', 'Mindegy'];

  DJP.HR_STAT = '53%'; /* DreamJobs HR-statisztika: ennyivel nagyobb eséllyel jutnak tovább a motivációs levéllel jelentkezők */
})(window.DJP);

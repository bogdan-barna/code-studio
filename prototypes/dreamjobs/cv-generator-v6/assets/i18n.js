/* DreamJobs prototípus – CV nyelvi változatok (magyar / angol / román): feliratok, fordítási memória, szimulált AI-fordítás. */
(function (DJP) {
  /* SVG zászlók (Windows alatt az emoji-zászlók betűként jelennének meg) */
  function flag(inner, vb) { return '<svg class="djp-flagsvg" viewBox="' + vb + '" aria-hidden="true">' + inner + '</svg>'; }
  DJP.LANGS = [
    { id: 'hu', name: 'Magyar', short: 'HU', flag: flag('<rect width="3" height="2" fill="#477050"/><rect width="3" height="1.333" fill="#fff"/><rect width="3" height=".667" fill="#CE2939"/>', '0 0 3 2') },
    { id: 'en', name: 'English', short: 'EN', flag: flag('<rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#C8102E" stroke-width="7"/>', '0 0 60 40') },
    { id: 'ro', name: 'Română', short: 'RO', flag: flag('<rect width="1" height="2" fill="#002B7F"/><rect x="1" width="1" height="2" fill="#FCD116"/><rect x="2" width="1" height="2" fill="#CE1126"/>', '0 0 3 2') }
  ];

  /* sablon-feliratok */
  DJP.LBL = {
    hu: {
      details: 'Adatok', contact: 'Elérhetőség', links: 'Linkek', addr: 'Cím', phone: 'Telefon', email: 'E-mail',
      emailS: 'email', telS: 'tel', addrS: 'cím', made: ['Készült a', 'CV-generátorral · dreamjobs.ro'],
      phName: 'Neved', phHead: 'Kívánt pozíció', phLast: 'Vezetéknév', phFirst: 'Keresztnév', subject: 'Tárgy:',
      empty: 'Kezdd el kitölteni a bal oldali szakaszokat – az előnézet élőben frissül.', letterPh: 'A levél szövege itt jelenik meg.'
    },
    en: {
      details: 'Details', contact: 'Contact', links: 'Links', addr: 'Address', phone: 'Phone', email: 'E-mail',
      emailS: 'email', telS: 'phone', addrS: 'address', made: ['Made with the', 'CV Builder · dreamjobs.ro'],
      phName: 'Your name', phHead: 'Desired position', phLast: 'Last name', phFirst: 'First name', subject: 'Subject:',
      empty: 'Start filling in the sections on the left – the preview updates live.', letterPh: 'Your letter appears here.'
    },
    ro: {
      details: 'Date personale', contact: 'Contact', links: 'Linkuri', addr: 'Adresă', phone: 'Telefon', email: 'E-mail',
      emailS: 'email', telS: 'tel', addrS: 'adresă', made: ['Realizat cu', 'CV Generator · dreamjobs.ro'],
      phName: 'Numele tău', phHead: 'Poziția dorită', phLast: 'Nume', phFirst: 'Prenume', subject: 'Subiect:',
      empty: 'Începe să completezi secțiunile din stânga – previzualizarea se actualizează live.', letterPh: 'Textul scrisorii apare aici.'
    }
  };

  var SEC = {
    profile: ['Bemutatkozás', 'Profile', 'Despre mine'],
    experience: ['Szakmai tapasztalat', 'Work experience', 'Experiență profesională'],
    education: ['Tanulmányok', 'Education', 'Educație și formare'],
    courses: ['Kurzusok és tanúsítványok', 'Courses and certificates', 'Cursuri și certificări'],
    projects: ['Projektek', 'Projects', 'Proiecte'],
    internships: ['Szakmai gyakorlat', 'Internships', 'Stagii de practică'],
    references: ['Referenciák', 'References', 'Referințe'],
    skills: ['Készségek', 'Skills', 'Competențe'],
    languages: ['Nyelvtudás', 'Languages', 'Competențe lingvistice'],
    achievements: ['Eredmények', 'Achievements', 'Realizări'],
    hobbies: ['Hobbik', 'Hobbies', 'Hobby-uri'],
    interests: ['Érdeklődési körök', 'Interests', 'Teme de interes'],
    driving: ['Jogosítvány', 'Driving licence', 'Permis de conducere'],
    salary: ['Bérigény', 'Salary expectation', 'Așteptări salariale'],
    values: ['Ezek fontosak egy munkahelynél', 'What matters to me at work', 'Ce contează pentru mine la un loc de muncă'],
    traits: ['Ilyen vagyok', 'This is me', 'Așa sunt eu'],
    custom: ['Egyéni szakasz', 'Custom section', 'Secțiune personalizată']
  };
  var EXTRA = {
    birthDate: ['Születési dátum', 'Date of birth', 'Data nașterii'],
    birthPlace: ['Születési hely', 'Place of birth', 'Locul nașterii'],
    driving: ['Jogosítvány', 'Driving licence', 'Permis de conducere'],
    gender: ['Nem', 'Gender', 'Gen'],
    nationality: ['Állampolgárság', 'Nationality', 'Cetățenie'],
    civil: ['Családi állapot', 'Marital status', 'Stare civilă'],
    website: ['Weboldal', 'Website', 'Website'],
    linkedin: ['LinkedIn', 'LinkedIn', 'LinkedIn'],
    facebook: ['Facebook', 'Facebook', 'Facebook'],
    whatsapp: ['WhatsApp', 'WhatsApp', 'WhatsApp'],
    address2: ['Második cím', 'Second address', 'A doua adresă']
  };
  var LEVEL = {
    'Anyanyelv': ['Anyanyelv', 'Native', 'Limbă maternă'],
    'Kezdő': ['Kezdő', 'Beginner', 'Începător'], 'Közepes': ['Közepes', 'Intermediate', 'Mediu'],
    'Haladó': ['Haladó', 'Advanced', 'Avansat'], 'Szakértő': ['Szakértő', 'Expert', 'Expert'],
    'Alapszint': ['Alapszint', 'Elementary', 'Elementar']
  };
  var IDX = { hu: 0, en: 1, ro: 2 };

  DJP.lbl = function (lang, key) { return (DJP.LBL[lang] || DJP.LBL.hu)[key]; };
  DJP.secTitle = function (kind, lang) { return SEC[kind] ? SEC[kind][IDX[lang] || 0] : ''; };
  DJP.extraLabel = function (key, lang) { return EXTRA[key] ? EXTRA[key][IDX[lang] || 0] : key; };
  DJP.levelLabel = function (lvl, lang) { return LEVEL[lvl] ? LEVEL[lvl][IDX[lang] || 0] : lvl; };

  /* ---------- fordítási memória: T(hu, en, ro) regisztrál és a magyar szöveget adja vissza ---------- */
  DJP.TM = DJP.TM || {};
  DJP.T = function (hu, en, ro) { DJP.TM[hu] = { en: en, ro: ro }; return hu; };
  var T = DJP.T;

  /* gyakori kifejezések (részleges csere, pl. készség-szintek) */
  var PHRASES = [
    ['(haladó)', '(advanced)', '(avansat)'], ['(kezdő)', '(beginner)', '(începător)'], ['(közepes)', '(intermediate)', '(mediu)'],
    ['Generatív AI', 'Generative AI', 'AI generativ'], ['SEO & GEO optimalizálás', 'SEO & GEO optimisation', 'Optimizare SEO & GEO'],
    ['Drupal, Joomla', 'Drupal, Joomla', 'Drupal, Joomla'], ['jelenleg', 'present', 'prezent'], ['folyamatban', 'ongoing', 'în curs']
  ];
  var IMPACT = [
    [' – mérhetően gyorsítva a folyamatokat', ' – measurably speeding up processes', ' – accelerând vizibil procesele'],
    [' – javítva az ügyfél-elégedettséget', ' – improving customer satisfaction', ' – îmbunătățind satisfacția clienților'],
    [' – csökkentve a hibák számát', ' – reducing the number of errors', ' – reducând numărul erorilor'],
    [' – növelve a csapat hatékonyságát', ' – increasing team efficiency', ' – crescând eficiența echipei']
  ];

  var HU_CHARS = /[áéíóöőúüű]/i;
  var missing = 0;

  function trCore(s, lang) {
    var k = s.trim();
    if (!k) return s;
    if (DJP.TM[k]) return DJP.TM[k][lang];
    var i = IDX[lang];
    for (var j = 0; j < IMPACT.length; j++) {
      var suf = IMPACT[j][0];
      if (k.endsWith(suf) || k.endsWith(suf + '.')) {
        var base = k.slice(0, k.lastIndexOf(suf));
        var tb = DJP.TM[base] || DJP.TM[base + '.'];
        if (tb) return tb[lang].replace(/\.$/, '') + IMPACT[j][i] + '.';
      }
    }
    var out = k;
    PHRASES.forEach(function (p) { out = out.split(p[0]).join(p[i]); });
    if (HU_CHARS.test(out) && out.split(' ').length > 1) missing += 1;
    return out;
  }

  /* egy szöveg fordítása: sorok, „ · ” elválasztott részek, felsorolásjelek megtartásával */
  DJP.tr = function (s, lang) {
    if (!s || lang === 'hu') return s;
    if (DJP.TM[s.trim()]) return DJP.TM[s.trim()][lang];
    if (s.indexOf('\n') >= 0) return s.split('\n').map(function (l) { return DJP.tr(l, lang); }).join('\n');
    var m = s.match(/^(\s*[•\-–*]\s*)(.*)$/);
    if (m) return m[1] + DJP.tr(m[2], lang);
    if (s.indexOf(' · ') >= 0) return s.split(' · ').map(function (p) { return trCore(p, lang); }).join(' · ');
    return trCore(s, lang);
  };

  /* teljes CV fordítása; az AI által írt mezőknél a generáláskor eltett nyelvi változatot használja */
  DJP.translateCV = function (cv, lang) {
    missing = 0;
    var c = DJP.clone(cv);
    c.lang = lang;
    var tr = function (s) { return DJP.tr(s, lang); };
    function pick(obj, field) {
      var v = obj.i18n && obj.i18n[field];
      if (v && v.hu === obj[field] && v[lang]) return v[lang];
      return tr(obj[field]);
    }
    var p = c.personal;
    p.headline = pick(p, 'headline');
    p.city = tr(p.city);
    (p.extra || []).forEach(function (e) { e.label = DJP.extraLabel(e.key, lang); e.value = tr(e.value); });
    c.sections.forEach(function (s) {
      var defHu = DJP.secTitle(s.kind, 'hu');
      s.title = s.title === defHu ? DJP.secTitle(s.kind, lang) : tr(s.title);
      if (s.type === 'text') s.text = pick(s, 'text');
      (s.items || []).forEach(function (it) {
        ['title', 'subtitle', 'city', 'start', 'end', 'name', 'detail'].forEach(function (f) { if (it[f]) it[f] = tr(it[f]); });
        if (it.desc) it.desc = pick(it, 'desc');
      });
    });
    return { cv: c, missing: missing };
  };

  /* ---------- állandó szövegek (a demó CV-n kívül) ---------- */
  T('Sepsiszentgyörgy', 'Sfântu Gheorghe', 'Sfântu Gheorghe');
  T('Online, Románia', 'Online, Romania', 'Online, România');
  T('Gyula, Magyarország', 'Gyula, Hungary', 'Gyula, Ungaria');
  T('Barót', 'Baraolt', 'Baraolt');
  T('Online', 'Online', 'Online');
  T('Rendelkezésre állás', 'Availability', 'Disponibilitate');
  T('Magyar', 'Hungarian', 'Maghiară');
  T('Román', 'Romanian', 'Română');
  T('Angol', 'English', 'Engleză');
  T('Német', 'German', 'Germană');
  T('B kategória', 'Category B', 'Categoria B');
  /* címkék javaslatai */
  [['Fejlődési lehetőség', 'Opportunities to grow', 'Oportunități de dezvoltare'], ['Jó csapat', 'A great team', 'O echipă bună'],
    ['Rugalmas munkaidő', 'Flexible hours', 'Program flexibil'], ['Stabilitás', 'Stability', 'Stabilitate'], ['Képzések', 'Training', 'Cursuri de formare'],
    ['Hibrid munka', 'Hybrid work', 'Muncă hibridă'], ['Értelmes munka', 'Meaningful work', 'Muncă cu sens'],
    ['Proaktív', 'Proactive', 'Proactiv'], ['Megbízható', 'Reliable', 'De încredere'], ['Kommunikatív', 'Communicative', 'Comunicativ'],
    ['Precíz', 'Precise', 'Precis'], ['Csapatjátékos', 'Team player', 'Jucător de echipă'], ['Kitartó', 'Persistent', 'Perseverent'],
    ['Segítőkész', 'Helpful', 'Săritor'], ['Szorgalmas', 'Hard-working', 'Harnic'], ['Felelősségteljes', 'Responsible', 'Responsabil'],
    ['Pontos', 'Punctual', 'Punctual'], ['Türelmes', 'Patient', 'Răbdător'], ['Stressztűrő', 'Resilient under pressure', 'Rezistent la stres']
  ].forEach(function (x) { T(x[0], x[1], x[2]); });
  /* AI készségjavaslatok */
  [['Telefonos ügyfélkommunikáció', 'Phone customer communication', 'Comunicare telefonică cu clienții'],
    ['CRM-rendszerek használata', 'Using CRM systems', 'Utilizarea sistemelor CRM'],
    ['Értékesítési és ügyfélkapcsolati készségek', 'Sales and customer relations skills', 'Abilități de vânzări și relații cu clienții'],
    ['Adatrögzítés és adminisztráció', 'Data entry and administration', 'Introducere date și administrare'],
    ['Panaszkezelés', 'Complaint handling', 'Gestionarea reclamațiilor'],
    ['Csapatmunka és kommunikáció', 'Teamwork and communication', 'Lucru în echipă și comunicare'],
    ['Proaktivitás', 'Proactivity', 'Proactivitate'],
    ['Precizitás és felelősségvállalás', 'Precision and responsibility', 'Precizie și responsabilitate']
  ].forEach(function (x) { T(x[0], x[1], x[2]); });
  /* AI tapasztalat-pontok (új CV) */
  [['Napi szinten ügyfelek személyes és telefonos kiszolgálása, kérdéseik gyors megválaszolása.', 'Serving customers daily in person and by phone, answering their questions quickly.', 'Servirea zilnică a clienților, personal și telefonic, și răspunsul rapid la întrebările lor.'],
    ['Ügyféladatok és rendelések pontos rögzítése a nyilvántartó rendszerben.', 'Accurately recording customer data and orders in the records system.', 'Înregistrarea precisă a datelor clienților și a comenzilor în sistemul de evidență.'],
    ['Panaszkezelés és utánkövetés – javítva az ügyfél-elégedettséget.', 'Complaint handling and follow-up – improving customer satisfaction.', 'Gestionarea reclamațiilor și follow-up – îmbunătățind satisfacția clienților.'],
    ['Szoros együttműködés a kollégákkal a határidők betartása érdekében.', 'Close cooperation with colleagues to meet deadlines.', 'Colaborare strânsă cu colegii pentru respectarea termenelor.'],
    ['Kapcsolattartás kollégákkal és partnerekkel, határidők betartása.', 'Liaising with colleagues and partners, meeting deadlines.', 'Colaborarea cu colegii și partenerii, respectarea termenelor.']
  ].forEach(function (x) { T(x[0], x[1], x[2]); });
})(window.DJP);

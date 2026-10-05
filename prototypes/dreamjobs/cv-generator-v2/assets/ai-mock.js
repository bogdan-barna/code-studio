/* DreamJobs prototípus – szimulált AI. Előre megírt, erre az állásra és a demó CV-re szabott kimenetek. */
(function (DJP) {
  var ai = {};

  ai.wait = function (ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  };

  /* Fokozatos "gépelés": setter(részszöveg) hívása animációs képkockánként */
  ai.typeText = function (setter, text, opts) {
    opts = opts || {};
    var total = text.length;
    var step = Math.max(2, Math.ceil(total / (opts.frames || 80)));
    var i = 0;
    return new Promise(function (resolve) {
      function tick() {
        i = Math.min(total, i + step);
        setter(text.slice(0, i), i >= total);
        if (i < total) setTimeout(tick, 16); else resolve(text);
      }
      tick();
    });
  };

  /* ---------- segédek ---------- */
  function sec(cv, kind) {
    return cv.sections.find(function (s) { return s.kind === kind; });
  }
  function fullName(cv) {
    return [cv.personal.lastName, cv.personal.firstName].filter(Boolean).join(' ');
  }
  function flatten(cv) {
    var parts = [cv.personal.headline];
    cv.sections.forEach(function (s) {
      parts.push(s.title);
      if (s.text) parts.push(s.text);
      (s.items || []).forEach(function (it) {
        parts.push(it.title, it.subtitle, it.desc, it.name, it.detail, it.level);
      });
    });
    return parts.filter(Boolean).join(' \n ').toLowerCase();
  }
  function lc(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function uc(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function sentences(t) { return (t.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [t]).map(function (x) { return x.trim(); }).filter(Boolean); }

  /* ---------- illeszkedés az álláshoz (kulcsszó alapú becslés) ---------- */
  var RULES = {
    crm: { full: /crm/, partial: /adatbázis|nyilvántart|prestashop|admin/ },
    comm: { full: /(telefonos|személyes)[^.\n]{0,30}ügyfél|ügyfélkommunikáció[^.\n]{0,40}(telefon|napi)|kommunikációs készség/, partial: /kommunikáció/ },
    sales: { full: /értékesít/, partial: /rendelés|konverzió|kampány/ },
    ba: { full: /alapképzés|\(ba\)|bachelor|mesterképzés|egyetem/, partial: /líceum|érettségi/ },
    ro: { full: /román[^\n]{0,30}(c1|c2|anyanyelv|tárgyalóképes|b2)/, partial: /román/ },
    phone: { full: /telefon/, partial: /ügyfelek kiszolgálása|ügyfél/ },
    soft: { full: /proaktív|csapatmunka|csapatjátékos/, partial: /precizitás|kitartás|pontos|felelős/ },
    pm: { full: /projektmenedzs|project manag/, partial: /projekt/ },
    office: { full: /office/, partial: /excel|word/ }
  };
  ai.match = function (cv, job) {
    if (!job) return null;
    var text = flatten(cv);
    var reqs = job.requirements.map(function (r) {
      var rule = RULES[r.key] || { full: new RegExp(r.label.toLowerCase().split(' ')[0]), partial: /$^/ };
      var st = rule.full.test(text) ? 1 : (rule.partial.test(text) ? 0.5 : 0);
      return { key: r.key, label: r.label, need: r.need, status: st };
    });
    var sum = reqs.reduce(function (a, r) { return a + r.status; }, 0);
    var score = Math.min(94, Math.round(sum / reqs.length * 100));
    return { score: score, reqs: reqs };
  };

  /* ---------- szöveg átírása (kijelölés-eszköztár) ---------- */
  var SYN = [
    ['Motivált', 'Elkötelezett'], ['szenvedéllyel', 'lelkesedéssel'], ['ötvözöm', 'kombinálom'], ['Célom', 'Törekvésem'],
    ['felelek', 'felelős vagyok'], ['kezelése', 'menedzselése'], ['biztosítása', 'garantálása'], ['nagy', 'jelentős'],
    ['segít', 'támogat'], ['fontos', 'lényeges'], ['érdeklődéssel', 'lelkesedéssel'], ['dolgozom', 'tevékenykedem'],
    ['szeretnék', 'szívesen'], ['gyorsan', 'rövid idő alatt'], ['folyamatos', 'állandó'], ['teljes körű', 'átfogó']
  ];
  var FORMAL = [
    [/\bcsináltam\b/g, 'végeztem'], [/\bsok\b/g, 'számos'], [/\bnagyon\b/g, 'kiemelten'], [/\bjó\b/g, 'kiváló'],
    [/\bsegítettem\b/g, 'támogattam'], [/\bkb\.\s?/g, 'mintegy '], [/\bszeretek\b/g, 'kiemelten fontosnak tartom, hogy'],
    [/\bKedves\b/g, 'Tisztelt'], [/\bÜdvözlettel\b/g, 'Tisztelettel'], [/!/g, '.']
  ];
  var MORE = {
    en: ['As a result, I handle customer questions confidently and always focus on fast, accurate solutions.', 'All of this directly improved the user experience and sales results.', 'For me, continuous learning is not an obligation but the basis of my professional growth.', 'I would put this experience to good use in my new role as well.'],
    ro: ['Datorită acestui lucru, gestionez cu încredere întrebările clienților și mă concentrez mereu pe soluții rapide și precise.', 'Toate acestea au contribuit direct la îmbunătățirea experienței utilizatorilor și a rezultatelor de vânzări.', 'Pentru mine, învățarea continuă nu este o obligație, ci baza dezvoltării mele profesionale.', 'Aș valorifica eficient această experiență și în noul rol.']
  };
  ai.rewrite = function (text, mode, lang) {
    var t = text.trim();
    if (!t) return text;
    if (lang && lang !== 'hu') {
      if (mode === 'shorter') return ai.rewrite(text, 'shorter');
      var ss2 = sentences(t);
      if (mode === 'longer') {
        var i = /customer|client|ügyfél/i.test(t) ? 0 : /web|e-commerce|seo|shop|magazin/i.test(t) ? 1 : /course|learn|curs|învăț/i.test(t) ? 2 : 3;
        return t.replace(/[.!?]?$/, '.') + ' ' + MORE[lang][i];
      }
      if (ss2.length > 1) return ss2.slice(1).concat(ss2[0]).join(' ');
      return (lang === 'en' ? 'Successfully: ' : 'Cu succes: ') + lc(t);
    }
    if (mode === 'shorter') {
      var ss = sentences(t);
      if (ss.length > 1) return ss.slice(0, Math.max(1, Math.ceil(ss.length * 0.55))).join(' ');
      var c = t.indexOf(',', 40);
      return c > 0 ? t.slice(0, c).replace(/[.]?$/, '.') : t.replace(/\s*\([^)]*\)/g, '');
    }
    if (mode === 'longer') {
      var add;
      if (/ügyfél|vevő|kliens/i.test(t)) add = 'Ennek köszönhetően magabiztosan kezelem az ügyfelek kérdéseit, és mindig a gyors, pontos megoldásra fókuszálok.';
      else if (/web|e-commerce|prestashop|webáruház|seo/i.test(t)) add = 'Mindez közvetlenül hozzájárult a felhasználói élmény és az értékesítési eredmények javításához.';
      else if (/képzés|tanul|kurzus/i.test(t)) add = 'A folyamatos tanulás számomra nem kötelesség, hanem a szakmai fejlődésem alapja.';
      else add = 'Ezt a tapasztalatot az új munkakörben is hatékonyan kamatoztatnám.';
      return t.replace(/[.!?]?$/, '.') + ' ' + add;
    }
    if (mode === 'formal') {
      var f = t;
      FORMAL.forEach(function (p) { f = f.replace(p[0], p[1]); });
      if (f === t) f = f.replace(/^Én\s+/, '').replace(/\bvagyok\b/, 'vagyok,') .replace(/,,/g, ',');
      return f === t ? 'Szakmai pályafutásom során ' + lc(t) : f;
    }
    // rephrase
    var r = t;
    SYN.forEach(function (p) { r = r.split(p[0]).join(p[1]); });
    if (r === t) {
      var parts = sentences(t);
      r = parts.length > 1 ? parts.slice(1).concat(parts[0]).join(' ') : 'Eredményesen ' + lc(t);
    }
    return r;
  };

  /* ---------- Bemutatkozás ---------- */
  ai.profileFor = function (cv, job) {
    var exp = sec(cv, 'experience');
    var skills = sec(cv, 'skills');
    var langs = sec(cv, 'languages');
    var e0 = exp && exp.items.find(function (i) { return i.title; });
    var ro = langs && langs.items.find(function (l) { return /román/i.test(l.name); });
    var sk = skills ? skills.items.filter(function (s) { return s.name; }).slice(0, 3).map(function (s) { return lc(s.name); }) : [];
    var out = [];
    out.push((job ? 'Ügyfélközpontú, megbízható szakember vagyok' : 'Megbízható, fejlődésorientált szakember vagyok') +
      (e0 ? ', ' + lc(e0.title) + ' pozícióban szerzett tapasztalattal' + (e0.subtitle ? ' (' + e0.subtitle + ')' : '') : '') + '.');
    if (sk.length) out.push('Erősségeim közé tartozik ' + DJP.az(sk.join(', ')) + '.');
    else if (job) out.push('Erősségem a világos, segítőkész kommunikáció és a pontos, megbízható adminisztráció.');
    out.push('Magyar anyanyelvem mellett ' + (ro ? (ro.level === 'Anyanyelv' ? 'anyanyelvi' : ro.level + ' szinten') : 'tárgyalóképes szinten') +
      ' beszélek románul, így mindkét nyelven gördülékenyen kommunikálok szóban és írásban.');
    if (job) out.push('Olyan ' + lc(job.title) + ' pozíciót keresek, ahol a személyes ügyfélkapcsolatot és a pontos munkavégzést egyaránt kamatoztathatom ' + DJP.az(job.company) + ' csapatában.');
    else out.push('Olyan csapatot keresek, ahol felelősséget vállalhatok, és folyamatosan fejlődhetek.');
    return out.join(' ');
  };

  /* ugyanez angolul és románul is – a CV fordításakor ezt használjuk */
  ai.profileForAll = function (cv, job) {
    var exp = sec(cv, 'experience');
    var skills = sec(cv, 'skills');
    var langs = sec(cv, 'languages');
    var e0 = exp && exp.items.find(function (i) { return i.title; });
    var ro = langs && langs.items.find(function (l) { return /román|romanian|română/i.test(l.name); });
    var sk = skills ? skills.items.filter(function (s) { return s.name; }).slice(0, 3) : [];
    var lvl = ro ? ro.level : '';
    function build(L) {
      var tr = function (x) { return DJP.tr(x, L); };
      var jt = job ? (job.titleI18n && job.titleI18n[L]) || job.title : '';
      var out = [];
      if (L === 'en') {
        out.push((job ? 'Customer-focused, reliable professional' : 'Reliable, growth-minded professional') + (e0 ? ' with experience as ' + tr(e0.title) + (e0.subtitle ? ' (' + e0.subtitle + ')' : '') : '') + '.');
        out.push(sk.length ? 'My strengths include ' + sk.map(function (s) { return lc(tr(s.name)); }).join(', ') + '.' : 'My strengths are clear, helpful communication and accurate, reliable administration.');
        out.push('Alongside my native Hungarian, I speak Romanian ' + (lvl && lvl !== 'Anyanyelv' ? 'at ' + lvl + ' level' : lvl ? 'as a native speaker' : 'fluently') + ', so I communicate easily in both languages, orally and in writing.');
        out.push(job ? 'I am looking for a ' + jt + ' role in the ' + job.company + ' team where I can use both personal customer contact and precise work.' : 'I am looking for a team where I can take responsibility and keep growing.');
      } else {
        out.push((job ? 'Profesionist orientat către client și de încredere' : 'Profesionist de încredere, orientat spre dezvoltare') + (e0 ? ', cu experiență ca ' + lc(tr(e0.title)) + (e0.subtitle ? ' (' + e0.subtitle + ')' : '') : '') + '.');
        out.push(sk.length ? 'Punctele mele forte includ ' + sk.map(function (s) { return lc(tr(s.name)); }).join(', ') + '.' : 'Punctele mele forte sunt comunicarea clară și săritoare și administrarea precisă și de încredere.');
        out.push('Pe lângă limba maternă maghiară, vorbesc limba română ' + (lvl && lvl !== 'Anyanyelv' ? 'la nivel ' + lvl : 'fluent') + ', astfel încât comunic ușor în ambele limbi, oral și în scris.');
        out.push(job ? 'Caut un rol de ' + lc(jt) + ' în echipa ' + job.company + ', unde să valorific atât relația directă cu clienții, cât și munca precisă.' : 'Caut o echipă în care să îmi asum responsabilități și să mă dezvolt continuu.');
      }
      return out.join(' ');
    }
    return { hu: ai.profileFor(cv, job), en: build('en'), ro: build('ro') };
  };

  /* ---------- Tapasztalat-pontok eredményorientált átírása ---------- */
  var IMPACT = [' – mérhetően gyorsítva a folyamatokat', ' – javítva az ügyfél-elégedettséget', ' – csökkentve a hibák számát', ' – növelve a csapat hatékonyságát'];
  ai.improveEntry = function (item, job, lang) {
    if (lang && lang !== 'hu') {
      if (!(item.desc || '').trim() && !/ügyfél|eladó|értékesít|asszisztens|recepció|pénztár|customer|sales|assistant|client|vânz|asistent/i.test(item.title || '')) {
        return lang === 'en'
          ? '• Carrying out the ' + (item.title || 'role') + ' tasks independently and accurately.\n• Liaising with colleagues and partners, meeting deadlines.\n• Proposing and introducing process improvements – measurably speeding up processes.'
          : '• Îndeplinirea independentă și precisă a sarcinilor postului de ' + (item.title || 'lucru') + '.\n• Colaborarea cu colegii și partenerii, respectarea termenelor.\n• Propunerea și implementarea de îmbunătățiri ale proceselor – accelerând vizibil procesele.';
      }
      if ((item.desc || '').trim()) {
        var IMP = lang === 'en'
          ? [' – measurably speeding up processes', ' – improving customer satisfaction', ' – reducing the number of errors', ' – increasing team efficiency']
          : [' – accelerând vizibil procesele', ' – îmbunătățind satisfacția clienților', ' – reducând numărul erorilor', ' – crescând eficiența echipei'];
        var n = 0, dd = item.desc.trim();
        return dd.split('\n').map(function (line) {
          var l = line.trim();
          if (!l) return l;
          var b = /^[•\-–*]/.test(l);
          l = l.replace(/^[•\-–*]\s*/, '');
          if (!/\d/.test(l) && l.length < 160 && !/–\s/.test(l)) { l = l.replace(/[.]$/, '') + IMP[n % IMP.length] + '.'; n += 1; }
          return (b || dd.indexOf('•') >= 0 ? '• ' : '') + uc(l);
        }).join('\n');
      }
      return DJP.tr(ai.improveEntry({ title: 'ügyfél', desc: '' }, job), lang);
    }
    var d = (item.desc || '').trim();
    if (!d) {
      if (/ügyfél|eladó|értékesít|asszisztens|recepció|pénztár/i.test(item.title || '')) {
        return '• Napi szinten ügyfelek személyes és telefonos kiszolgálása, kérdéseik gyors megválaszolása.\n' +
          '• Ügyféladatok és rendelések pontos rögzítése a nyilvántartó rendszerben.\n' +
          '• Panaszkezelés és utánkövetés – javítva az ügyfél-elégedettséget.\n' +
          '• Szoros együttműködés a kollégákkal a határidők betartása érdekében.';
      }
      return '• ' + (item.title ? DJP.Az(lc(item.title)) + ' munkakörhöz' : 'A munkakörhöz') + ' tartozó feladatok önálló és pontos ellátása.\n' +
        '• Kapcsolattartás kollégákkal és partnerekkel, határidők betartása.\n' +
        '• Folyamatfejlesztési javaslatok kidolgozása és bevezetése' + IMPACT[0] + '.';
    }
    var k = 0;
    return d.split('\n').map(function (line) {
      var l = line.trim();
      if (!l) return l;
      var bullet = /^[•\-–*]/.test(l);
      l = l.replace(/^[•\-–*]\s*/, '');
      if (!/\d/.test(l) && l.length < 160 && !/–\s/.test(l)) {
        l = l.replace(/[.]$/, '') + IMPACT[k % IMPACT.length] + '.';
        k += 1;
      }
      return (bullet || d.indexOf('•') >= 0 ? '• ' : '') + uc(l);
    }).join('\n');
  };

  ai.suggestSkills = function (job, lang) {
    if (lang && lang !== 'hu') return ai.suggestSkills(job).map(function (n) { return DJP.tr(n, lang); });
    if (!job || job.id === 'startuphub') {
      return ['Telefonos ügyfélkommunikáció', 'CRM-rendszerek használata', 'Értékesítési és ügyfélkapcsolati készségek',
        'Adatrögzítés és adminisztráció', 'Panaszkezelés', 'Csapatmunka és kommunikáció', 'Proaktivitás', 'Precizitás és felelősségvállalás'];
    }
    return job.requirements.map(function (r) { return r.label; }).concat(['Csapatmunka', 'Proaktivitás']);
  };

  /* ---------- Motivációs levél ---------- */
  ai.coverLetter = function (cv, job, opts) {
    opts = opts || {};
    var tone = opts.tone || 'formal';
    var length = opts.length || 'normal';
    var exp = sec(cv, 'experience');
    var items = exp ? exp.items.filter(function (i) { return i.title; }) : [];
    var langs = sec(cv, 'languages');
    var ro = langs && langs.items.find(function (l) { return /román/i.test(l.name); });
    var text = flatten(cv);
    var company = job ? job.company : 'Tisztelt Cég';
    var greet = tone === 'formal' ? 'Tisztelt ' + company + ' Csapat!' : 'Kedves ' + company + ' Csapat!';

    var p1;
    var open = { formal: 'Nagy érdeklődéssel olvastam', friendly: 'Örömmel láttam meg', enthusiastic: 'Izgatottan olvastam' }[tone];
    if (job) {
      p1 = open + ' ' + DJP.az(lc(job.title)) + ' pozícióra meghirdetett álláslehetőségüket a DreamJobs.ro oldalon, és ezúton szeretném jelezni jelentkezésemet. ' +
        DJP.Az(job.company) + ' küldetése – ' + (job.mission || 'a régió fejlődésének támogatása képzéseken és vállalkozásfejlesztésen keresztül') + ' – számomra is fontos érték, ezért különösen motivál, hogy a ' + job.projects + ' ' +
        (job.id === 'startuphub' ? 'projektek érdeklődőinek segíthessek megtalálni a számukra megfelelő képzést.' : 'sikeres megvalósításához hozzájárulhassak.');
    } else {
      p1 = open + ' a meghirdetett pozíciót, és ezúton szeretném jelezni jelentkezésemet.';
    }

    var p2;
    if (items.length) {
      var a = items[0];
      p2 = 'Jelenleg ' + lc(a.title) + 'ként' + (a.subtitle ? ' dolgozom ' + DJP.az(a.subtitle) + ' cégnél' : ' dolgozom') + ', ahol ' +
        (/webáruház|e-commerce|farma-line/.test(text) ? 'egy online áruház mindennapi működéséért felelek: a rendelések és ügyféladatok kezelésétől a beszállítókkal való kapcsolattartásig.' : 'önállóan és felelősségteljesen látom el a feladataimat.');
      if (/gyógyszertár/.test(text)) {
        p2 += ' Korábban gyógyszertári asszisztensként naponta több tucat ügyféllel kommunikáltam személyesen és telefonon, így magabiztosan kezelem az érdeklődők kérdéseit és a nehezebb helyzeteket is.';
      } else if (items[1]) {
        p2 += ' Korábban ' + lc(items[1].title) + 'ként is értékes tapasztalatot szereztem az ügyfelekkel és a csapattal való együttműködésben.';
      }
    } else {
      p2 = 'Bár szakmai pályám elején járok, tanulmányaim és eddigi tapasztalataim során megtanultam pontosan, felelősségteljesen dolgozni, és nyitottan, segítőkészen kommunikálni másokkal.';
    }

    var p3 = (/prestashop/.test(text)
      ? 'Megszoktam, hogy az ügyfél- és rendelési adatokat pontosan rögzítsem és kezeljem (PrestaShop admin, Google Analytics), ezért a CRM-alapú munkavégzés és az adminisztráció is közel áll hozzám. '
      : /crm|adatbázis|nyilvántart|ügyféladat/.test(text)
      ? 'Megszoktam, hogy az ügyfél- és rendelési adatokat pontosan rögzítsem és kezeljem, ezért a CRM-alapú munkavégzés és az adminisztráció is közel áll hozzám. '
      : 'A pontos adatrögzítés és az adminisztratív feladatok precíz ellátása erősségeim közé tartozik. ') +
      'Magyar anyanyelvemnek és ' + (ro ? ro.level + ' szintű' : 'tárgyalóképes') + ' román nyelvtudásomnak köszönhetően mindkét nyelven gördülékenyen kommunikálok szóban és írásban.';

    /* a hirdetés feladatai és a cég bemutatkozása */
    var pTasks = job && job.taskText
      ? 'A hirdetésben leírt feladatok – ' + job.taskText + ' – nagyrészt olyanok, amelyeket eddig is nap mint nap végeztem. ' + p3
      : p3;
    var motives = [];
    ['q5', 'n6'].forEach(function (q) { picks(opts.answers, q).forEach(function (c) { var m = MOTIVE[c]; if (m && motives.indexOf(m) < 0) motives.push(m); }); });
    var pCompany = job && job.values
      ? 'Különösen tetszik, hogy Önöknél ' + job.values.slice(0, -1).join(', ') + ' és ' + job.values[job.values.length - 1] + ' alapérték, és hogy ' + job.culture + '. ' +
        (job.trains ? 'Örülök, hogy ' + job.trains + ' – szívesen fejlődnék ezekben a csapatuk mellett.' : '') +
        (motives.length ? ' Ráadásul ' + motives.join(', és ') + '.' : '')
      : '';
    var p4extra = 'Emellett erős digitális háttérrel rendelkezem: az online marketing, a webes felületek és az AI-alapú eszközök használata segíthet abban, hogy a képzések kommunikációja és az adminisztráció még hatékonyabb legyen.';

    var close = {
      formal: (job && job.values ? 'Proaktív, megbízható munkatársként szívesen járulnék hozzá a közös célokhoz.' : 'Szívesen tanulnék a csapatuktól új ügyfélkezelési és értékesítési technikákat, és proaktív, megbízható munkatársként járulnék hozzá a közös célokhoz.') + ' Önéletrajzomat mellékelem; örömmel bemutatkoznék egy személyes beszélgetés során is.',
      friendly: 'Szívesen csatlakoznék a csapatukhoz, ahol a segítőkészség és az együttműködés mindennapos érték. Önéletrajzomat mellékelem – örülnék, ha egy személyes beszélgetésen is megismerhetnénk egymást.',
      enthusiastic: 'Nagyon szeretnék a csapatuk része lenni, és teljes lendülettel dolgoznék azon, hogy minél többen találják meg a számukra megfelelő lehetőséget! Önéletrajzomat mellékelem, és nagyon várom a lehetőséget egy személyes beszélgetésre.'
    }[tone];

    var paras = (length === 'short' ? [p1, p2, pCompany, close] : length === 'long' ? [p1, p2, pTasks, pCompany, p4extra, close] : [p1, p2, pTasks, pCompany, close])
      .filter(function (p) { return p && p.trim(); });
    var sign = { formal: 'Tisztelettel,', friendly: 'Üdvözlettel,', enthusiastic: 'Várom megkeresésüket, üdvözlettel,' }[tone];
    return {
      subject: job ? 'Jelentkezés – ' + job.title : 'Jelentkezés',
      body: greet + '\n\n' + paras.join('\n\n') + '\n\n' + sign + '\n' + (fullName(cv) || 'Név')
    };
  };

  /* ---------- Új CV vázlata az AI-kérdésekre adott válaszokból ---------- */
  var ROLE_MAP = {
    'Online marketing specialista – Farma-Line SRL': { title: 'Online marketing specialista', subtitle: 'Farma-Line SRL', city: 'Sepsiszentgyörgy', start: '2023.11', end: 'jelenleg' },
    'Gyógyszertári asszisztens – Farma-Line SRL': { title: 'Gyógyszertári asszisztens', subtitle: 'Farma-Line SRL', city: 'Sepsiszentgyörgy', start: '2020.08', end: '2023.10' },
    'Szabadúszó webfejlesztő': { title: 'Szabadúszó webfejlesztő', subtitle: 'Önálló tevékenység', city: 'Online, Románia', start: '2023', end: 'jelenleg' }
  };
  var TASK_MAP = {
    'Ügyfelek személyes és telefonos kiszolgálása': 'Napi szinten ügyfelek személyes és telefonos kiszolgálása, kérdéseik gyors megválaszolása.',
    'Rendelések és ügyféladatok kezelése': 'Ügyféladatok és rendelések pontos rögzítése a nyilvántartó rendszerben.',
    'Webshop-üzemeltetés és online marketing': 'E-commerce és bemutatkozó weboldalak fejlesztése PrestaShop és WordPress alapon.',
    'Adminisztráció és számlázás': 'Menedzsment & operatív feladatok: számlázás, pénzügyi menedzsment, árképzés, rendelésfeldolgozás, folyamatoptimalizálás.'
  };
  var EDU_MAP = {
    'Mesterképzés – Üzletfejlesztési menedzsment (BBTE)': { title: 'Mesterképzés – Üzletfejlesztési menedzsment', subtitle: 'Babeș-Bolyai Tudományegyetem, Sepsiszentgyörgyi Kihelyezett Tagozat', city: 'Sepsiszentgyörgy', start: '2021', end: '2023' },
    'Alapképzés (BA) – Vállalatgazdaságtan (BBTE)': { title: 'Alapképzés (BA) – Vállalatgazdaságtan', subtitle: 'Babeș-Bolyai Tudományegyetem, Sepsiszentgyörgyi Kihelyezett Tagozat', city: 'Sepsiszentgyörgy', start: '2018', end: '2021' },
    'Érettségi': { title: 'Érettségi', subtitle: '', city: '', start: '', end: '' }
  };
  var SKILL_MAP = { 'Kommunikáció': 'Csapatmunka és kommunikáció', 'Pontosság': 'Precizitás és felelősségvállalás', 'Proaktivitás': 'Proaktivitás', 'Csapatmunka': 'Csapatmunka és kommunikáció', 'Digitális eszközök (Office, CRM)': 'CRM-rendszerek használata' };

  ai.draftCV = function (user, answers, job) {
    var cv = DJP.blankCV(user);
    var pk = function (q) { return picks(answers, q); };
    cv.personal.headline = job ? job.title.replace(/\s*\(.*\)/, '') : uc(free(answers, 'n6') || pk('n6')[0] || '');
    var item = function (o) { return Object.assign({ id: DJP.uid('it'), desc: '' }, o); };

    var exp = sec(cv, 'experience'); exp.items = [];
    var tasks = pk('n2').map(function (t) { return '• ' + TASK_MAP[t]; });
    if (free(answers, 'n2')) tasks.push('• ' + uc(free(answers, 'n2')).replace(/[.]?$/, '.'));
    pk('n1').forEach(function (r, k) {
      if (!ROLE_MAP[r]) return;
      var it = item(ROLE_MAP[r]);
      it.desc = k === 0 && tasks.length ? tasks.join('\n') : ai.improveEntry({ title: /asszisztens/i.test(it.title) ? 'ügyfél asszisztens' : it.title, desc: '' }, job);
      exp.items.push(it);
    });
    if (free(answers, 'n1')) exp.items.unshift(item({ title: uc(free(answers, 'n1')), subtitle: '', city: '', start: '', end: '', desc: tasks.join('\n') }));

    var edu = sec(cv, 'education'); edu.items = [];
    pk('n3').forEach(function (e) { if (EDU_MAP[e]) edu.items.push(item(EDU_MAP[e])); });
    if (free(answers, 'n3')) edu.items.push(item({ title: uc(free(answers, 'n3')), subtitle: '', city: '', start: '', end: '' }));

    var lg = sec(cv, 'languages');
    lg.items = pk('n4').map(function (l) {
      var p = l.split(' – ');
      return { id: DJP.uid('it'), name: p[0], level: p[1] === 'anyanyelv' ? 'Anyanyelv' : (p[1] || 'B2') };
    });

    var sk = sec(cv, 'skills');
    var names = [];
    pk('n5').forEach(function (x) { var n = SKILL_MAP[x] || x; if (names.indexOf(n) < 0) names.push(n); });
    ai.suggestSkills(job).slice(0, 4).forEach(function (n) { if (names.indexOf(n) < 0) names.push(n); });
    sk.items = names.map(function (n) { return { id: DJP.uid('it'), name: n, level: '', detail: '' }; });

    var profile = sec(cv, 'profile');
    var all = ai.profileForAll(cv, job);
    profile.text = all.hu;
    profile.i18n = { text: all };
    return cv;
  };

  /* ---------- AI felturbózás ---------- */
  var PROSE = {
    'Igen, gyógyszertárban napi 40–60 ügyféllel': 'gyógyszertári asszisztensként napi 40–60 ügyfél személyes és telefonos kiszolgálásával',
    'Igen, beszállítókkal telefonon és e-mailben': 'a beszállítókkal való rendszeres telefonos és e-mailes kapcsolattartással',
    'Webshop-ügyfélszolgálat (e-mail, chat)': 'webshop-ügyfélszolgálati (e-mail, chat) tapasztalattal',
    'PrestaShop admin (rendelések, ügyfelek)': 'PrestaShop admin',
    'Igen, Kolozsvárra költözöm': 'Vállalom a kolozsvári irodai munkát (Kolozsvárra költözöm)',
    'Azonnal kezdeni tudok': 'Azonnali kezdés',
    '2 hét felmondási idővel': 'Kezdés 2 hét felmondási idő után',
    'Google Analytics': 'Google Analytics',
    'Gyógyszertári nyilvántartó szoftver': 'gyógyszertári nyilvántartó szoftver',
    'Excel / Google Sheets': 'Excel / Google Sheets',
    'A webshop konverziós aránya ~25%-kal nőtt az új UX után': 'Az új webshop-UX bevezetése után a konverziós arány kb. 25%-kal nőtt.',
    'Havonta 300+ online rendelés feldolgozása': 'Havonta 300+ online rendelés feldolgozása és az ügyfelekkel való egyeztetés.',
    'PPC-kampányokkal ~2× több organikus + fizetett látogató': 'A PPC- és SEO-munka eredményeként kb. kétszeresére nőtt a webshop látogatottsága.',
    'Szeretek embereknek segíteni a fejlődésben': 'Kiemelten fontos számomra, hogy másokat segítsek a fejlődésükben',
    'Magam is folyamatosan tanulok (Coursera, Codecademy)': 'magam is folyamatosan tanulok (Coursera, Codecademy)',
    'Fontos számomra a régió fejlődése': 'hiszek a régió fejlődésében'
  };
  var PROSE_I18N = {
    'Igen, gyógyszertárban napi 40–60 ügyféllel': { en: 'serving 40–60 customers a day in person and by phone as a pharmacy assistant', ro: 'servirea zilnică a 40–60 de clienți, personal și telefonic, ca asistent farmacist' },
    'Igen, beszállítókkal telefonon és e-mailben': { en: 'regular phone and e-mail contact with suppliers', ro: 'comunicarea regulată cu furnizorii, telefonic și prin e-mail' },
    'Webshop-ügyfélszolgálat (e-mail, chat)': { en: 'web shop customer service (e-mail, chat)', ro: 'serviciul clienți al magazinului online (e-mail, chat)' },
    'PrestaShop admin (rendelések, ügyfelek)': { en: 'PrestaShop admin', ro: 'PrestaShop admin' },
    'Google Analytics': { en: 'Google Analytics', ro: 'Google Analytics' },
    'Gyógyszertári nyilvántartó szoftver': { en: 'pharmacy management software', ro: 'software de gestiune farmaceutică' },
    'Excel / Google Sheets': { en: 'Excel / Google Sheets', ro: 'Excel / Google Sheets' },
    'Szeretek embereknek segíteni a fejlődésben': { en: 'Helping others grow is especially important to me', ro: 'Este foarte important pentru mine să îi ajut pe alții să se dezvolte' },
    'Magam is folyamatosan tanulok (Coursera, Codecademy)': { en: 'I keep learning myself (Coursera, Codecademy)', ro: 'și eu învăț continuu (Coursera, Codecademy)' },
    'Fontos számomra a régió fejlődése': { en: 'I believe in the development of the region', ro: 'cred în dezvoltarea regiunii' }
  };
  /* a felturbózás állandó szövegei a fordítási memóriában */
  [
    ['Ügyfélkapcsolati munkatárs', 'Customer Relations Associate', 'Specialist relații clienți'],
    ['ügyfélkezelési és e-commerce tapasztalattal', 'customer service and e-commerce experience', 'experiență în relația cu clienții și e-commerce'],
    ['A www.farma-line.ro online gyógyszertár teljes körű működtetése az ügyfélkiszolgálástól a technikai fejlesztésig.', 'Running the www.farma-line.ro online pharmacy end-to-end, from customer service to technical development.', 'Administrarea completă a farmaciei online www.farma-line.ro, de la relația cu clienții până la dezvoltarea tehnică.'],
    ['Ügyfélkommunikáció: online és telefonos megkeresések megválaszolása, rendelésekkel kapcsolatos ügyintézés és utánkövetés.', 'Customer communication: answering online and phone enquiries, handling order-related requests and follow-up.', 'Comunicarea cu clienții: răspuns la solicitări online și telefonice, gestionarea comenzilor și follow-up.'],
    ['Ügyféladatok és rendelések rögzítése, kezelése a PrestaShop adminrendszerében (CRM-funkciók), pontos adminisztráció.', 'Recording and managing customer data and orders in the PrestaShop admin system (CRM features), accurate administration.', 'Înregistrarea și gestionarea datelor clienților și a comenzilor în sistemul de administrare PrestaShop (funcții CRM), administrare precisă.'],
    ['Kapcsolattartás a beszállítókkal és partnerekkel telefonon és e-mailben.', 'Liaising with suppliers and partners by phone and e-mail.', 'Comunicarea cu furnizorii și partenerii, telefonic și prin e-mail.'],
    ['PPC-kampányok (Google Ads, Meta Ads) és SEO/GEO optimalizálás – adatalapú döntések Google Analyticsszel.', 'PPC campaigns (Google Ads, Meta Ads) and SEO/GEO optimisation – data-driven decisions with Google Analytics.', 'Campanii PPC (Google Ads, Meta Ads) și optimizare SEO/GEO – decizii bazate pe date cu Google Analytics.'],
    ['Számlázás, árképzés, rendelésfeldolgozás és az operatív folyamatok optimalizálása.', 'Invoicing, pricing, order processing and optimising operational processes.', 'Facturare, stabilirea prețurilor, procesarea comenzilor și optimizarea proceselor operaționale.'],
    ['AI-eszközök bevezetése a tartalomgyártás és az adminisztráció gyorsítására.', 'Introducing AI tools to speed up content creation and administration.', 'Introducerea instrumentelor AI pentru accelerarea creării de conținut și a administrării.'],
    ['Napi 40–60 ügyfél személyes és telefonos kiszolgálása, tanácsadás és panaszkezelés.', 'Serving 40–60 customers a day in person and by phone, giving advice and handling complaints.', 'Servirea zilnică a 40–60 de clienți, personal și telefonic, consiliere și gestionarea reclamațiilor.'],
    ['Rendelések, készlet és ügyféladatok pontos rögzítése a gyógyszertári nyilvántartó rendszerben.', 'Accurately recording orders, stock and customer data in the pharmacy management system.', 'Înregistrarea precisă a comenzilor, stocurilor și datelor clienților în sistemul de gestiune al farmaciei.'],
    ['Kapcsolattartás a beszállítókkal, utánkövetés, határidők betartása.', 'Liaising with suppliers, follow-up, meeting deadlines.', 'Comunicarea cu furnizorii, follow-up, respectarea termenelor.'],
    ['Új kollégák betanításának segítése, csapatmunka a gördülékeny kiszolgálásért.', 'Helping train new colleagues, teamwork for smooth customer service.', 'Sprijin în instruirea colegilor noi, lucru în echipă pentru o servire fluentă.'],
    ['Az új webshop-UX bevezetése után a konverziós arány kb. 25%-kal nőtt.', 'After launching the new web shop UX, the conversion rate grew by about 25%.', 'După implementarea noului UX al magazinului online, rata de conversie a crescut cu aproximativ 25%.'],
    ['Havonta 300+ online rendelés feldolgozása és az ügyfelekkel való egyeztetés.', 'Processing 300+ online orders per month and coordinating with customers.', 'Procesarea a peste 300 de comenzi online pe lună și comunicarea cu clienții.'],
    ['A PPC- és SEO-munka eredményeként kb. kétszeresére nőtt a webshop látogatottsága.', 'PPC and SEO work roughly doubled web shop traffic.', 'Ca rezultat al activității PPC și SEO, traficul magazinului online s-a dublat aproximativ.'],
    ['Két e-commerce platform end-to-end leszállítása (farma-line.ro, sicmaster.ro).', 'Delivered two e-commerce platforms end-to-end (farma-line.ro, sicmaster.ro).', 'Livrarea end-to-end a două platforme e-commerce (farma-line.ro, sicmaster.ro).'],
    ['Ügyfélkapcsolat & kommunikáció', 'Customer relations & communication', 'Relații cu clienții & comunicare'],
    ['Telefonos (in- és outbound) és személyes ügyfélkommunikáció', 'Phone (inbound and outbound) and face-to-face customer communication', 'Comunicare cu clienții telefonic (inbound și outbound) și față în față'],
    ['Ügyféladatok rögzítése CRM/adminrendszerben', 'Recording customer data in CRM/admin systems', 'Înregistrarea datelor clienților în CRM/sisteme de administrare'],
    ['Értékesítés és utánkövetés', 'Sales and follow-up', 'Vânzări și follow-up'],
    ['Román–magyar kétnyelvű kommunikáció', 'Bilingual Romanian–Hungarian communication', 'Comunicare bilingvă română–maghiară'],
    ['Csapatmunka', 'Teamwork', 'Lucru în echipă'],
    ['Felelősségvállalás és pontosság', 'Responsibility and accuracy', 'Responsabilitate și precizie'],
    ['Stressztűrés', 'Stress tolerance', 'Rezistență la stres'],
    ['Román – tárgyalóképes szóban és írásban', 'Romanian – fluent, spoken and written', 'Română – nivel avansat, oral și scris'],
    ['Vállalom a kolozsvári irodai munkát (Kolozsvárra költözöm)', 'Willing to work at the Cluj-Napoca office (relocating to Cluj-Napoca)', 'Disponibil pentru lucru la biroul din Cluj-Napoca (mă mut în Cluj-Napoca)'],
    ['Azonnali kezdés', 'Immediate start', 'Disponibil imediat'],
    ['Kezdés 2 hét felmondási idő után', 'Start after a 2-week notice period', 'Început după un preaviz de 2 săptămâni'],
    ['Kolozsvári irodai munkavégzés vállalása', 'Willing to work at the Cluj-Napoca office', 'Disponibil pentru biroul din Cluj-Napoca'],
    ['Rugalmas kezdés', 'Flexible start date', 'Dată de început flexibilă'],
    ['Felnőttképzés és a szakmai fejlődés támogatása', 'Adult education and supporting professional growth', 'Educația adulților și sprijinirea dezvoltării profesionale']
  ].forEach(function (x) { DJP.T(x[0], x[1], x[2]); });

  var MOTIVE = {
    'Szeretek embereknek segíteni a fejlődésben': 'kiemelten fontos számomra, hogy másokat segítsek a fejlődésükben',
    'Magam is folyamatosan tanulok (Coursera, Codecademy)': 'magam is folyamatosan tanulok (Coursera, Codecademy), így értem, mit keresnek a képzések iránt érdeklődők',
    'Fontos számomra a régió fejlődése': 'hiszek a régió fejlődésében',
    'Szeretek telefonon és személyesen kommunikálni': 'kifejezetten szeretek telefonon és személyesen kommunikálni'
  };
  function picks(ans, q) { return (ans && ans[q] && ans[q].chips) || []; }
  function free(ans, q) { return ((ans && ans[q] && ans[q].text) || '').trim(); }

  ai.boost = function (orig, answers, job) {
    var cv = DJP.clone(orig);
    var changes = [];
    function mark(s, label) { s.ai = true; changes.push({ sectionId: s.id, label: label }); }

    cv.personal.headline = job ? job.title.replace(/\s*\(.*\)/, '') + ' · ügyfélkezelési és e-commerce tapasztalattal' : cv.personal.headline;
    changes.push({ sectionId: 'personal', label: 'Címsor az álláshoz igazítva' });

    // Bemutatkozás
    var q1 = picks(answers, 'q1').map(function (c) { return PROSE[c] || c; });
    var q2 = picks(answers, 'q2').map(function (c) { return PROSE[c] || c; });
    var q4 = picks(answers, 'q4')[0] || 'C1';
    var q5 = picks(answers, 'q5').map(function (c) { return PROSE[c] || c; });
    var profile = sec(cv, 'profile');
    profile.text = 'Ügyfélközpontú, megbízható szakember vagyok, aki több mint öt év alatt ' +
      (q1.length ? q1.join(', valamint ') : 'ügyfelek személyes és online kiszolgálásában') +
      ' szerzett tapasztalatot. A Farma-Line webáruházában a rendelések, ügyféladatok és beszállítói kapcsolatok kezelése is a feladatom ' +
      'volt' + (q2.length ? ' (használt rendszerek: ' + q2.join(', ') + ')' : '') + ', így a pontos adatrögzítés és a CRM-alapú munkavégzés természetes számomra. ' +
      'Magyar anyanyelvemnek és ' + (/c1|c2/i.test(q4) ? q4.split(' ')[0] + ' szintű' : 'magabiztos') + ' román nyelvtudásomnak köszönhetően mindkét nyelven gördülékenyen kommunikálok szóban és írásban. ' +
      (q5.length ? uc(q5.join(', és ')) + ', ' : '') +
      (job ? 'ezért szeretnék ' + lc(job.title.replace(/\s*\(.*\)/, '')) + 'ként hozzájárulni ahhoz, hogy ' + DJP.az(job.company) + ' képzései minél több emberhez eljussanak.' : 'ezért olyan szerepet keresek, ahol az emberekkel való munka áll a középpontban.');
    if (free(answers, 'q5')) profile.text += ' ' + uc(free(answers, 'q5')).replace(/[.]?$/, '.');
    var q1c = picks(answers, 'q1'), q2c = picks(answers, 'q2'), q5c = picks(answers, 'q5');
    var P = function (c, L) { return (PROSE_I18N[c] && PROSE_I18N[c][L]) || (PROSE[c] ? DJP.tr(PROSE[c], L) : c); };
    var lvl = /c1|c2/i.test(q4) ? q4.split(' ')[0] : '';
    var jt = function (L) { return job ? (job.titleI18n && job.titleI18n[L]) || job.title : ''; };
    var en = 'Customer-focused, reliable professional with more than five years of experience in ' +
      (q1c.length ? q1c.map(function (c) { return P(c, 'en'); }).join(', as well as ') : 'serving customers in person and online') + '. ' +
      'At the Farma-Line web shop I was also responsible for managing orders, customer data and supplier relations' + (q2c.length ? ' (systems used: ' + q2c.map(function (c) { return P(c, 'en'); }).join(', ') + ')' : '') +
      ', so accurate data entry and CRM-based work come naturally to me. Thanks to my native Hungarian and ' + (lvl ? lvl + '-level' : 'confident') + ' Romanian, I communicate fluently in both languages, orally and in writing. ' +
      (q5c.length ? q5c.map(function (c) { return P(c, 'en'); }).join(', and ') + ', which is why ' : 'That is why ') +
      (job ? 'I would like to help, as a ' + jt('en') + ', ' + job.company + '\'s training programmes reach as many people as possible.' : 'I am looking for a role focused on working with people.');
    var ro = 'Profesionist orientat către client și de încredere, cu peste cinci ani de experiență în ' +
      (q1c.length ? q1c.map(function (c) { return P(c, 'ro'); }).join(', precum și ') : 'servirea clienților, personal și online') + '. ' +
      'La magazinul online Farma-Line am gestionat și comenzile, datele clienților și relația cu furnizorii' + (q2c.length ? ' (sisteme folosite: ' + q2c.map(function (c) { return P(c, 'ro'); }).join(', ') + ')' : '') +
      ', așa că introducerea precisă a datelor și lucrul în CRM îmi sunt familiare. Datorită limbii materne maghiare și cunoștințelor de limba română ' + (lvl ? 'la nivel ' + lvl : 'foarte bune') + ', comunic fluent în ambele limbi, oral și în scris. ' +
      (q5c.length ? uc(q5c.map(function (c) { return P(c, 'ro'); }).join(', iar ')) + ', de aceea ' : 'De aceea ') +
      (job ? 'aș dori să contribui, ca ' + lc(jt('ro')) + ', ca programele de formare ' + job.company + ' să ajungă la cât mai mulți oameni.' : 'caut un rol axat pe lucrul cu oamenii.');
    profile.i18n = { text: { hu: profile.text, en: en, ro: ro } };
    mark(profile, 'Bemutatkozás újraírva, ügyfélközpontú fókusszal');

    // Tapasztalat
    var exp = sec(cv, 'experience');
    var mk = exp.items.find(function (i) { return /marketing/i.test(i.title); });
    var ph = exp.items.find(function (i) { return /gyógyszertári/i.test(i.title); });
    var q3 = picks(answers, 'q3').map(function (c) { return PROSE[c] || c; });
    if (mk) {
      mk.desc = 'A www.farma-line.ro online gyógyszertár teljes körű működtetése az ügyfélkiszolgálástól a technikai fejlesztésig.\n' +
        '• Ügyfélkommunikáció: online és telefonos megkeresések megválaszolása, rendelésekkel kapcsolatos ügyintézés és utánkövetés.\n' +
        '• Ügyféladatok és rendelések rögzítése, kezelése a PrestaShop adminrendszerében (CRM-funkciók), pontos adminisztráció.\n' +
        (q3.length ? q3.map(function (x) { return '• ' + x; }).join('\n') + '\n' : '') +
        (free(answers, 'q3') ? '• ' + uc(free(answers, 'q3')).replace(/[.]?$/, '.') + '\n' : '') +
        '• Kapcsolattartás a beszállítókkal és partnerekkel telefonon és e-mailben.\n' +
        '• PPC-kampányok (Google Ads, Meta Ads) és SEO/GEO optimalizálás – adatalapú döntések Google Analyticsszel.\n' +
        '• Számlázás, árképzés, rendelésfeldolgozás és az operatív folyamatok optimalizálása.\n' +
        '• AI-eszközök bevezetése a tartalomgyártás és az adminisztráció gyorsítására.';
    }
    if (ph) {
      ph.desc = '• Napi 40–60 ügyfél személyes és telefonos kiszolgálása, tanácsadás és panaszkezelés.\n' +
        '• Rendelések, készlet és ügyféladatok pontos rögzítése a gyógyszertári nyilvántartó rendszerben.\n' +
        '• Kapcsolattartás a beszállítókkal, utánkövetés, határidők betartása.\n' +
        (free(answers, 'q1') ? '• ' + uc(free(answers, 'q1')).replace(/[.]?$/, '.') + '\n' : '') +
        '• Új kollégák betanításának segítése, csapatmunka a gördülékeny kiszolgálásért.';
    }
    mark(exp, 'Tapasztalat: 2 pozíció pontjai átírva, ügyfélkapcsolati fókusszal és eredményekkel');

    // Eredmények (új)
    var ach = DJP.newSection('achievements');
    var achLines = q3.length ? q3 : ['Az új webshop-UX bevezetése után a konverziós arány kb. 25%-kal nőtt.'];
    ach.text = achLines.map(function (x) { return '• ' + x; }).join('\n') +
      '\n• Két e-commerce platform end-to-end leszállítása (farma-line.ro, sicmaster.ro).';
    ach.ai = true; ach.isNew = true;
    cv.sections.splice(cv.sections.indexOf(profile) + 1, 0, ach);
    changes.push({ sectionId: ach.id, label: 'Új szakasz: Eredmények' });

    // Projektek a tapasztalat mögé
    var proj = sec(cv, 'projects');
    if (proj) {
      cv.sections.splice(cv.sections.indexOf(proj), 1);
      cv.sections.splice(cv.sections.indexOf(exp) + 1, 0, proj);
      changes.push({ sectionId: proj.id, label: 'Projektek a tapasztalat mögé sorolva (kevésbé relevánsak ennél az állásnál)' });
    }

    // Készségek
    var sk = sec(cv, 'skills');
    var soft = sk.items.find(function (i) { return /személyes/i.test(i.name); });
    var mkt = sk.items.find(function (i) { return /marketing/i.test(i.name); });
    var rest = sk.items.filter(function (i) { return i !== soft && i !== mkt; });
    var comm = { id: DJP.uid('it'), name: 'Ügyfélkapcsolat & kommunikáció', level: 'Haladó',
      detail: 'Telefonos (in- és outbound) és személyes ügyfélkommunikáció · Ügyféladatok rögzítése CRM/adminrendszerben · Értékesítés és utánkövetés · Panaszkezelés · Román–magyar kétnyelvű kommunikáció' };
    if (free(answers, 'q2')) comm.detail += ' · ' + free(answers, 'q2');
    if (soft) soft.detail = 'Proaktivitás · Csapatmunka · Felelősségvállalás és pontosság · Problémamegoldás · Stressztűrés · Office programok (haladó)';
    sk.items = [comm].concat(soft ? [soft] : [], mkt ? [mkt] : [], rest);
    mark(sk, 'Készségek: új „Ügyfélkapcsolat & kommunikáció” csoport, a releváns készségek előre sorolva');

    // Nyelvek
    var lg = sec(cv, 'languages');
    var ro = lg && lg.items.find(function (l) { return /román/i.test(l.name); });
    if (ro) { ro.name = 'Román – tárgyalóképes szóban és írásban' + (free(answers, 'q4') ? ' (' + free(answers, 'q4') + ')' : ''); mark(lg, 'Nyelvtudás pontosítva a hirdetés elvárásához'); }

    // Rendelkezésre állás (új)
    var q6 = picks(answers, 'q6').map(function (c) { return PROSE[c] || c; });
    var av = DJP.newSection('custom');
    av.title = 'Rendelkezésre állás';
    av.text = (q6.length ? q6.join(' · ') : 'Kolozsvári irodai munkavégzés vállalása · Rugalmas kezdés') + (free(answers, 'q6') ? ' · ' + free(answers, 'q6') : '');
    av.ai = true; av.isNew = true;
    cv.sections.push(av);
    changes.push({ sectionId: av.id, label: 'Új szakasz: Rendelkezésre állás' });

    // Ilyen vagyok (új) – a hirdetés kompetenciái alapján
    var tr = DJP.newSection('traits');
    tr.items = ['Proaktív', 'Szorgalmas', 'Csapatjátékos', 'Felelősségteljes', 'Pontos'].map(function (n) { return { id: DJP.uid('it'), name: n }; });
    tr.ai = true; tr.isNew = true;
    cv.sections.push(tr);
    changes.push({ sectionId: tr.id, label: 'Új szakasz: Ilyen vagyok (a hirdetés kompetenciái alapján)' });

    // Érdeklődés
    var it = sec(cv, 'interests');
    if (it && q5.length) { it.text = 'Felnőttképzés és a szakmai fejlődés támogatása · ' + it.text; mark(it, 'Érdeklődési körök kiegészítve'); }

    if (free(answers, 'q5') || free(answers, 'q2') || free(answers, 'q4')) {
      changes.push({ sectionId: 'personal', label: 'A szabad szöveges válaszaid beépítve' });
    }
    return { cv: cv, changes: changes };
  };

  DJP.ai = ai;
})(window.DJP);

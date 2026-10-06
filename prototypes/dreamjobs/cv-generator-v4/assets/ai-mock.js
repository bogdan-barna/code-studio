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
      var now = /farma-line/.test(text) || !a.end || /jelen|present|prezent|curent|folyamat/i.test(a.end);
      p2 = (now ? 'Jelenleg ' : 'Legutóbb ') + lc(a.title) + 'ként' + (now ? ' dolgozom' : ' dolgoztam') + (a.subtitle ? ' ' + DJP.az(a.subtitle) + ' cégnél' : '') + ', ahol ' +
        (/webáruház|e-commerce|farma-line/.test(text) ? 'egy online áruház mindennapi működéséért felelek: a rendelések és ügyféladatok kezelésétől a beszállítókkal való kapcsolattartásig.' : now ? 'önállóan és felelősségteljesen látom el a feladataimat.' : 'önállóan és felelősségteljesen láttam el a feladataimat.');
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
      : 'A pontos adatrögzítés és az adminisztratív feladatok precíz ellátása erősségeim közé tartozik. ') + langSentenceHu(cv, ro);

    /* a hirdetés feladatai és a cég bemutatkozása */
    var pTasks = job && job.taskText
      ? 'A hirdetésben leírt feladatok – ' + job.taskText + ' – nagyrészt olyanok, amelyeket eddig is nap mint nap végeztem. ' + p3
      : p3;
    var motives = [];
    ['q5'].forEach(function (q) { picks(opts.answers, q).forEach(function (c) { var m = MOTIVE[c]; if (m && motives.indexOf(m) < 0) motives.push(m); }); });
    var pCompany = job && job.values
      ? 'Különösen tetszik, hogy Önöknél ' + job.values.slice(0, -1).join(', ') + ' és ' + job.values[job.values.length - 1] + ' alapérték, és hogy ' + job.culture + '. ' +
        (job.trains ? 'Örülök, hogy ' + job.trains + ' – szívesen fejlődnék ezekben a csapatuk mellett.' : '') +
        (motives.length ? ' Ráadásul ' + motives.join(', és ') + '.' : '')
      : '';
    var p4extra = /marketing|webfejleszt|web|digit|online|e-commerce/.test(text)
      ? 'Emellett erős digitális háttérrel rendelkezem: az online marketing, a webes felületek és az AI-alapú eszközök használata segíthet abban, hogy ' + (job && job.id === 'startuphub' ? 'a képzések kommunikációja' : 'a csapat kommunikációja') + ' és az adminisztráció még hatékonyabb legyen.'
      : 'Emellett gyorsan tanulok, és szívesen sajátítok el új eszközöket és módszereket, hogy a csapat munkáját minél hatékonyabban támogassam.';

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
    'Szeretek telefonon és személyesen kommunikálni': 'kifejezetten szeretek telefonon és személyesen kommunikálni',
    'Magam is folyamatosan tanulok': 'magam is folyamatosan tanulok és fejlődöm'
  };
  function picks(ans, q) { return (ans && ans[q] && ans[q].chips) || []; }
  function free(ans, q) { return ((ans && ans[q] && ans[q].text) || '').trim(); }

  ai.boost = function (orig, answers, job) {
    if (!/farma-line/i.test(JSON.stringify(orig))) return ai.boostGeneric(orig, answers, job);
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

    // q7–q10: értékesítés, panaszkezelés, tulajdonságok, kurzusok
    applyExtraAnswers(cv, answers, 'hu', mark, changes);

    // Ilyen vagyok (új) – a hirdetés kompetenciái alapján, ha nem választott tulajdonságokat
    if (!sec(cv, 'traits')) {
      var tr = DJP.newSection('traits');
      tr.items = ['Proaktív', 'Szorgalmas', 'Csapatjátékos', 'Felelősségteljes', 'Pontos'].map(function (n) { return { id: DJP.uid('it'), name: n }; });
      tr.ai = true; tr.isNew = true;
      cv.sections.push(tr);
      changes.push({ sectionId: tr.id, label: 'Új szakasz: Ilyen vagyok (a hirdetés kompetenciái alapján)' });
    }

    // Érdeklődés
    var it = sec(cv, 'interests');
    if (it && q5.length) { it.text = 'Felnőttképzés és a szakmai fejlődés támogatása · ' + it.text; mark(it, 'Érdeklődési körök kiegészítve'); }

    if (free(answers, 'q5') || free(answers, 'q2') || free(answers, 'q4')) {
      changes.push({ sectionId: 'personal', label: 'A szabad szöveges válaszaid beépítve' });
    }
    return { cv: cv, changes: changes };
  };

  /* ---------- nyelvtudás egy mondatban (bármilyen CV-hez) ---------- */
  var ADV = { 'Magyar': 'magyarul', 'Román': 'románul', 'Angol': 'angolul', 'Német': 'németül', 'Francia': 'franciául', 'Olasz': 'olaszul', 'Spanyol': 'spanyolul', 'Orosz': 'oroszul', 'Ukrán': 'ukránul', 'Szlovák': 'szlovákul', 'Szerb': 'szerbül', 'Horvát': 'horvátul', 'Lengyel': 'lengyelül', 'Portugál': 'portugálul', 'Holland': 'hollandul', 'Cseh': 'csehül', 'Török': 'törökül', 'Kínai': 'kínaiul', 'Japán': 'japánul', 'Arab': 'arabul', 'Bolgár': 'bolgárul', 'Görög': 'görögül', 'Svéd': 'svédül', 'Finn': 'finnül' };
  function canon(n) { return (DJP.langCanon && DJP.langCanon(n)) || [n, n, n]; }
  function langParts(cv, roOverride) {
    var lg = sec(cv, 'languages');
    var items = lg ? lg.items.filter(function (l) { return l.name; }).map(function (l) { return { c: canon(l.name), level: l.level }; }) : [];
    if (roOverride) {
      var r = items.find(function (x) { return x.c[0] === 'Román'; });
      if (r) r.level = roOverride; else items.push({ c: canon('Román'), level: roOverride });
    }
    return { nat: items.filter(function (x) { return x.level === 'Anyanyelv'; }), oth: items.filter(function (x) { return x.level !== 'Anyanyelv'; }) };
  }
  function andJoin(arr, w) { return arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' ' + w + ' ' + arr[arr.length - 1]; }
  function langSentence(cv, L, roOverride) {
    var p = langParts(cv, roOverride);
    if (!p.nat.length && !p.oth.length) return '';
    if (L === 'en') {
      var o = andJoin(p.oth.map(function (x) { return x.c[1] + (x.level ? ' (' + x.level + ')' : ''); }), 'and');
      return p.nat.length ? 'Alongside my native ' + andJoin(p.nat.map(function (x) { return x.c[1]; }), 'and') + (o ? ', I speak ' + o + '.' : ', I communicate clearly both orally and in writing.') : 'I speak ' + o + '.';
    }
    if (L === 'ro') {
      var r = andJoin(p.oth.map(function (x) { return x.c[2].toLowerCase() + (x.level ? ' (' + x.level + ')' : ''); }), 'și');
      return p.nat.length ? 'Pe lângă limba maternă ' + andJoin(p.nat.map(function (x) { return x.c[2].toLowerCase(); }), 'și') + (r ? ', vorbesc ' + r + '.' : ', comunic clar oral și în scris.') : 'Vorbesc ' + r + '.';
    }
    var h = andJoin(p.oth.map(function (x) { return (x.level ? x.level + ' szinten ' : '') + (ADV[x.c[0]] || x.c[0].toLowerCase() + ' nyelven'); }), 'és');
    return p.nat.length ? uc(andJoin(p.nat.map(function (x) { return x.c[0].toLowerCase(); }), 'és')) + ' anyanyelvem mellett ' + (h ? h + ' beszélek.' : 'szóban és írásban is gördülékenyen kommunikálok.') : uc(h) + ' beszélek.';
  }
  function langSentenceHu(cv, ro) {
    var lg = sec(cv, 'languages');
    var hasHu = lg && lg.items.some(function (l) { return /magyar|hungarian|maghiar/i.test(l.name) && l.level === 'Anyanyelv'; });
    if (!lg || !lg.items.length || (hasHu && ro)) return 'Magyar anyanyelvemnek és ' + (ro ? ro.level + ' szintű' : 'tárgyalóképes') + ' román nyelvtudásomnak köszönhetően mindkét nyelven gördülékenyen kommunikálok szóban és írásban.';
    return langSentence(cv, 'hu') + ' Így szóban és írásban is gördülékenyen kommunikálok.';
  }

  /* ---------- általános felturbózás bármilyen feltöltött CV-hez ---------- */
  var GCHIP = {
    'Személyes ügyfélkiszolgálás': { hu: 'a személyes ügyfélkiszolgálás', en: 'serving customers in person', ro: 'servirea directă a clienților' },
    'Telefonos ügyfélszolgálat': { hu: 'a telefonos ügyfélszolgálat', en: 'telephone customer service', ro: 'serviciul clienți telefonic' },
    'E-mailes / chates ügyfélkezelés': { hu: 'az e-mailes és chates ügyfélkezelés', en: 'handling customers by e-mail and chat', ro: 'gestionarea clienților prin e-mail și chat' },
    'Kapcsolattartás partnerekkel, beszállítókkal': { hu: 'a partnerekkel és beszállítókkal való kapcsolattartás', en: 'liaising with partners and suppliers', ro: 'relația cu partenerii și furnizorii' },
    'Microsoft Office': { hu: 'Microsoft Office', en: 'Microsoft Office', ro: 'Microsoft Office' },
    'Excel / Google Sheets': { hu: 'Excel / Google Sheets', en: 'Excel / Google Sheets', ro: 'Excel / Google Sheets' },
    'CRM (pl. Salesforce, HubSpot, Pipedrive)': { hu: 'CRM-rendszerek (Salesforce, HubSpot, Pipedrive)', en: 'CRM systems (Salesforce, HubSpot, Pipedrive)', ro: 'sisteme CRM (Salesforce, HubSpot, Pipedrive)' },
    'Számlázó- vagy ERP-rendszer': { hu: 'számlázó- és ERP-rendszerek', en: 'invoicing and ERP systems', ro: 'sisteme de facturare și ERP' },
    'Napi 30+ ügyfél vagy megkeresés kezelése': { hu: 'Napi 30+ ügyfél, illetve megkeresés önálló kezelése.', en: 'Independently handling 30+ customers or enquiries a day.', ro: 'Gestionarea independentă a peste 30 de clienți sau solicitări pe zi.' },
    'Az eredmények / forgalom 10–20%-os növelése': { hu: 'Az eredmények, illetve a forgalom 10–20%-os növelése.', en: 'Increasing results / turnover by 10–20%.', ro: 'Creșterea rezultatelor / a vânzărilor cu 10–20%.' },
    'Csapat vagy projekt koordinálása': { hu: 'Csapat, illetve projekt koordinálása a tervezéstől a megvalósításig.', en: 'Coordinating a team or project from planning to delivery.', ro: 'Coordonarea unei echipe sau a unui proiect de la planificare la implementare.' },
    'Folyamat gyorsítása vagy egyszerűsítése': { hu: 'Egy belső folyamat gyorsítása és egyszerűsítése – kevesebb hibával.', en: 'Speeding up and simplifying an internal process – with fewer errors.', ro: 'Accelerarea și simplificarea unui proces intern – cu mai puține erori.' },
    'Szeretek embereknek segíteni a fejlődésben': { hu: 'kiemelten fontos számomra, hogy másokat segítsek a fejlődésükben', en: 'helping others grow is especially important to me', ro: 'este foarte important pentru mine să îi ajut pe alții să se dezvolte' },
    'Magam is folyamatosan tanulok': { hu: 'magam is folyamatosan tanulok és fejlődöm', en: 'I keep learning and developing myself', ro: 'învăț și mă dezvolt în permanență' },
    'Fontos számomra a régió fejlődése': { hu: 'hiszek a régió fejlődésében', en: 'I believe in the development of the region', ro: 'cred în dezvoltarea regiunii' },
    'Igen, Kolozsvárra költözöm': { hu: 'Vállalom a kolozsvári irodai munkát', en: 'Available to work at the Cluj-Napoca office', ro: 'Disponibil pentru munca la biroul din Cluj-Napoca' },
    'Azonnal kezdeni tudok': { hu: 'Azonnali kezdés', en: 'Available immediately', ro: 'Disponibil imediat' },
    '2 hét felmondási idővel': { hu: 'Kezdés 2 hét felmondási idő után', en: 'Available after a 2-week notice period', ro: 'Disponibil după un preaviz de 2 săptămâni' }
  };
  /* q7–q10 válaszai: a CV-be kerülő megfogalmazás (a fordítási memóriába is bekerül) */
  var XCHIP = {
    'B2C értékesítés magánszemélyeknek': ['B2C értékesítés magánszemélyeknek', 'B2C sales to private customers', 'Vânzări B2C către persoane fizice'],
    'B2B kapcsolattartás cégekkel': ['B2B kapcsolattartás cégekkel', 'B2B account management with companies', 'Relația B2B cu companii'],
    'Kimenő hívások, telefonos megkeresés': ['Kimenő hívások, telefonos megkeresés', 'Outbound calls and phone outreach', 'Apeluri outbound și prospectare telefonică'],
    'Ajánlatkészítés és utánkövetés': ['Ajánlatkészítés és utánkövetés', 'Preparing offers and follow-up', 'Întocmirea ofertelor și follow-up'],
    'Türelmesen meghallgatom, és megoldást keresek': ['Panaszok türelmes, megoldásközpontú kezelése', 'Handling complaints patiently, with a focus on solutions', 'Gestionarea răbdătoare a reclamațiilor, orientată spre soluții'],
    'Panaszok rögzítése és utánkövetése': ['Panaszok rögzítése és utánkövetése', 'Logging complaints and following up', 'Înregistrarea reclamațiilor și follow-up'],
    'Visszatérítés, csere ügyintézése': ['Visszatérítések és cserék ügyintézése', 'Processing refunds and exchanges', 'Gestionarea rambursărilor și a schimburilor'],
    'Szükség esetén eszkalálom a felettesemnek': ['Összetett ügyek eszkalálása a megfelelő kollégához', 'Escalating complex cases to the right colleague', 'Escaladarea cazurilor complexe către colegul potrivit'],
    'Ügyfélszolgálati / kommunikációs tréning': ['Ügyfélszolgálati és kommunikációs tréning', 'Customer service and communication training', 'Training de relații cu clienții și comunicare'],
    'Értékesítési tréning': ['Értékesítési tréning', 'Sales training', 'Training de vânzări'],
    'Online kurzusok (Coursera, Udemy)': ['Online szakmai kurzusok (Coursera, Udemy)', 'Online professional courses (Coursera, Udemy)', 'Cursuri online de specialitate (Coursera, Udemy)'],
    'B kategóriás jogosítvány': ['B kategória', 'Category B', 'Categoria B']
  };
  var XSEC = {
    sales: ['Értékesítés (B2B / B2C)', 'Sales (B2B / B2C)', 'Vânzări (B2B / B2C)'],
    complaints: ['Panaszkezelés', 'Complaint handling', 'Gestionarea reclamațiilor']
  };
  Object.keys(XCHIP).forEach(function (k) { var x = XCHIP[k]; GCHIP[k] = { hu: x[0], en: x[1], ro: x[2] }; DJP.T(x[0], x[1], x[2]); });
  Object.keys(XSEC).forEach(function (k) { DJP.T(XSEC[k][0], XSEC[k][1], XSEC[k][2]); });

  /* q7–q10 beépítése: értékesítés + panaszkezelés készségcsoport, „Ilyen vagyok”, kurzusok, jogosítvány */
  function applyExtraAnswers(cv, answers, L, mark, changes) {
    var LI = { hu: 0, en: 1, ro: 2 }[L] || 0;
    var g = function (c) { return XCHIP[c] ? XCHIP[c][LI] : c; };
    var sk = sec(cv, 'skills');
    var groups = [];
    [['q7', 'sales'], ['q8', 'complaints']].forEach(function (p) {
      var d = picks(answers, p[0]).map(g);
      if (free(answers, p[0])) d.push(free(answers, p[0]));
      if (d.length) groups.push({ id: DJP.uid('it'), name: XSEC[p[1]][LI], level: '', detail: d.join(' · ') });
    });
    if (groups.length) {
      if (!sk) { sk = DJP.newSection('skills'); if (L !== 'hu' && DJP.secTitle('skills', L)) sk.title = DJP.secTitle('skills', L); cv.sections.push(sk); }
      var at = sk.items.length && /kommunikáció|communication|comunicare/i.test(sk.items[0].name || '') ? 1 : 0;
      sk.items.splice.apply(sk.items, [at, 0].concat(groups));
      mark(sk, 'Készségek: ' + groups.map(function (x) { return '„' + x.name + '”'; }).join(' és ') + ' csoport a válaszaid alapján');
    }
    var traits = picks(answers, 'q9');
    if (traits.length) {
      var tr = sec(cv, 'traits');
      if (!tr) { tr = DJP.newSection('traits'); if (L !== 'hu' && DJP.secTitle('traits', L)) tr.title = DJP.secTitle('traits', L); tr.isNew = true; cv.sections.push(tr); }
      tr.items = traits.map(function (n) { return { id: DJP.uid('it'), name: L === 'hu' ? n : (TRAITS[n] ? TRAITS[n][LI - 1] : DJP.tr(n, L)) }; });
      mark(tr, '„Ilyen vagyok”: a kiválasztott tulajdonságaid');
    }
    var crs = picks(answers, 'q10').filter(function (c) { return c !== 'B kategóriás jogosítvány'; }).map(g);
    if (free(answers, 'q10')) crs.push(uc(free(answers, 'q10')));
    if (crs.length) {
      var cs = sec(cv, 'courses');
      if (!cs) { cs = DJP.newSection('courses'); if (L !== 'hu' && DJP.secTitle('courses', L)) cs.title = DJP.secTitle('courses', L); cs.isNew = true; cv.sections.push(cs); }
      crs.forEach(function (t) { cs.items.push({ id: DJP.uid('it'), title: t, subtitle: '', city: '', start: '', end: '', desc: '' }); });
      mark(cs, 'Kurzusok kiegészítve: ' + crs.join(', '));
    }
    if (picks(answers, 'q10').indexOf('B kategóriás jogosítvány') >= 0 && !sec(cv, 'driving')) {
      var dr = DJP.newSection('driving');
      if (L !== 'hu' && DJP.secTitle('driving', L)) dr.title = DJP.secTitle('driving', L);
      dr.text = g('B kategóriás jogosítvány'); dr.ai = true; dr.isNew = true;
      cv.sections.push(dr);
      changes.push({ sectionId: dr.id, label: 'Új szakasz: Jogosítvány' });
    }
  }

  var RO_LVL = { 'Anyanyelvi szinten': 'Anyanyelv', 'C1 – magabiztos szóban és írásban': 'C1', 'B2 – tárgyalóképes': 'B2', 'Alapszinten': 'A2' };
  var TRAITS = { 'Proaktív': ['Proactive', 'Proactiv'], 'Megbízható': ['Reliable', 'De încredere'], 'Csapatjátékos': ['Team player', 'Spirit de echipă'], 'Felelősségteljes': ['Responsible', 'Responsabil'], 'Pontos': ['Accurate', 'Precis'], 'Türelmes': ['Patient', 'Răbdător'], 'Stressztűrő': ['Resilient under pressure', 'Rezistent la stres'] };
  var SEC_T = {
    tools: { hu: 'Szoftverek és rendszerek', en: 'Software & systems', ro: 'Software și sisteme' },
    avail: { hu: 'Rendelkezésre állás', en: 'Availability', ro: 'Disponibilitate' }
  };

  ai.boostGeneric = function (orig, answers, job) {
    var cv = DJP.clone(orig);
    var L = cv.lang || 'hu';
    var changes = [];
    function mark(s, label) { s.ai = true; changes.push({ sectionId: s.id, label: label }); }
    function g(c, l) { return (GCHIP[c] && GCHIP[c][l || L]) || c; }
    function newSec(kind) { var s = DJP.newSection(kind); if (L !== 'hu' && DJP.secTitle(kind, L)) s.title = DJP.secTitle(kind, L); return s; }
    function ensure(kind) { var s = sec(cv, kind); if (!s) { s = newSec(kind); cv.sections.push(s); } return s; }
    var jt = function (l) { return job ? ((job.titleI18n && job.titleI18n[l]) || job.title).replace(/\s*\(.*\)/, '') : ''; };

    if (job) { cv.personal.headline = jt(L); changes.push({ sectionId: 'personal', label: 'Címsor a megpályázott pozícióhoz igazítva' }); }

    /* tapasztalat évei */
    var exp = sec(cv, 'experience');
    var items = exp ? exp.items.filter(function (i) { return i.title; }) : [];
    var e0 = items[0];
    var years = items.map(function (i) { return +((i.start || '').match(/(19|20)\d{2}/) || [0])[0]; }).filter(Boolean);
    var yrs = years.length ? new Date().getFullYear() - Math.min.apply(null, years) : 0;
    var cur = e0 && (!e0.end || /jelen|present|prezent|curent|folyamat/i.test(e0.end));

    var q1 = picks(answers, 'q1'), q2 = picks(answers, 'q2'), q3 = picks(answers, 'q3'), q5 = picks(answers, 'q5'), q6 = picks(answers, 'q6');
    var roLvl = RO_LVL[picks(answers, 'q4')[0]] || '';
    function profile(l) {
      var out = [];
      if (l === 'en') {
        out.push(job ? 'I am a customer-focused, reliable professional.' : 'I am a reliable, results-oriented professional.');
        if (e0) out.push((yrs >= 2 ? 'I have over ' + yrs + ' years of professional experience and ' + (cur ? 'currently work' : 'most recently worked') : (cur ? 'I currently work' : 'Most recently I worked')) + ' as ' + e0.title + (e0.subtitle ? ' at ' + e0.subtitle : '') + '.');
        if (q1.length) out.push('My work has included ' + andJoin(q1.map(function (c) { return g(c, 'en'); }), 'and') + '.');
        if (q2.length) out.push('I confidently use ' + andJoin(q2.map(function (c) { return g(c, 'en'); }), 'and') + '.');
      } else if (l === 'ro') {
        out.push(job ? 'Sunt un profesionist orientat către client și de încredere.' : 'Sunt un profesionist de încredere, orientat spre rezultate.');
        if (e0) out.push((yrs >= 2 ? 'Am peste ' + yrs + ' ani de experiență profesională și ' + (cur ? 'în prezent lucrez' : 'cel mai recent am lucrat') : (cur ? 'În prezent lucrez' : 'Cel mai recent am lucrat')) + ' ca ' + e0.title + (e0.subtitle ? ' la ' + e0.subtitle : '') + '.');
        if (q1.length) out.push('Activitatea mea a inclus ' + andJoin(q1.map(function (c) { return g(c, 'ro'); }), 'și') + '.');
        if (q2.length) out.push('Folosesc cu încredere ' + andJoin(q2.map(function (c) { return g(c, 'ro'); }), 'și') + '.');
      } else {
        out.push(job ? 'Ügyfélközpontú, megbízható szakember vagyok.' : 'Megbízható, eredményorientált szakember vagyok.');
        if (e0) out.push((yrs >= 2 ? 'Több mint ' + yrs + ' éves szakmai tapasztalatom van; ' + (cur ? 'jelenleg' : 'legutóbb') : (cur ? 'Jelenleg' : 'Legutóbb')) + ' ' + lc(e0.title) + ' pozícióban ' + (cur ? 'dolgozom' : 'dolgoztam') + (e0.subtitle ? ' (' + e0.subtitle + ')' : '') + '.');
        if (q1.length) out.push('Munkám során ' + andJoin(q1.map(function (c) { return g(c, 'hu'); }), 'és') + ' is a feladataim közé tartozott.');
        if (q2.length) out.push('Magabiztosan használom a következő eszközöket: ' + q2.map(function (c) { return g(c, 'hu'); }).join(', ') + '.');
      }
      var ls = langSentence(cv, l, roLvl);
      if (ls) out.push(ls);
      var mot = q5.map(function (c) { return g(c, l); });
      if (l === 'en') out.push(job ? 'I would like to contribute to the success of ' + job.company + ' as ' + (/^[aeiou]/i.test(jt('en')) ? 'an ' : 'a ') + jt('en') + (mot.length ? ', because ' + andJoin(mot, 'and') : '') + '.' : 'I am looking for a team where I can take responsibility and keep growing' + (mot.length ? ', because ' + andJoin(mot, 'and') : '') + '.');
      else if (l === 'ro') out.push(job ? 'Aș dori să contribui la succesul ' + job.company + ' ca ' + lc(jt('ro')) + (mot.length ? ', deoarece ' + andJoin(mot, 'și') : '') + '.' : 'Caut o echipă în care să îmi asum responsabilități și să mă dezvolt' + (mot.length ? ', deoarece ' + andJoin(mot, 'și') : '') + '.');
      else out.push(job ? 'Szeretnék ' + lc(jt('hu')) + 'ként hozzájárulni ' + DJP.az(job.company) + ' sikereihez' + (mot.length ? ', mert ' + andJoin(mot, 'és') : '') + '.' : 'Olyan csapatot keresek, ahol felelősséget vállalhatok és tovább fejlődhetek' + (mot.length ? ', mert ' + andJoin(mot, 'és') : '') + '.');
      if (l === L && free(answers, 'q5')) out.push(uc(free(answers, 'q5')).replace(/[.]?$/, '.'));
      return out.join(' ');
    }
    var pr = ensure('profile');
    var all = { hu: profile('hu'), en: profile('en'), ro: profile('ro') };
    pr.text = all[L] || all.hu;
    pr.i18n = { text: all };
    if (cv.sections.indexOf(pr) > 0) { cv.sections.splice(cv.sections.indexOf(pr), 1); cv.sections.unshift(pr); }
    mark(pr, 'Bemutatkozás újraírva' + (job ? ' a hirdetéshez igazítva' : ''));

    /* tapasztalat: eredményorientált pontok */
    if (items.length) {
      items.slice(0, 4).forEach(function (it) { it.desc = ai.improveEntry(it, job, L === 'hu' ? undefined : L); });
      mark(exp, 'Tapasztalat: ' + Math.min(4, items.length) + ' pozíció pontjai eredményorientáltan átfogalmazva');
    }

    /* eredmények (új) */
    var achL = q3.map(function (c) { return g(c); });
    if (free(answers, 'q3')) achL.push(uc(free(answers, 'q3')).replace(/[.]?$/, '.'));
    if (achL.length) {
      var ach = sec(cv, 'achievements') || newSec('achievements');
      ach.text = (ach.text ? ach.text + '\n' : '') + achL.map(function (x) { return '• ' + x; }).join('\n');
      if (cv.sections.indexOf(ach) < 0) { ach.isNew = true; cv.sections.splice(1, 0, ach); }
      mark(ach, 'Eredmények kiemelve a válaszaid alapján');
    }

    /* készségek: a hirdetés kulcskészségei előre + szoftverek */
    var sk = ensure('skills');
    var have = function (n) { return sk.items.some(function (i) { return (i.name || '').toLowerCase() === n.toLowerCase(); }); };
    var add = job ? ai.suggestSkills(job, L === 'hu' ? undefined : L).filter(function (n) { return !have(n); }).slice(0, 3) : [];
    var tools = q2.map(function (c) { return g(c); });
    if (free(answers, 'q2')) tools.push(free(answers, 'q2'));
    var front = add.map(function (n) { return { id: DJP.uid('it'), name: n, level: '', detail: '' }; });
    if (tools.length) front.push({ id: DJP.uid('it'), name: SEC_T.tools[L] || SEC_T.tools.hu, level: '', detail: tools.join(' · ') });
    if (front.length) {
      sk.items = front.concat(sk.items);
      mark(sk, 'Készségek: ' + (add.length ? add.join(', ') + ' a hirdetés alapján előre sorolva' : '') + (add.length && tools.length ? '; ' : '') + (tools.length ? 'új „' + (SEC_T.tools[L] || SEC_T.tools.hu) + '” csoport' : ''));
    }

    /* nyelvtudás */
    if (roLvl) {
      var lg = ensure('languages');
      var ro = lg.items.find(function (l) { return canon(l.name)[0] === 'Román'; });
      if (ro) ro.level = roLvl; else lg.items.push({ id: DJP.uid('it'), name: canon('Román')[LI_IDX[L] || 0], level: roLvl });
      mark(lg, 'Román nyelvtudás pontosítva');
    }

    /* rendelkezésre állás (új) */
    var av6 = q6.map(function (c) { return g(c); });
    if (free(answers, 'q6')) av6.push(free(answers, 'q6'));
    if (av6.length) {
      var av = DJP.newSection('custom');
      av.title = SEC_T.avail[L] || SEC_T.avail.hu;
      av.text = av6.join(' · ');
      av.ai = true; av.isNew = true;
      cv.sections.push(av);
      changes.push({ sectionId: av.id, label: 'Új szakasz: ' + av.title });
    }

    /* q7–q10: értékesítés, panaszkezelés, tulajdonságok, kurzusok */
    applyExtraAnswers(cv, answers, L, mark, changes);

    /* Ilyen vagyok (új) */
    if (!sec(cv, 'traits')) {
      var tr = newSec('traits');
      tr.items = Object.keys(TRAITS).map(function (n) { return { id: DJP.uid('it'), name: L === 'en' ? TRAITS[n][0] : L === 'ro' ? TRAITS[n][1] : n }; });
      tr.ai = true; tr.isNew = true;
      cv.sections.push(tr);
      changes.push({ sectionId: tr.id, label: 'Új szakasz: Ilyen vagyok' });
    }
    return { cv: cv, changes: changes };
  };
  var LI_IDX = { hu: 0, en: 1, ro: 2 };

  DJP.ai = ai;
})(window.DJP);

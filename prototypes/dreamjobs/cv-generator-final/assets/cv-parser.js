/* DreamJobs prototípus – önéletrajz-kiolvasó (PDF, DOCX, DOC, RTF, TXT)
   A szöveget a böngészőben nyerjük ki (pdf.js, mammoth.js – cdnjs/jsdelivr),
   majd szabályalapú elemzővel a CV-generátor szerkezetébe rendezzük.
   Élesben ezt a lépést egy szerveroldali AI-modell végezné (lásd TERV.md). */
(function (DJP) {
  'use strict';

  /* ---------- külső könyvtárak betöltése igény szerint ---------- */
  var LIBS = {
    pdf: {
      test: function () { return window.pdfjsLib; },
      urls: ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'],
      after: function (url) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = url.replace('pdf.min.js', 'pdf.worker.min.js');
      }
    },
    docx: {
      test: function () { return window.mammoth; },
      urls: ['https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js']
    }
  };
  var loading = {};
  function loadLib(name) {
    var lib = LIBS[name];
    if (lib.test()) return Promise.resolve(lib.test());
    if (loading[name]) return loading[name];
    loading[name] = lib.urls.reduce(function (p, url) {
      return p.catch(function () {
        return new Promise(function (res, rej) {
          var s = document.createElement('script');
          s.src = url; s.async = true;
          s.onload = function () { if (lib.test()) { if (lib.after) lib.after(url); res(lib.test()); } else rej(new Error('load')); };
          s.onerror = function () { s.remove(); rej(new Error('load')); };
          document.head.appendChild(s);
        });
      });
    }, Promise.reject(new Error('start'))).catch(function () {
      loading[name] = null;
      throw new Error('A kiolvasó nem töltődött be – ellenőrizd az internetkapcsolatot.');
    });
    return loading[name];
  }

  /* ---------- szöveg kinyerése ---------- */
  function ext(name) { return ((name || '').split('.').pop() || '').toLowerCase(); }

  function readBuf(file) {
    if (file.arrayBuffer) return file.arrayBuffer();
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsArrayBuffer(file); });
  }

  function pdfLines(buf) {
    return loadLib('pdf').then(function (pdfjs) {
      return pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
    }).then(function (pdf) {
      var pages = [];
      for (var p = 1; p <= Math.min(pdf.numPages, 12); p++) pages.push(p);
      return Promise.all(pages.map(function (n) {
        return pdf.getPage(n).then(function (page) {
          var vw = page.getViewport({ scale: 1 }).width;
          return page.getTextContent().then(function (tc) { return { width: vw, items: tc.items }; });
        });
      }));
    }).then(function (pages) {
      var out = [], twoCol = false;
      pages.forEach(function (pg) {
        var items = pg.items.filter(function (i) { return i.str && i.str.trim(); }).map(function (i) {
          var fs = Math.hypot(i.transform[2], i.transform[3]) || i.height || 10;
          return { s: i.str, x: i.transform[4], y: i.transform[5], w: i.width || i.str.length * fs * 0.5, fs: fs };
        });
        var cols = splitColumns(items, pg.width);
        if (cols.length > 1) twoCol = true;
        cols.forEach(function (c) { out = out.concat(toLines(c)); out.push(''); });
        out.push('\f');
      });
      return { lines: out, twoCol: twoCol };
    });
  }

  /* kéthasábos (oldalsávos) elrendezés felismerése: függőleges rés, amit egy elem sem keresztez */
  function splitColumns(items, width) {
    if (items.length < 20) return [items];
    var bin = 4, n = Math.ceil(width / bin), cover = new Array(n + 1).fill(0);
    items.forEach(function (i) { for (var b = Math.max(0, Math.floor(i.x / bin)); b <= Math.min(n, Math.floor((i.x + i.w) / bin)); b++) cover[b]++; });
    var best = null, run = null;
    for (var b = Math.floor(n * 0.2); b <= Math.floor(n * 0.72); b++) {
      if (cover[b] === 0) { if (!run) run = { a: b, b: b }; else run.b = b; }
      else if (run) { if (!best || run.b - run.a > best.b - best.a) best = run; run = null; }
    }
    if (run && (!best || run.b - run.a > best.b - best.a)) best = run;
    if (!best || (best.b - best.a + 1) * bin < 10) return [items];
    var cut = (best.a + best.b + 1) / 2 * bin;
    var L = items.filter(function (i) { return i.x < cut; }), R = items.filter(function (i) { return i.x >= cut; });
    var chars = function (a) { return a.reduce(function (s, i) { return s + i.s.length; }, 0); };
    var share = chars(L) / (chars(L) + chars(R) || 1);
    if (share < 0.04 || share > 0.96) return [items];
    /* keskeny dátumoszlop (pl. klasszikus Europass) – soronként együtt olvassuk; oldalsáv – külön hasáb */
    var rows = {};
    L.forEach(function (i) { var k = Math.round(i.y / 3); rows[k] = (rows[k] || '') + ' ' + i.s; });
    var keys = Object.keys(rows);
    var dated = keys.filter(function (k) { return findRange(rows[k]); }).length;
    if (keys.length && dated / keys.length >= 0.3) return [items];
    return [L, R];
  }

  function toLines(items) {
    items = items.slice().sort(function (a, b) { return b.y - a.y || a.x - b.x; });
    var rows = [];
    items.forEach(function (i) {
      var r = rows[rows.length - 1];
      if (r && Math.abs(r.y - i.y) <= Math.max(2, Math.min(r.fs, i.fs) * 0.5)) r.items.push(i);
      else rows.push({ y: i.y, fs: i.fs, items: [i] });
    });
    var lines = [], prev = null;
    rows.forEach(function (r) {
      r.items.sort(function (a, b) { return a.x - b.x; });
      var t = '', end = null;
      r.items.forEach(function (i) {
        if (end !== null) {
          var gap = i.x - end;
          if (gap > i.fs * 1.6) t += ' \t ';
          else if (gap > i.fs * 0.12 && !/\s$/.test(t) && !/^\s/.test(i.s)) t += ' ';
        }
        t += i.s; end = i.x + i.w;
      });
      if (prev && prev.y - r.y > Math.max(prev.fs, r.fs) * 2.1) lines.push('');
      lines.push(t);
      prev = r;
    });
    return lines;
  }

  function docxLines(buf) {
    return loadLib('docx').then(function (mammoth) {
      return mammoth.convertToHtml({ arrayBuffer: buf });
    }).then(function (res) {
      var doc = new DOMParser().parseFromString('<div>' + res.value + '</div>', 'text/html');
      var lines = [];
      var txt = function (el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); };
      (function walk(el) {
        Array.prototype.forEach.call(el.children, function (c) {
          var tag = c.tagName.toLowerCase();
          if (tag === 'table') {
            Array.prototype.forEach.call(c.querySelectorAll('tr'), function (tr) {
              var cells = Array.prototype.filter.call(tr.children, function (td) { return txt(td); });
              if (cells.length === 2 && txt(cells[0]).length <= 40) {
                var paras = Array.prototype.map.call(cells[1].querySelectorAll('p, li, h1, h2, h3, h4'), function (p) { return (p.tagName === 'LI' ? '• ' : '') + txt(p); }).filter(Boolean);
                if (!paras.length) paras = [txt(cells[1])];
                lines.push(txt(cells[0]) + ' \t ' + paras[0]);
                lines.push.apply(lines, paras.slice(1));
              } else cells.forEach(function (td) { walk(td); });
              lines.push('');
            });
          } else if (tag === 'ul' || tag === 'ol') {
            Array.prototype.forEach.call(c.children, function (li) { if (txt(li)) lines.push('• ' + txt(li)); });
          } else if (/^(p|h\d|li)$/.test(tag)) {
            if (txt(c)) lines.push((tag === 'li' ? '• ' : '') + txt(c));
            else lines.push('');
          } else walk(c);
        });
      })(doc.body.firstChild);
      return { lines: lines };
    });
  }

  /* régi bináris .doc: a szöveg UTF-16 vagy 8 bites darabokban van – kinyerjük az olvasható szakaszokat */
  function docLines(buf) {
    var u8 = new Uint8Array(buf), out = [], cur = '';
    var flush = function () { if (cur.replace(/[^A-Za-zÀ-ž]/g, '').length >= 3) out.push(cur); cur = ''; };
    for (var i = 0; i + 1 < u8.length; i += 2) {
      var c = u8[i] | (u8[i + 1] << 8);
      if (c === 13 || c === 11) { flush(); continue; }
      if ((c >= 32 && c < 0x250) || c === 0x2013 || c === 0x2022 || c === 0x201E || c === 0x201D) cur += String.fromCharCode(c);
      else flush();
    }
    flush();
    var u16 = out.join('\n');
    if (u16.length < 200) {
      out = []; cur = '';
      for (var j = 0; j < u8.length; j++) {
        var b = u8[j];
        if (b === 13) { flush(); continue; }
        if ((b >= 32 && b < 127) || b >= 192) cur += String.fromCharCode(b); else flush();
      }
      flush();
    }
    return { lines: out, rough: true };
  }

  function rtfLines(text) {
    var t = text.replace(/\\par[d]?/g, '\n').replace(/\\'([0-9a-f]{2})/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
      .replace(/\\u(-?\d+)\??/g, function (m, n) { n = +n; return String.fromCharCode(n < 0 ? n + 65536 : n); })
      .replace(/\{\\\*[^{}]*\}/g, '').replace(/\\[a-z]+-?\d* ?/gi, '').replace(/[{}]/g, '');
    return { lines: t.split(/\n/) };
  }

  DJP.extractCVText = function (file) {
    var e = ext(file.name);
    if (/^(png|jpe?g|gif|webp|heic|bmp|tiff?)$/.test(e)) return Promise.reject(new Error('Képből (szkennelt CV-ből) a prototípus még nem tud szöveget kiolvasni. Tölts fel PDF-et vagy Word-dokumentumot.'));
    return readBuf(file).then(function (buf) {
      if (e === 'pdf' || (!e && new Uint8Array(buf.slice(0, 4)).join() === '37,80,68,70')) return pdfLines(buf);
      if (e === 'docx') return docxLines(buf);
      if (e === 'doc') return docLines(buf);
      var text = new TextDecoder('utf-8').decode(buf);
      if (e === 'rtf' || /^\{\\rtf/.test(text)) return rtfLines(text);
      return { lines: text.split(/\r?\n/) };
    });
  };

  /* ---------- segédek ---------- */
  function fold(s) {
    var o = '';
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i).normalize('NFD').charAt(0).toLowerCase(); o += c.length === 1 ? c : s.charAt(i); }
    return o;
  }
  function clean(s) { return (s || '').replace(/[  -​]/g, ' ').replace(/[-�]/g, '').replace(/[ ]{2,}/g, ' ').trim(); }
  function uc1(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function isCaps(s) { var l = s.replace(/[^A-Za-zÀ-ž]/g, ''); return l.length >= 2 && l === l.toUpperCase() && l !== l.toLowerCase(); }
  var ACRO = /^(AI|IT|SEO|GEO|CRM|UX|UI|UX\/UI|UI\/UX|PHP|SQL|CSS|HTML|PR|HR|B2B|B2C|SAP|ERP|CMS|API|PPC|GDPR|BA|MA|MBA|PHD|BBTE|UBB|EU|USA|UK|SRL|SA|KFT|BT|ZRT|LTD|LLC|GMBH|PFA|DELTA|CEC|EQF|EKKR)$/;
  function nice(s) {
    if (!isCaps(s)) return s;
    return uc1(s.split(/(\s+)/).map(function (w) { var b = w.replace(/[^A-Za-zÀ-ž\/]/g, ''); return ACRO.test(fold(b).toUpperCase()) ? w : w.toLowerCase(); }).join(''));
  }
  var BULLET = /^[•·▪●◦○■□►▸‣⁃✓✔\-–—*]\s*/;

  /* ---------- szakaszcímek (HU / EN / RO, ékezetek nélkül) ---------- */
  var HEAD = {
    profile: ['rolam', 'magamrol', 'bemutatkozas', 'szakmai osszefoglalo', 'osszefoglalo', 'szakmai profil', 'profil', 'celkituzes', 'karriercel', 'about me', 'about', 'summary', 'profile', 'professional summary', 'professional profile', 'personal profile', 'personal statement', 'career objective', 'objective', 'despre mine', 'profil profesional', 'profil personal', 'rezumat', 'rezumat profesional', 'obiectiv', 'obiectiv profesional'],
    experience: ['szakmai tapasztalat', 'szakmai tapasztalatok', 'munkatapasztalat', 'munkahelyi tapasztalat', 'tapasztalat', 'munkahelyek', 'korabbi munkahelyek', 'experience', 'work experience', 'professional experience', 'employment history', 'employment', 'work history', 'career history', 'relevant experience', 'experienta profesionala', 'experienta', 'experienta de munca', 'istoric profesional', 'activitate profesionala'],
    education: ['tanulmanyok', 'vegzettseg', 'iskolai vegzettseg', 'vegzettsegek', 'oktatas', 'kepzettseg', 'iskolak', 'education', 'education and training', 'education & training', 'academic background', 'academic qualifications', 'qualifications', 'studii', 'studii si formare', 'educatie', 'educatie si formare', 'educatie si formare profesionala', 'formare', 'pregatire profesionala'],
    courses: ['kurzusok', 'tanfolyamok', 'kepzesek', 'tovabbkepzesek', 'tanusitvanyok', 'oklevelek', 'kurzusok es tanusitvanyok', 'courses', 'certifications', 'certificates', 'trainings', 'training', 'licenses & certifications', 'licenses and certifications', 'courses and certifications', 'cursuri', 'certificari', 'certificate', 'cursuri si certificari'],
    projects: ['projektek', 'projects', 'proiecte', 'portfolio', 'portofoliu', 'personal projects', 'sajat projektek'],
    internships: ['szakmai gyakorlat', 'gyakorlat', 'gyakornoki program', 'internships', 'internship', 'stagii', 'stagiu', 'practica', 'stagii de practica'],
    skills: ['keszsegek', 'kompetenciak', 'kepessegek', 'szakmai keszsegek', 'digitalis keszsegek', 'szamitogepes ismeretek', 'informatikai ismeretek', 'egyeb keszsegek', 'szemelyes keszsegek', 'skills', 'key skills', 'technical skills', 'core skills', 'hard skills', 'soft skills', 'competencies', 'core competencies', 'digital skills', 'it skills', 'computer skills', 'abilities', 'competente', 'abilitati', 'aptitudini', 'competente digitale', 'competente personale', 'competente profesionale', 'competente tehnice', 'competente de comunicare', 'competente organizatorice', 'competente organizationale', 'competente si aptitudini', 'communication skills', 'organisational skills', 'organizational skills', 'management and leadership skills', 'job-related skills'],
    languages: ['nyelvtudas', 'nyelvek', 'nyelvismeret', 'idegen nyelvek', 'nyelvi kompetenciak', 'languages', 'language skills', 'foreign languages', 'limbi straine', 'limbi', 'competente lingvistice', 'limba materna', 'limba(i) materna(e)', 'mother tongue(s)', 'mother tongue'],
    hobbies: ['hobbik', 'hobbi', 'hobbijaim', 'szabadido', 'szabadidos tevekenysegek', 'hobbies', 'hobbies and interests', 'hobbies & interests', 'hobby-uri', 'hobbyuri', 'pasiuni', 'hobbiuri', 'hobby-uri si teme de interes', 'hobbik es erdeklodesi korok'],
    interests: ['erdeklodesi kor', 'erdeklodesi korok', 'erdeklodes', 'interests', 'areas of interest', 'interese', 'domenii de interes', 'arii de interes', 'teme de interes'],
    driving: ['jogositvany', 'vezetoi engedely', 'driving licence', 'driving license', "driver's license", 'permis de conducere', 'permis auto'],
    achievements: ['eredmenyek', 'eredmenyeim', 'dijak', 'elismeresek', 'achievements', 'awards', 'honors', 'honours and awards', 'realizari', 'premii', 'distinctii'],
    references: ['referenciak', 'ajanlasok', 'references', 'referinte', 'recomandari'],
    personal: ['szemelyes adatok', 'elerhetoseg', 'elerhetosegek', 'kapcsolat', 'kapcsolattartas', 'contact', 'contacts', 'contact details', 'contact information', 'personal information', 'personal details', 'personal data', 'informatii personale', 'date personale', 'date de contact', 'curriculum vitae', 'onetrajz', 'oneletrajz', 'resume', 'europass', 'cv'],
    volunteer: ['onkentesseg', 'onkentes munka', 'volunteering', 'volunteer experience', 'volunteer work', 'voluntariat', 'activitati de voluntariat'],
    publications: ['publikaciok', 'publications', 'publicatii'],
    other: ['egyeb', 'egyeb informaciok', 'additional information', 'other', 'other information', 'informatii suplimentare', 'alte informatii']
  };
  var HEAD_MAP = {};
  Object.keys(HEAD).forEach(function (k) { HEAD[k].forEach(function (h) { HEAD_MAP[h] = k; }); });
  var CUSTOM_TITLE = { volunteer: 'Önkéntesség', publications: 'Publikációk', other: 'Egyéb információk' };

  function headingKind(line) {
    if (!line || line.length > 52) return null;
    var f = fold(line).replace(/^[\s\d.)#•▪●■►\-–—*|:]+/, '').replace(/[\s:.|]+$/, '').replace(/\s+/g, ' ').trim();
    if (!f || f.split(' ').length > 6) return null;
    if (HEAD_MAP[f]) return HEAD_MAP[f];
    /* „Skills & Tools”, „Nyelvtudás:” stb. – az első 1–3 szó egyezése */
    var w = f.split(/[\s&/,]+/);
    for (var k = Math.min(3, w.length); k >= 1; k--) {
      var p = w.slice(0, k).join(' ');
      if (HEAD_MAP[p] && (k >= 2 || w.length <= 3)) return HEAD_MAP[p];
    }
    return null;
  }

  /* ---------- dátumok ---------- */
  var MON = '(?:jan(?:uary|uar)?|ian(?:uarie)?|febr?(?:uary|uar|uarie)?|mar(?:ch|cius|tie|c)?|apr(?:il|ilis|ilie)?|ma(?:y|jus|j|i)|iun(?:ie)?|jun(?:e|ius)?|iul(?:ie)?|jul(?:y|ius)?|aug(?:ust|usztus)?|szept(?:ember)?|sept?(?:ember|embrie)?|oct(?:ober|ombrie)?|okt(?:ober)?|nov(?:ember)?|noi(?:embrie)?|dec(?:ember|embrie)?)\\.?';
  var MONTHS = [['jan', 'ian'], ['feb'], ['mar'], ['apr'], ['may', 'maj', 'mai'], ['jun', 'iun'], ['jul', 'iul'], ['aug'], ['sep', 'szep'], ['oct', 'okt'], ['nov', 'noi'], ['dec']];
  var DATE = '(?:(?<!\\d)\\d{4}[./-]\\d{1,2}(?:[./-]\\d{1,2})?\\.?(?!\\d)|(?<!\\d)(?:\\d{1,2}[./-]){1,2}\\d{4}(?!\\d)|(?<![a-z])(?:\\d{1,2}\\.?\\s*)?' + MON + '\\s*,?\\s*\\d{4}(?!\\d)|(?<!\\d)\\d{4}\\.?\\s*' + MON + '(?![a-z])|(?<![\\d/.-])(?:19[5-9]\\d|20[0-4]\\d)(?![\\d/])\\.?)';
  var PRESENT = '(?:present|current(?:ly)?|now|today|ongoing|jelenleg|jelen|napjainkig|mostanaig|folyamatban|in prezent|pana in prezent|prezent|curent|actual|in curs)';
  var RANGE_RE = new RegExp('(' + DATE + ')(?:\\s*(?:-|–|—|to|until|till|pana in|pana la|ig|→|>)\\s*(' + DATE + '|' + PRESENT + '))?', 'i');
  var SINCE_RE = new RegExp('(?:since|from|din|incepand cu)\\s+(' + DATE + ')|(' + DATE + ')\\s*(?:ota|tol|-tol|-tól|óta)', 'i');

  function normDate(raw) {
    if (!raw) return '';
    var f = fold(raw).trim();
    if (new RegExp('^' + PRESENT + '$', 'i').test(f)) return 'jelenleg';
    var y = (f.match(/(19[5-9]\d|20[0-4]\d)/) || [])[1];
    if (!y) return clean(raw);
    var m = null, mm;
    if ((mm = f.match(/^(\d{4})[./-](\d{1,2})/))) m = +mm[2];
    else if ((mm = f.match(/^(?:(\d{1,2})[./-])?(\d{1,2})[./-]\d{4}/))) m = +mm[2];
    else MONTHS.forEach(function (arr, i) { arr.forEach(function (a) { if (new RegExp('(^|[^a-z])' + a).test(f)) m = m || i + 1; }); });
    return m && m >= 1 && m <= 12 ? y + '.' + (m < 10 ? '0' : '') + m : y;
  }

  /* dátumtartomány keresése egy sorban → {start, end, rest} */
  function findRange(line) {
    if (/@|https?:|www\./i.test(line)) return null;
    var f = fold(line);
    var m = f.match(RANGE_RE), s = f.match(SINCE_RE);
    if (!m && !s) return null;
    var idx, len, a, b;
    if (m && (!s || m.index <= s.index)) { idx = m.index; len = m[0].length; a = line.substr(idx, m[1].length); b = m[2] ? line.substr(idx + len - m[2].length, m[2].length) : ''; }
    else { idx = s.index; len = s[0].length; a = line.substr(idx + s[0].indexOf(s[1] || s[2]), (s[1] || s[2]).length); b = 'jelenleg'; }
    var yr = +(fold(a).match(/(19[5-9]\d|20[0-4]\d)/) || [])[1];
    if (!yr || yr > new Date().getFullYear() + 6) return null;
    var rest = (line.slice(0, idx) + ' ' + line.slice(idx + len)).replace(/[\[\]()|]/g, ' ').replace(/^\s*[-–—,:;]\s*|\s*[-–—,:;]\s*$/g, '');
    /* csak évszám egy hosszú mondat közepén – nem dátumsor */
    if (!m || !m[2]) { if (clean(rest).length > 90) return null; }
    return { start: normDate(a), end: b ? normDate(b) : '', rest: rest };
  }

  /* ---------- elérhetőségek ---------- */
  var EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
  var URL_RE = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s,;|]*)?/i;
  var PHONE_RE = /\(?(?:\+|00)?\(?\d{1,4}\)?(?:[\s.\-\/]?\(?\d{1,4}\)?){2,5}/g;
  var LABEL = {
    email: /^(e-?mail(?: address)?|email cím|e-mail cím|adresa de e-?mail|adresa de email)\s*[:\-]/i,
    phone: /^(phone(?: number)?|tel(?:efon)?(?:szám)?|mobil(?:e)?|telefon mobil|numar de telefon|număr de telefon)\s*[:\-]/i,
    address: /^(address|home address|adresa|adresă|domiciliu|cím|lakcím|lakhely|értesítési cím)\s*[:\-]/i,
    birthDate: /^(date of birth|born|birth date|data nasterii|data nașterii|data naşterii|születési (?:dátum|idő)|született|szül\.)\s*[:\-]?/i,
    birthPlace: /^(place of birth|locul nasterii|locul nașterii|születési hely)\s*[:\-]/i,
    nationality: /^(nationality|citizenship|nationalitate|naționalitate|cetatenie|cetățenie|állampolgárság|nemzetiség)\s*[:\-]/i,
    gender: /^(gender|sex|gen|nem)\s*:/i,
    driving: /^(driving licen[cs]e|driver'?s licen[cs]e|permis(?: de conducere)?|jogosítvány|vezetői engedély)\s*[:\-]?/i,
    linkedin: /^linkedin\s*[:\-]/i,
    website: /^(website|web|honlap|weboldal|portfolio|portofoliu|site)\s*[:\-]/i,
    whatsapp: /^whatsapp\s*[:\-]/i
  };

  function phoneIn(line) {
    var best = null;
    (line.match(PHONE_RE) || []).forEach(function (p) {
      var d = p.replace(/\D/g, '');
      if (d.length >= 9 && d.length <= 15 && !/^(19|20)\d{2}(19|20)\d{2}$/.test(d) && (!best || d.length > best.replace(/\D/g, '').length)) best = p.trim();
    });
    return best;
  }

  /* ---------- nyelvek ---------- */
  var LANGS = [
    [/^(magyar|hungarian|maghiar[ae]?|ungarisch)$/, ['Magyar', 'Hungarian', 'Maghiară']],
    [/^(roman|romanian|romana|rumanian|rumanisch)$/, ['Román', 'Romanian', 'Română']],
    [/^(angol|english|engleza?|englisch)$/, ['Angol', 'English', 'Engleză']],
    [/^(nemet|german|germana|deutsch)$/, ['Német', 'German', 'Germană']],
    [/^(francia|french|franceza|francais)$/, ['Francia', 'French', 'Franceză']],
    [/^(olasz|italian|italiana)$/, ['Olasz', 'Italian', 'Italiană']],
    [/^(spanyol|spanish|spaniola|espanol)$/, ['Spanyol', 'Spanish', 'Spaniolă']],
    [/^(orosz|russian|rusa)$/, ['Orosz', 'Russian', 'Rusă']],
    [/^(ukran|ukrainian|ucraineana)$/, ['Ukrán', 'Ukrainian', 'Ucraineană']],
    [/^(szlovak|slovak|slovaca)$/, ['Szlovák', 'Slovak', 'Slovacă']],
    [/^(szerb|serbian|sarba)$/, ['Szerb', 'Serbian', 'Sârbă']],
    [/^(horvat|croatian|croata)$/, ['Horvát', 'Croatian', 'Croată']],
    [/^(lengyel|polish|poloneza)$/, ['Lengyel', 'Polish', 'Poloneză']],
    [/^(portugal|portuguese|portugheza)$/, ['Portugál', 'Portuguese', 'Portugheză']],
    [/^(holland|dutch|olandeza)$/, ['Holland', 'Dutch', 'Olandeză']],
    [/^(cseh|czech|ceha)$/, ['Cseh', 'Czech', 'Cehă']],
    [/^(torok|turkish|turca)$/, ['Török', 'Turkish', 'Turcă']],
    [/^(kinai|chinese|chineza|mandarin)$/, ['Kínai', 'Chinese', 'Chineză']],
    [/^(japan|japanese|japoneza)$/, ['Japán', 'Japanese', 'Japoneză']],
    [/^(arab|arabic|araba)$/, ['Arab', 'Arabic', 'Arabă']],
    [/^(bolgar|bulgarian|bulgara)$/, ['Bolgár', 'Bulgarian', 'Bulgară']],
    [/^(gorog|greek|greaca)$/, ['Görög', 'Greek', 'Greacă']],
    [/^(sved|swedish|suedeza)$/, ['Svéd', 'Swedish', 'Suedeză']],
    [/^(finn|finnish|finlandeza)$/, ['Finn', 'Finnish', 'Finlandeză']]
  ];
  var LI = { hu: 0, en: 1, ro: 2 };
  function langLevel(f) {
    var c = f.match(/(?<![a-z])([abc][12])(?![0-9])/i);
    if (/anyanyelv|native|mother tongue|matern|nativ|bilingual|ketnyelvu/.test(f)) return 'Anyanyelv';
    if (c) return c[1].toUpperCase();
    if (/felsofok|fluent|folyekony|proficient|avansat|advanced|expert|fluent/.test(f)) return 'C1';
    if (/kozepfok|intermediate|intermediar|mediu|conversational|targyalokepes|good|jo szint/.test(f)) return 'B2';
    if (/alapfok|basic|beginner|incepator|elementary|elementar|alapszint/.test(f)) return 'A2';
    return '';
  }
  function parseLanguages(lines, L) {
    var out = [], seen = {};
    var names = function (f) {
      var found = [];
      f.split(/[^a-z]+/).forEach(function (w) { LANGS.forEach(function (l) { if (l[0].test(w)) found.push({ name: l[1][LI[L] || 0], w: w }); }); });
      return found;
    };
    lines.forEach(function (raw, li) {
      var f = fold(raw);
      var nat = /limba\(?i?\)? materna|mother tongue|anyanyelv|native/.test(f);
      names(f).forEach(function (x) {
        if (seen[x.name]) return;
        /* a szint a nyelv neve után (a következő nyelvig), vagy a következő pár sorban */
        var after = f.slice(f.indexOf(x.w));
        var lvl = nat ? 'Anyanyelv' : langLevel(after.split(/[,;|]/)[0]) || langLevel(after);
        for (var k = li + 1; !lvl && k < Math.min(lines.length, li + 5); k++) {
          var nf = fold(lines[k] || '');
          if (names(nf).length || headingKind(lines[k] || '')) break;
          lvl = langLevel(nf);
        }
        seen[x.name] = 1;
        out.push({ id: DJP.uid('it'), name: x.name, level: lvl || 'B2' });
      });
    });
    return out;
  }

  /* ---------- tételek (tapasztalat, tanulmányok, kurzusok…) ---------- */
  var INST_RE = /universit|egyetem|foiskola|college|school|liceu|liceum|gimnazium|academ|akademia|institut|intezet|facultatea|scoala|colegiu|szakkozep|technikum|szakiskola|polytechnic/;
  var COMPANY_RE = /(^|\s)(s\.?r\.?l\.?(-d)?|s\.a\.|sa|kft\.?|bt\.?|zrt\.?|nyrt\.?|ltd\.?|llc|gmbh|inc\.?|pfa|corp\.?|plc)(?=\s|,|$)/i;
  var COUNTRY = /(romania|magyarorszag|hungary|ungaria|germany|germania|nemetorszag|austria|ausztria|anglia|england|united kingdom|uk|spain|spanyolorszag|spania|italy|italia|olaszorszag|france|franta|franciaorszag|online|remote|tavmunka|hibrid|hybrid)\.?$/;
  function isLocation(s) {
    var f = fold(clean(s)).replace(/\((acasa|home|otthoni)\)/, '').trim();
    if (!f || f.length > 70 || /\d{3}/.test(f) || COMPANY_RE.test(s) || INST_RE.test(f)) return false;
    if (/^(online|remote|tavmunka|hibrid|hybrid|onsite)$/.test(f)) return true;
    return (/,/.test(f) && COUNTRY.test(f)) || /judetul|megye|county|jud\./.test(f);
  }
  var LOC_LABEL = /^(city|oras|oraș|localitate|varos|város|helyszin|helyszín|location|country|tara|țară|orszag|ország)\s*:/i;
  var FIELD_LABEL = /^(field\(s\) of study|fields? of study|domeniu\(i\) de studiu|domeniu de studiu|domeniul|szak:|specializarea|specialization|level in eqf|nivel(ul)? (in|în) cec|nivel cec|eqf|ekkr|final grade|nota finala|nota finală|thesis|lucrare|department|departament|business or sector|tipul|type of business)/i;
  var LINK_LINE = /^(website|site de internet|site web|weboldal|link|honlap|web)\b\s*:?\s*/i;

  function sentenceEnd(t) {
    if (/[!?;]$/.test(t)) return true;
    if (!/\.$/.test(t)) return false;
    return !(COMPANY_RE.test(t.slice(-8)) || /(^|\s)[A-ZÀ-Ž]\.$/.test(t) || /(^|\s)(nr|str|u|kb|pl|etc|ca|inc|ltd|co)\.$/i.test(t));
  }
  function parseEntries(lines, kind) {
    var items = [], cur = null, skipWrap = false;
    var push = function () { if (cur && (cur.title || cur.subtitle || cur.desc.length)) items.push(cur); cur = null; };
    var start = function () { push(); cur = { title: '', subtitle: '', city: '', start: '', end: '', desc: [] }; };
    var addDesc = function (t, bullet) {
      var d = cur.desc, last = d[d.length - 1];
      if (bullet) d.push('• ' + t);
      else if (last && !/[.!?:;]$/.test(last) && (/^[a-zà-ž(]/.test(t) || last.length > 60)) d[d.length - 1] = last + ' ' + t;
      else d.push(t);
    };
    var dateAhead = function (i) {
      for (var k = i + 1, seen = 0; k < lines.length && seen < 3; k++) { if (!clean(lines[k])) continue; seen++; if (findRange(clean(lines[k]))) return true; }
      return false;
    };
    var setHead = function (t) {
      if (!cur.city && isLocation(t)) cur.city = t;
      else if (!cur.title) cur.title = t;
      else if (!cur.subtitle) cur.subtitle = t;
      else return false;
      return true;
    };

    lines.forEach(function (raw, i) {
      var line = clean(raw);
      if (skipWrap) { skipWrap = false; if (/^\S+$/.test(line) && !findRange(line)) return; }
      if (!line) { if (cur) cur._gap = true; return; }
      var bullet = BULLET.test(line) && !/^[-–—]\s*\d/.test(line);
      var text = clean(line.replace(BULLET, '')).replace(/\s*\t\s*/g, '\t');
      /* linkek: projekteknél a „Link” mezőbe, máshol elhagyjuk */
      var flat = text.replace(/\t/g, ' ');
      if ((LINK_LINE.test(flat) && URL_RE.test(flat)) || /^(https?:\/\/|www\.)\S+$/.test(flat)) {
        var u = (flat.replace(LINK_LINE, '').match(URL_RE) || [''])[0].replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        if (cur && kind === 'projects' && !cur.city) cur.city = u;
        if (cur) cur._gap = true; /* a link lezárja a tételt */
        if (/[-\/_]$/.test(flat)) skipWrap = true;
        return;
      }
      var r = bullet ? null : findRange(text);
      if (r) {
        var parts = r.rest.split(/\t/).map(clean).filter(Boolean);
        if (!(cur && !cur.start && !cur.desc.length && (cur.title || cur.subtitle || cur.city))) start();
        cur.start = r.start; cur.end = r.end;
        parts.forEach(function (p) {
          if (LOC_LABEL.test(p)) cur.city = clean(p.replace(LOC_LABEL, ''));
          else if (!setHead(p)) addDesc(p);
        });
        return;
      }
      text = text.replace(/\t/g, ' – ');
      if (LOC_LABEL.test(text)) {
        if (!cur) start();
        var loc = text.split(/\s+(?=(?:country|tara|ország|orszag|țară)\s*:)/i).map(function (p) { return clean(p.replace(LOC_LABEL, '').replace(/^(country|țară|tara|ország)\s*:/i, '')); });
        cur.city = (cur.city ? cur.city + ', ' : '') + loc.filter(Boolean).join(', ');
        return;
      }
      if (cur && FIELD_LABEL.test(text)) { cur.desc.push(text); return; }
      var short = text.length <= 90 && !sentenceEnd(text);
      /* dátum után a cím lehet hosszabb is (pl. „Licențiat în … Universitatea …”) */
      if (!bullet && cur && cur.start && !cur.title && !cur.desc.length && text.length <= 150 && !sentenceEnd(text) && !/:$/.test(text)) { cur.title = text; return; }
      if (!bullet && short && !/:$/.test(text)) {
        if (!cur) { start(); setHead(text); return; }
        var fresh = !cur.desc.length;
        var header = text.length <= 80 && /^([A-ZÀ-Ž0-9„"]|www.|https?:)/.test(text);
        /* új tétel: üres sor vagy közeli dátum után – akkor is, ha az előzőnek még nincs leírása */
        if (header && ((!fresh && (cur._gap || dateAhead(i))) || (cur.start && cur.title && (cur._gap || cur.subtitle) && dateAhead(i)))) { start(); setHead(text); return; }
        if (fresh) {
          if (/^\(/.test(text) && (cur.title || cur.subtitle)) { if (cur.subtitle) cur.subtitle += ' ' + text; else cur.title += ' ' + text; return; }
          if (setHead(text)) return;
        }
      }
      if (!cur) start();
      if (cur._gap && cur.desc.length && !bullet) cur.desc.push(text); else addDesc(text, bullet);
      cur._gap = false;
    });
    push();
    return items.map(function (it) {
      /* „Pozíció | Cég”, „Pozíció – Cég”, „Pozíció at Cég” szétválasztása */
      if (it.title && !it.subtitle) {
        var m = it.title.match(/^(.{3,80}?)\s+(?:\||–|—|@|at|la|-)\s+(.{2,80})$/);
        if (m) { it.title = m[1]; it.subtitle = m[2]; }
      }
      /* cégnév + helyszín egy sorban: „Farma-Line SRL Sepsiszentgyörgy, …” */
      [['title'], ['subtitle']].forEach(function (k) {
        var v = it[k[0]], cm = v && v.match(COMPANY_RE);
        if (cm) {
          var end = cm.index + cm[0].length, rest = clean(v.slice(end)).replace(/^[,–—\-|]\s*/, '');
          if (rest && !it.city && (isLocation(rest) || /,/.test(rest) || (rest.length <= 40 && !/\d/.test(rest) && rest.split(/\s+/).length <= 4))) { it.city = rest; it[k[0]] = clean(v.slice(0, end)); }
        }
      });
      /* a cég/intézmény legyen az alcím, a pozíció/végzettség a cím */
      var isOrg = function (v) { return v && (COMPANY_RE.test(v) || INST_RE.test(fold(v))); };
      if (it.title && !it.subtitle) {
        var cp = commaSplit(it.title);
        if (cp.length >= 2) {
          var oi = cp.findIndex(isOrg);
          if (oi >= 0 && cp.length - 1 >= 1) { it.subtitle = cp[oi]; it.title = cp.filter(function (x, j) { return j !== oi; }).join(', '); }
        }
      }
      if (it.subtitle && isOrg(it.title) && !isOrg(it.subtitle)) { var t = it.title; it.title = it.subtitle; it.subtitle = t; }
      /* intézmény a cím végén vagy közepén: „Masterat … Universitatea” + „Babeș-Bolyai, …” */
      var INST_WORD = /\s((?:Universitatea|Universitas|University(?: of)?|Liceul(?: Tehnologic| Teoretic)?|Colegiul(?: Național| Tehnic)?|Școala|Scoala|Facultatea|Academia)\b.*)$/;
      var iw = it.title && it.title.match(INST_WORD);
      if (iw && iw.index > 8) {
        it.subtitle = clean(iw[1] + (it.subtitle ? ' ' + it.subtitle : ''));
        it.title = clean(it.title.slice(0, iw.index)).replace(/[–\-,]$/, '').trim();
      }
      if (it.subtitle && /,/.test(it.subtitle) && !it.city) {
        var sp = it.subtitle.split(/,\s*/);
        var rest2 = sp.slice(1).join(', ');
        if (sp.length >= 2 && (isLocation(rest2) || (isOrg(sp[0]) && rest2.length <= 30 && rest2.split(/\s+/).length <= 3 && !/\d/.test(rest2)))) { it.city = rest2; it.subtitle = sp[0]; }
      }
      return { id: DJP.uid('it'), title: nice(it.title), subtitle: nice(it.subtitle), city: it.city, start: it.start, end: it.end, desc: it.desc.join('\n') };
    });
  }

  /* ---------- készségek ---------- */
  var SKILL_LVL = [[/expert|szakerto|mester/, 'Szakértő'], [/advanced|halado|avansat|proficient/, 'Haladó'], [/intermediate|kozepes|kozephalado|mediu|intermediar/, 'Közepes'], [/basic|alap|elementary|elementar/, 'Alapszint'], [/beginner|kezdo|incepator/, 'Kezdő']];
  function skillLevel(f) { for (var i = 0; i < SKILL_LVL.length; i++) if (SKILL_LVL[i][0].test(f)) return SKILL_LVL[i][1]; return ''; }
  function splitList(l) { return l.replace(BULLET, '').split(/\s*\t\s*|\s*[•·|;]\s*|\s{3,}/).map(clean).filter(Boolean); }
  function commaSplit(l) {
    var out = [], d = 0, cur = '';
    for (var i = 0; i < l.length; i++) {
      var c = l.charAt(i);
      if (c === '(' || c === '[') d++;
      if (c === ')' || c === ']') d = Math.max(0, d - 1);
      if (c === ',' && !d) { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur);
    return out.map(clean).filter(Boolean);
  }
  function listParts(l) {
    var p = splitList(l);
    if (p.length === 1) { var c = commaSplit(p[0]); if (c.length >= 2 && c.every(function (x) { return x.length <= 45; })) p = c; }
    return p;
  }
  function parseSkills(lines, title) {
    var out = [];
    var add = function (name, detail) {
      name = clean(name.replace(BULLET, '')).replace(/[.;,:]$/, '');
      if (!name || name.length > 90) return;
      var lvl = '';
      var m = name.match(/^(.+?)\s*[(–\-:]\s*(expert|advanced|intermediate|basic|beginner|szakértő|haladó|közepes|alapszint|alapfok|kezdő|avansat|mediu|începător|incepator)\)?$/i);
      if (m && !detail) { name = m[1]; lvl = skillLevel(fold(m[2])); }
      if (out.some(function (o) { return fold(o.name) === fold(name); })) return;
      out.push({ id: DJP.uid('it'), name: nice(name), level: lvl, detail: detail || '' });
    };
    var merged = [];
    lines.filter(function (l) { return clean(l); }).forEach(function (raw) {
      var l = clean(raw).replace(/\s*\t\s*/g, '\t');
      var last = merged[merged.length - 1];
      if (last && /^[a-zà-ž(]/.test(l) && !isCaps(last)) merged[merged.length - 1] = last + ' ' + l;
      else merged.push(l);
    });
    if (!merged.length) return out;
    var avg = merged.reduce(function (s, l) { return s + l.length; }, 0) / merged.length;
    var listy = merged.some(function (l) { return listParts(l).length >= 2 || /:\s/.test(l); });
    if (avg > 70 && !listy) { add(title || 'Készségek', merged.join(' ')); return out; }
    if (title) {
      var all = [];
      merged.forEach(function (l) { if (!isCaps(l)) all = all.concat(listParts(l)); });
      add(title, all.join(' · '));
      return out;
    }
    var group = null;
    var flush = function () { if (group) { add(group.name, group.parts.join(' · ')); group = null; } };
    merged.forEach(function (l) {
      if (isCaps(l) && l.length <= 50 && !/[\t•·|;,]/.test(l)) { flush(); group = { name: l, parts: [] }; return; }
      if (group) { group.parts = group.parts.concat(listParts(l)); return; }
      var colon = l.match(/^([^:\t]{2,40}):\s*(.+)$/);
      if (colon) { add(colon[1], listParts(colon[2]).join(' · ')); return; }
      listParts(l).forEach(function (x) { add(x); });
    });
    flush();
    return out;
  }

  function joinText(lines, list) {
    var out = [];
    lines.forEach(function (raw) {
      var l = clean(raw.replace(/\t/g, ' '));
      if (!l) return;
      var b = BULLET.test(l);
      var t = clean(l.replace(BULLET, ''));
      var last = out[out.length - 1];
      if (b || !last || /[.!?:]$/.test(last)) out.push(b ? '• ' + t : t);
      else out[out.length - 1] = last + ' ' + t;
    });
    if (list && out.every(function (o) { return o.replace(/^• /, '').length < 50; })) return out.map(function (o) { return o.replace(/^• /, ''); }).join(', ');
    return out.join('\n');
  }

  /* ---------- nyelv felismerése ---------- */
  function detectLang(text) {
    var f = fold(text);
    var score = { hu: 0, en: 0, ro: 0 };
    if (/[őű]/i.test(text)) score.hu += 6;
    if (/[șşțţăâî]/i.test(text)) score.ro += 6;
    ['tapasztalat', 'tanulmany', 'keszseg', 'nyelv', 'egyetem', 'jelenleg', ' es ', ' a ', ' az ', 'munka'].forEach(function (w) { if (f.indexOf(w) >= 0) score.hu += 1; });
    ['experience', 'education', 'skills', 'university', ' and ', ' the ', ' of ', 'present', 'responsible'].forEach(function (w) { if (f.indexOf(w) >= 0) score.en += 1; });
    ['experienta', 'educatie', 'competente', 'universitatea', ' si ', ' de ', ' in ', 'prezent', 'limba'].forEach(function (w) { if (f.indexOf(w) >= 0) score.ro += 1; });
    return Object.keys(score).sort(function (a, b) { return score[b] - score[a]; })[0];
  }

  /* ---------- cím ---------- */
  var STREET = /(^|\s)(str\.|strada|utca|u\.|street|st\.|road|bd\.|bulevard|bulevardul|calea|aleea|piata|piața|tér|út|útja|sos\.|șos\.|nr\.)(\s|$)/i;
  function addressFrom(lines) {
    var out = [], on = false;
    for (var i = 0; i < lines.length && out.length < 3; i++) {
      var t = clean((lines[i] || '').split('\t')[0]);
      if (!t) { if (on) break; continue; }
      if (!on && (STREET.test(t) || /^\d{4,6}\s+[A-ZÀ-Ž]/.test(t))) on = true;
      else if (on && !(/^\d{4,6}\s/.test(t) || isLocation(t) || /,$/.test(out[out.length - 1] || '') || /^(romania|românia|magyarország|hungary)/i.test(t))) break;
      if (on) out.push(t.replace(/\s*\((home|acasă|acasa|otthoni|work|munkahelyi)\)\s*$/i, ''));
    }
    return clean(out.join(' ').replace(/,\s*,/g, ',').replace(/,?\s*$/, ''));
  }

  /* ---------- a fő elemző: sorok → CV ---------- */
  DJP.parseCVText = function (rawLines, opts) {
    opts = opts || {};
    var user = opts.user || {};
    var warnings = [];
    /* tisztítás: oldalszámok, ismétlődő fej-/láblécek, Europass-lábléc */
    /* ismétlődő fej-/lábléc: csak az oldaltörések körüli sorokból */
    var counts = {}, edge = {};
    rawLines.forEach(function (l, i) {
      if (l !== '\f') return;
      [-3, -2, -1, 1, 2, 3].forEach(function (d) { var c = clean(rawLines[i + d] || ''); if (c && rawLines[i + d] !== '\f') { edge[c] = 1; counts[c] = (counts[c] || 0) + 1; } });
    });
    var seen = {};
    var lines = [];
    rawLines.forEach(function (l) {
      var c = l === '\f' ? '' : clean(l.replace(/\u0000/g, ''));
      if (!c) { if (lines.length && lines[lines.length - 1] !== '') lines.push(''); return; }
      var f = fold(c);
      if (/^(page|oldal|pagina|pag\.?)?\s*\d{1,2}\s*(\/|of|din|-|\|)\s*\d{1,2}$/.test(f) || /^\d{1,2}$/.test(f)) return;
      if (/europass|© european union|curriculum vitae$/.test(f) && c.length < 90 && !/@/.test(c)) return;
      if (edge[c] && counts[c] > 1 && c.length < 70 && seen[c] && !findRange(c) && !headingKind(c)) return;
      seen[c] = 1;
      lines.push(c.replace(/\s*\t\s*/g, '\t'));
    });
    var fullText = lines.join('\n');
    if (fullText.replace(/\s/g, '').length < 60) {
      throw new Error('Nem találtunk olvasható szöveget a fájlban (lehet, hogy szkennelt kép). Próbáld meg egy szöveges PDF-fel vagy Word-dokumentummal.');
    }
    var L = detectLang(fullText);

    /* elérhetőségek kigyűjtése az egész szövegből */
    var P = { firstName: '', lastName: '', headline: '', email: '', phone: '', address: '', postCode: '', city: '', photo: null, extra: [] };
    var extra = {};
    var driving = '';
    var used = {};
    lines.forEach(function (l, i) {
      if (!l) return;
      var t = l.replace(/\t/g, ' ');
      var hit = false;
      Object.keys(LABEL).forEach(function (k) {
        if (hit) return;
        var m = t.match(LABEL[k]);
        if (!m) return;
        var v = clean(l.slice(m[0].length).split('\t')[0]).replace(/^[:\-]\s*/, '');
        if (v && /(,|judetul|județul|megye|county)$/i.test(v) && lines[i + 1] && !/:/.test(lines[i + 1]) && lines[i + 1].length < 50) { v += ' ' + clean(lines[i + 1].split('\t')[0]); used[i + 1] = 1; }
        if (!v && lines[i + 1] && !headingKind(lines[i + 1])) { v = clean(lines[i + 1]); used[i + 1] = 1; }
        if (!v) return;
        hit = true;
        if (k === 'email') P.email = P.email || (v.match(EMAIL_RE) || [v])[0];
        else if (k === 'phone') P.phone = P.phone || clean(v.replace(/\((mobile|mobil|home|work|acasa|serviciu)\)/ig, ''));
        else if (k === 'address') P.address = P.address || clean(v.replace(/\((home|work|acasă|acasa|domiciliu|otthoni)\)/ig, ''));
        else if (k === 'driving') driving = driving || v;
        else if (k === 'linkedin' || k === 'website' || k === 'whatsapp') extra[k] = extra[k] || v.replace(/^https?:\/\/(www\.)?/, '');
        else extra[k] = extra[k] || v;
      });
      if (!hit) {
        var em = t.match(EMAIL_RE);
        if (em && !P.email) { P.email = em[0]; hit = true; }
        var ph = phoneIn(t.replace(EMAIL_RE, ''));
        if (ph && !findRange(t) && (!P.phone || t.length < 40)) {
          if (/whatsapp/i.test(t)) extra.whatsapp = extra.whatsapp || clean(ph); else P.phone = P.phone || clean(ph);
          hit = true;
        }
        var urls = /^(link|site|site de internet|website|weboldal)\b/i.test(t) ? [] : t.replace(EMAIL_RE, '').match(new RegExp(URL_RE.source, 'gi')) || [];
        urls.forEach(function (u) {
          if (/[-_\/]$/.test(u) && lines[i + 1] && /^\S+$/.test(clean(lines[i + 1]))) { u += clean(lines[i + 1]); used[i + 1] = 1; }
          var v = u.replace(/^https?:\/\/(www\.)?/, '').replace(/[).,\/]+$/, '');
          if (/linkedin\.com/i.test(v)) extra.linkedin = extra.linkedin || v;
          else if (/facebook\.com/i.test(v)) extra.facebook = extra.facebook || v;
          else if (/github\.com|behance|dribbble|\.(com|ro|hu|dev|io|net|org|eu|me)(\/|$)/i.test(v) && !/@/.test(v)) extra.website = extra.website || v;
          else return;
          hit = true;
        });
      }
      if (hit && !P.city) {
        t.split(/\s*[|•·]\s*/).forEach(function (part) { if (!P.city && isLocation(part)) P.city = clean(part); });
      }
      if (hit) {
        /* ha a sorban a kapcsolati adatokon kívül nincs érdemi szöveg, „elhasználtuk” */
        var rest = t.replace(EMAIL_RE, '').replace(new RegExp(URL_RE.source, 'gi'), '').replace(PHONE_RE, '').replace(/[|•·,;:\-–()]/g, ' ');
        Object.keys(LABEL).forEach(function (k) { rest = rest.replace(LABEL[k], ''); });
        if (clean(rest).length <= 18 || Object.keys(LABEL).some(function (k) { return LABEL[k].test(t); })) used[i] = 1;
      }
    });

    /* blokkok szakaszcímek szerint */
    var blocks = [], header = [], curB = null;
    lines.forEach(function (l, i) {
      if (used[i]) return;
      var k = headingKind(l);
      /* ismeretlen, CSUPA NAGYBETŰS cím → egyéni szakasz */
      if (!k && curB && curB.kind !== 'skills' && curB.kind !== 'languages' && isCaps(l) && l.length <= 40 && l.split(/\s+/).length <= 5 && !/\d/.test(l) && !/\b(srl|s\.r\.l|sa|kft|bt|zrt|nyrt|ltd|llc|gmbh|inc|pfa)\b/i.test(l)) {
        var ahead = lines.slice(i + 1, i + 4).some(function (x) { return x && findRange(x); });
        var entryish = ['experience', 'education', 'courses', 'projects', 'internships', 'volunteer'].indexOf(curB.kind) >= 0;
        if (!(entryish && ahead)) k = 'custom';
      }
      if (k) {
        curB = { kind: k, title: clean(l.replace(/[:\s]+$/, '')), lines: [] };
        blocks.push(curB);
        return;
      }
      var inl = l.match(/^([^:\t]{3,40}):\s+(.+)$/);
      var ik = inl && headingKind(inl[1]);
      if (ik && ik !== 'personal') {
        curB = { kind: ik, title: clean(inl[1]), lines: [inl[2]] };
        blocks.push(curB);
        return;
      }
      (curB ? curB.lines : header).push(l);
    });

    /* név és címsor a fejlécből (vagy a Személyes adatok blokkból) */
    var headPool = header.concat.apply(header, blocks.filter(function (b) { return b.kind === 'personal'; }).map(function (b) { return b.lines; }));
    var nameIdx = -1;
    var isNameLine = function (l) {
      if (!l || /[\d@:\/]|\t/.test(l) || l.length > 42 || headingKind(l)) return false;
      var w = l.split(/\s+/);
      if (w.length < 2 || w.length > 4) return false;
      return w.every(function (x) { return /^[A-ZÀ-Ž][A-Za-zÀ-ž'’.\-]*$/.test(x); });
    };
    for (var h = 0; h < Math.min(headPool.length, 10); h++) { if (isNameLine(headPool[h])) { nameIdx = h; break; } }
    if (nameIdx < 0) {
      /* oldalsávos CV-knél a név a második hasáb elején is lehet */
      for (var q = 0; q < Math.min(lines.length, 40); q++) if (!used[q] && isNameLine(lines[q])) { nameIdx = -2; headPool = [lines[q]].concat(headPool); nameIdx = 0; break; }
    }
    if (nameIdx >= 0) {
      var nm = headPool[nameIdx].split(/\s+/).map(function (x) { return x; });
      var caps = nm.filter(isCaps);
      if (caps.length === 1 && nm.length > 1) { P.lastName = nice(caps[0]); P.firstName = nm.filter(function (x) { return x !== caps[0]; }).map(nice).join(' '); }
      else if (user.lastName && fold(nm[nm.length - 1]) === fold(user.lastName)) { P.lastName = nice(nm.pop()); P.firstName = nm.map(nice).join(' '); }
      else if (user.lastName && fold(nm[0]) === fold(user.lastName)) { P.lastName = nice(nm.shift()); P.firstName = nm.map(nice).join(' '); }
      else if (L === 'hu') { P.lastName = nice(nm.shift()); P.firstName = nm.map(nice).join(' '); }
      else { P.lastName = nice(nm.pop()); P.firstName = nm.map(nice).join(' '); }
      headPool.splice(nameIdx, 1);
    } else {
      warnings.push('A nevet nem találtuk – a regisztrációs adataidat hagytuk meg.');
      P.firstName = user.firstName || ''; P.lastName = user.lastName || '';
    }
    var headerRest = headPool.filter(function (l) { return l && header.indexOf(l) >= 0; });
    var introLines = [];
    headerRest.forEach(function (l) {
      var t = l.replace(/\t/g, ' ');
      if (!P.headline && t.length <= 70 && !/[.!?]$/.test(t) && !/\d{3}/.test(t) && t.split(/\s+/).length <= 9) { P.headline = nice(t); return; }
      if (STREET.test(t) && t.length < 120) { if (!P.address) P.address = addressFrom(headerRest.slice(headerRest.indexOf(l))); return; }
      if (isLocation(t) && !P.city) { P.city = t; return; }
      if (/^\d{4,6}\s/.test(t) || isLocation(t) || /^\((home|acasă|acasa|otthoni|a doua adresă)/i.test(t)) return;
      introLines.push(l);
    });
    if (!P.email) P.email = user.email || '';
    if (!P.phone && user.phone) P.phone = user.phone;

    var EXTRA_LBL = {};
    (DJP.EXTRA_FIELDS || []).forEach(function (e) { EXTRA_LBL[e.key] = e.label; });
    ['birthDate', 'birthPlace', 'nationality', 'gender', 'linkedin', 'facebook', 'website', 'whatsapp'].forEach(function (k) {
      if (extra[k]) P.extra.push({ key: k, label: EXTRA_LBL[k] || k, value: extra[k] });
    });

    /* szakaszok felépítése */
    var sections = [], byKind = {};
    var mk = function (kind, title) {
      var base = DJP.SECTION_TYPES[kind] ? kind : 'custom';
      var s = DJP.newSection(base);
      if (base === 'custom') s.title = title ? nice(title) : 'Egyéb';
      sections.push(s);
      if (base !== 'custom') byKind[base] = s;
      return s;
    };
    var get = function (kind) { return byKind[kind] || mk(kind); };
    if (introLines.join(' ').length > 80) get('profile').text = joinText(introLines);

    var unparsed = 0;
    blocks.forEach(function (b) {
      var body = b.lines;
      if (!body.some(Boolean)) return;
      var k = b.kind;
      if (k === 'personal') {
        if (!P.address) P.address = addressFrom(body);
        return;
      }
      if (k === 'volunteer' || k === 'publications' || k === 'other') {
        var cs = mk('custom', CUSTOM_TITLE[k]);
        cs.text = joinText(body);
        return;
      }
      if (k === 'custom') { var cu = mk('custom', b.title); cu.text = joinText(body); return; }
      var st = DJP.SECTION_TYPES[k];
      if (st.type === 'entries') {
        var items = parseEntries(body, k);
        var s = get(k); s.items = s.items.concat(items);
        if (!items.length) unparsed++;
      } else if (st.type === 'skills') {
        var sk = get('skills');
        var generic = HEAD.skills.slice(0, 5).concat(['skills', 'key skills', 'competente', 'abilitati', 'aptitudini', 'competencies', 'core competencies']).indexOf(fold(b.title).replace(/[:\s]+$/, '')) >= 0;
        sk.items = sk.items.concat(parseSkills(body, generic ? '' : nice(b.title)));
      } else if (st.type === 'languages') {
        var lg = get('languages');
        parseLanguages(body, L).forEach(function (it) { if (!lg.items.some(function (x) { return x.name === it.name; })) lg.items.push(it); });
      } else if (k === 'driving') {
        driving = driving || joinText(body);
      } else {
        var ts = get(k);
        ts.text = (ts.text ? ts.text + '\n' : '') + joinText(body, k === 'hobbies' || k === 'interests');
      }
    });
    /* irányítószám + város a címből */
    if (P.address) {
      var pc = P.address.match(/(?<!\d)(\d{4,6})(?!\d)\s*,?\s*([A-ZÀ-Ž][^,\d()]{2,40})?/);
      if (pc) { P.postCode = pc[1]; if (pc[2]) P.city = clean(pc[2]); }
      if (!P.city) { var parts = P.address.split(/,\s*/).filter(function (p) { return !/\d/.test(p) && p.length < 40; }); if (parts.length) P.city = parts[parts.length - 1 > 0 && /rom|magyar|hungary|romania/i.test(parts[parts.length - 1]) ? parts.length - 2 : parts.length - 1]; }
      if (P.postCode) P.address = clean(P.address.replace(P.postCode, '').replace(P.city || '@@', '').replace(/(,\s*){2,}/g, ', ').replace(/^[,\s]+|[,\s]+$/g, ''));
    }
    var edu = byKind.education;
    if (edu && edu.items.length) {
      var COURSE = /coursera|udemy|codecademy|edx|linkedin learning|skillshare|skillup|certificat|certification|certificate|course|cursuri|curs |tanfolyam|kurzus|bootcamp|specialization/i;
      var mv = edu.items.filter(function (it) { return COURSE.test(it.title + ' ' + it.subtitle) || /^online$/i.test(it.city); });
      if (mv.length && mv.length < edu.items.length) {
        edu.items = edu.items.filter(function (it) { return mv.indexOf(it) < 0; });
        var crs = get('courses'); crs.items = crs.items.concat(mv);
      }
    }
    if (driving) {
      var dv = clean(driving.replace(/^(categor(y|ia|ie)|kategória)\s*:?\s*/i, ''));
      if (/^[A-E][1E]?(\s*[,/]\s*[A-E][1E]?)*$/i.test(dv)) dv = L === 'hu' ? dv.toUpperCase() + ' kategória' : L === 'ro' ? 'Categoria ' + dv.toUpperCase() : 'Category ' + dv.toUpperCase();
      get('driving').text = dv;
    }

    /* ha egyetlen szakaszcímet sem ismertünk fel: a teljes szöveg egy átnézendő blokkba */
    var found = sections.filter(function (s) { return (s.items && s.items.length) || (s.text && s.text.trim()); }).length;
    if (!blocks.length || found <= 1) {
      var rest = lines.filter(function (l, i) { return l && !used[i] && !isNameLine(l); });
      if (!blocks.length) {
        var cx = mk('custom', 'Kiolvasott szöveg – rendezd át');
        cx.text = joinText(rest);
        warnings.push('Nem ismertük fel a szakaszokat, ezért a kiolvasott szöveget egy „Kiolvasott szöveg” blokkba tettük – innen másold át a megfelelő részekbe.');
      }
    }
    if (unparsed) warnings.push('Néhány tételt nem tudtunk biztosan pozícióra, cégre és dátumra bontani – nézd át a tapasztalatot és a tanulmányokat.');

    /* az alap szakaszok mindig legyenek ott (üresen), hogy kitölthetők legyenek */
    ['profile', 'experience', 'education', 'skills', 'languages'].forEach(function (k) { if (!byKind[k]) mk(k); });
    var order = { profile: 0, experience: 2, projects: 3, internships: 3, education: 4, courses: 5, skills: 6, languages: 7, driving: 8, achievements: 9, hobbies: 10, interests: 11, references: 12, custom: 13 };
    var pos = {};
    sections.forEach(function (s, i) { pos[s.id] = i; });
    sections.sort(function (a, b) { return ((order[a.kind] != null ? order[a.kind] : 13) - (order[b.kind] != null ? order[b.kind] : 13)) || pos[a.id] - pos[b.id]; });

    /* szakaszcímek és mezőcímkék a CV nyelvén */
    if (L !== 'hu') {
      var NOW = { en: 'present', ro: 'prezent' }[L];
      sections.forEach(function (s) {
        if (s.kind !== 'custom' && DJP.secTitle(s.kind, L)) s.title = DJP.secTitle(s.kind, L);
        (s.items || []).forEach(function (it) { if (it.end === 'jelenleg') it.end = NOW; });
      });
      P.extra.forEach(function (e) { e.label = DJP.extraLabel(e.key, L); });
    }
    var cv = DJP.blankCV(user);
    cv.personal = P;
    cv.sections = sections;
    cv.lang = L;
    var cnt = function (k) { return byKind[k] && byKind[k].items ? byKind[k].items.length : 0; };
    return {
      cv: cv, lang: L, warnings: warnings, text: fullText,
      stats: { experience: cnt('experience'), education: cnt('education'), courses: cnt('courses'), projects: cnt('projects'), skills: cnt('skills'), languages: cnt('languages'), sections: found }
    };
  };

  /* fájl → kiolvasott CV (a demó-PDF-nél az előre strukturált, magyarra fordított változatot adjuk) */
  DJP.parseCVFile = function (file, opts) {
    opts = opts || {};
    return DJP.extractCVText(file).then(function (res) {
      var joined = fold(res.lines.join(' '));
      if (!opts.noDemo && /bogdan/.test(joined) && /barna/.test(joined) && /farma-line/.test(joined)) {
        return { cv: DJP.parsedCV(), demo: true, warnings: [], lang: 'hu', stats: null };
      }
      var out = DJP.parseCVText(res.lines, opts);
      if (res.rough) out.warnings.unshift('A régi .doc formátumból csak a nyers szöveget tudtuk kiolvasni – a pontosabb eredményhez mentsd el PDF-ként vagy .docx-ként.');
      if (res.twoCol) out.twoCol = true;
      return out;
    });
  };

  /* mentett dokumentum → kiolvasott CV (Promise) */
  DJP.cvFromDoc = function (d) {
    if (!d) return Promise.resolve({ cv: DJP.parsedCV(), demo: true });
    if (d.data) return Promise.resolve({ cv: DJP.clone(d.data), demo: /farma-line/i.test(JSON.stringify(d.data)) });
    if (d.parsed) return Promise.resolve({ cv: DJP.clone(d.parsed), demo: /farma-line/i.test(JSON.stringify(d.parsed)), warnings: [] });
    var f = /^data:/.test(d.fileUrl || '') && DJP.fileFromDataUrl(d.fileUrl, d.fileName || d.title);
    if (f) return DJP.parseCVFile(f, { user: DJP.store.user() });
    return Promise.resolve({ cv: DJP.parsedCV(), demo: true });
  };

  /* nyelvnév → [magyar, angol, román] alak */
  DJP.langCanon = function (name) {
    var w = fold(name || '').split(/[^a-z]+/);
    for (var i = 0; i < LANGS.length; i++) for (var j = 0; j < w.length; j++) if (LANGS[i][0].test(w[j])) return LANGS[i][1];
    return null;
  };

  /* data: URL → File (a mentett, feltöltött CV-k újrakiolvasásához) */
  DJP.fileFromDataUrl = function (url, name) {
    var m = /^data:([^;,]*)(;base64)?,(.*)$/.exec(url || '');
    if (!m) return null;
    var bin = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    var u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    try { return new File([u8], name || 'cv', { type: m[1] }); } catch (e) { var b = new Blob([u8], { type: m[1] }); b.name = name || 'cv'; return b; }
  };
})(window.DJP);

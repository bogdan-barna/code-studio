/* DreamJobs prototípus – CV és motivációs levél A4 renderelés a DreamJobs-sablonokkal (A4-3/4/5 tervek + korábbi sablonok),
   nyelvi feliratokkal (HU/EN/RO), kattintható szerkesztési pontokkal (data-edit) és PDF letöltéssel. */
(function (DJP) {
  var esc = DJP.esc;
  var LANG = 'hu', L = DJP.LBL.hu;
  function de(path) { return ' data-edit="' + path + '"'; }

  function name(p) { return (LANG === 'en' ? [p.firstName, p.lastName] : [p.lastName, p.firstName]).filter(Boolean).join(' '); }
  function initials(p) { return ((p.lastName || ' ')[0] + (p.firstName || ' ')[0]).trim().toUpperCase() || 'DJ'; }
  function dates(it) {
    if (!it.start && !it.end) return '';
    return esc(it.start || '') + (it.end ? ' – ' + esc(it.end) : '');
  }
  function lvl(x) { return DJP.levelLabel ? DJP.levelLabel(x, LANG) : x; }

  /* leírás: "•" sorokból lista, "Címke:" előtag félkövér */
  function richText(t) {
    if (!t) return '';
    var out = [], list = [];
    function flush() { if (list.length) { out.push('<ul>' + list.join('') + '</ul>'); list = []; } }
    t.split('\n').forEach(function (line) {
      var l = line.trim();
      if (!l) { flush(); return; }
      var isB = /^[•\-–*]\s*/.test(l);
      l = esc(l.replace(/^[•\-–*]\s*/, ''));
      l = l.replace(/^([^:]{2,42}):\s/, '<b>$1:</b> ');
      if (isB) list.push('<li>' + l + '</li>');
      else { flush(); out.push('<p>' + l + '</p>'); }
    });
    flush();
    return out.join('');
  }

  var LINK_KEYS = { linkedin: 1, facebook: 1, website: 1 };
  function address(p) { return [p.address, [p.postCode, p.city].filter(Boolean).join(' ')].filter(Boolean).join(', '); }
  function extraLabel(e) { return DJP.extraLabel ? DJP.extraLabel(e.key, LANG) : e.label; }
  function links(p) { return (p.extra || []).filter(function (e) { return e.value && LINK_KEYS[e.key]; }); }
  function details(p) { return (p.extra || []).filter(function (e) { return e.value && !LINK_KEYS[e.key]; }); }

  var LEVEL_W = { 'Alapszint': 45, 'Kezdő': 25, 'Közepes': 60, 'Haladó': 82, 'Szakértő': 100, 'Anyanyelv': 100, 'C2': 95, 'C1': 85, 'B2': 70, 'B1': 55, 'A2': 35, 'A1': 20 };
  function bar(level) { return '<span class="cv-bar"><i style="width:' + (LEVEL_W[level] || 72) + '%"></i></span>'; }
  function ip(s, it) { return 'item:' + s.id + ':' + it.id; }

  function entriesHTML(s) {
    return s.items.filter(function (it) { return it.title || it.subtitle || it.desc; }).map(function (it) {
      var sub = [it.subtitle, it.city].filter(Boolean).map(esc).join(' · ');
      return '<div class="cv-entry"' + de(ip(s, it)) + '><div class="cv-entry-title">' + esc(it.title || '') + '</div>' +
        (sub ? '<div class="cv-sub">' + sub + '</div>' : '') +
        (dates(it) ? '<div class="cv-dates">' + dates(it) + '</div>' : '') +
        '<div class="cv-desc">' + richText(it.desc) + '</div></div>';
    }).join('');
  }

  function skillsHTML(s, mode) {
    var items = s.items.filter(function (i) { return i.name; });
    if (mode === 'inline') {
      return '<div class="cv-inline-list">' + items.map(function (i) {
        return '<div' + de(ip(s, i)) + '><b>' + esc(i.name) + '</b>' + (i.detail ? ': ' + esc(i.detail) : '') + '</div>';
      }).join('') + '</div>';
    }
    return '<div class="cv-skills">' + items.map(function (i) {
      return '<div class="cv-skill"' + de(ip(s, i)) + '><div class="cv-skill-name">' + esc(i.name) + (i.level && mode !== 'bars' ? dots(i.level) : '') + '</div>' +
        (mode === 'bars' ? bar(i.level) : '') + (i.detail ? '<div class="cv-skill-detail">' + esc(i.detail) + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  }

  /* készségszint pontokkal a CV-n (1–5) */
  function dots(level) {
    var n = DJP.skillScore ? DJP.skillScore(level) : 0;
    if (!n) return ' <em>' + esc(lvl(level)) + '</em>';
    var out = '';
    for (var k = 1; k <= 5; k++) out += '<i class="' + (k <= n ? 'on' : '') + '"></i>';
    return ' <span class="cv-dots" title="' + esc(lvl(level)) + '">' + out + '</span>';
  }

  function langsHTML(s, mode) {
    var items = s.items.filter(function (i) { return i.name; });
    if (mode === 'inline') return '<div class="cv-inline">' + items.map(function (i) { return '<span' + de(ip(s, i)) + '>' + esc(i.name) + ': ' + esc(lvl(i.level)) + '</span>'; }).join('') + '</div>';
    return '<div class="cv-langs">' + items.map(function (i) {
      return '<div class="cv-lang"' + de(ip(s, i)) + '>' + esc(i.name) + ' – ' + esc(lvl(i.level)) + (mode === 'bars' ? bar(i.level) : '') + '</div>';
    }).join('') + '</div>';
  }

  function tagsHTML(s, mode) {
    var items = s.items.filter(function (i) { return i.name; });
    return '<div class="' + (mode === 'circles' ? 'cv-circles' : 'cv-tags') + '">' + items.map(function (i) { return '<span' + de(ip(s, i)) + '>' + esc(i.name) + '</span>'; }).join('') + '</div>';
  }

  function hasContent(s) {
    if (s.type === 'text') return !!(s.text && s.text.trim());
    return s.items.some(function (i) { return i.title || i.name || i.desc || i.subtitle; });
  }

  /* mode: készségek/nyelvek megjelenítése (bars | list | inline), címkék (chips | circles) */
  function sectionHTML(s, opts, mode, tagMode) {
    var body;
    if (s.type === 'text') body = '<div class="cv-desc">' + richText(s.text) + '</div>';
    else if (s.type === 'entries') body = entriesHTML(s);
    else if (s.type === 'skills') body = skillsHTML(s, mode);
    else if (s.type === 'languages') body = langsHTML(s, mode);
    else body = tagsHTML(s, tagMode);
    var ai = opts.highlight && s.ai ? ' cv-ai' : '';
    return '<section class="cv-sec cv-k-' + s.kind + ai + '" data-sec="' + s.id + '"' + de('sec:' + s.id) + '><h3>' + esc(s.title) + '</h3><div class="cv-sec-body">' + body + '</div></section>';
  }

  function placeholder() { return '<div class="cv-empty">' + L.empty + '</div>'; }
  function logo(cls) { return '<img class="' + (cls || 'cv-logo') + '" src="' + DJP.LOGO + '" alt="DreamJobs.ro">'; }
  function photoHTML(p) {
    return (p.photo ? '<img class="cv-photo" src="' + p.photo + '" alt=""' : '<div class="cv-photo cv-initials"') + de('personal:photo') + '>' + (p.photo ? '' : esc(initials(p)) + '</div>');
  }
  function brandFoot() {
    return '<div class="cv-foot"><span>' + L.made[0] + '</span><img src="' + DJP.LOGO + '" alt="DreamJobs"><span>' + L.made[1] + '</span></div>';
  }

  function hexRgb(h) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h || '');
    return m ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) : '225,65,90';
  }
  function sheetAttrs(cv, kind, opts) {
    var f = cv.font || 'Poppins';
    var font = '"' + f + '",' + (DJP.SERIF_FONTS && DJP.SERIF_FONTS[f] ? 'Georgia,serif' : 'Arial,sans-serif');
    return 'class="djp-sheet ' + kind + ' tpl-' + DJP.tplId(cv.template) + ' sp-' + (cv.spacing || 'normal') + (opts.preview ? ' is-preview' : '') + '"' +
      ' lang="' + LANG + '" style="--acc:' + (cv.accent || '#E1415A') + ';--acc-rgb:' + hexRgb(cv.accent) + ';--cvfont:' + font + '"';
  }

  DJP.tplId = function (t) { return t || 'red'; };

  /* elérhetőségek: [címke, rövid címke, érték, szerkesztési útvonal] */
  function contactRows(p, withExtras) {
    var r = [];
    if (p.email) r.push([L.email, L.emailS, p.email, 'personal:email']);
    if (p.phone) r.push([L.phone, L.telS, p.phone, 'personal:phone']);
    if (address(p)) r.push([L.addr, L.addrS, address(p), 'personal:address']);
    if (withExtras) (p.extra || []).forEach(function (e) { if (e.value) r.push([extraLabel(e), extraLabel(e).toLowerCase(), e.value, 'extra:' + e.key]); });
    return r;
  }

  /* korábbi (klasszikus) sablonok: sötét oldalsáv, színes fejléc, minimál */
  function renderLegacy(cv, opts, tpl, secs, nm, hl, empty, attrs) {
    var p = cv.personal;
    if (tpl === 'classic') {
      var sideK = { skills: 1, languages: 1, driving: 1, salary: 1, values: 1, traits: 1 };
      var side = secs.filter(function (s) { return sideK[s.kind]; });
      var main = secs.filter(function (s) { return !sideK[s.kind]; });
      return '<div ' + attrs + '><aside class="cv-side">' + photoHTML(p) + nm + hl +
        '<section class="cv-sec"' + de('personal') + '><h3>' + L.contact + '</h3><div class="cv-details">' + contactRows(p, true).map(function (d) { return '<div' + de(d[3]) + '><b>' + esc(d[0]) + '</b><span>' + esc(d[2]) + '</span></div>'; }).join('') + '</div></section>' +
        side.map(function (s) { return sectionHTML(s, opts, 'bars', 'chips'); }).join('') + '</aside>' +
        '<div class="cv-main"><div class="cv-brand">' + logo() + '</div>' + main.map(function (s) { return sectionHTML(s, opts, 'list', 'chips'); }).join('') + empty + brandFoot() + '</div></div>';
    }
    var head = '<header class="cv-head">' + (tpl === 'modern' ? photoHTML(p) : '') +
      '<div class="cv-head-txt">' + nm + hl + '<div class="cv-contacts-inline"' + de('personal') + '>' + contactRows(p, true).map(function (d) { return '<span' + de(d[3]) + '>' + esc(d[2]) + '</span>'; }).join('') + '</div></div>' + logo('cv-brand-img') + '</header>';
    return '<div ' + attrs + '>' + head + '<div class="cv-body">' + secs.map(function (s) { return sectionHTML(s, opts, 'list', 'chips'); }).join('') + empty + '</div>' + brandFoot() + '</div>';
  }
  var LEGACY = { classic: 1, modern: 1, minimal: 1 };

  DJP.renderCV = function (cv, opts) {
    opts = opts || {};
    LANG = cv.lang || 'hu'; L = DJP.LBL[LANG] || DJP.LBL.hu;
    var p = cv.personal;
    var tpl = DJP.tplId(cv.template);
    var secs = cv.sections.filter(hasContent);
    var nmTxt = name(p) ? esc(name(p)) : '<span class="cv-ph">' + L.phName + '</span>';
    var nm = '<h1 class="cv-name"' + de('personal:lastName') + '>' + nmTxt + '</h1>';
    var hlTxt = p.headline ? esc(p.headline) : (opts.preview ? '<span class="cv-ph">' + L.phHead + '</span>' : '');
    var hl = '<div class="cv-headline"' + de('personal:headline') + '>' + hlTxt + '</div>';
    var empty = !secs.length && opts.preview ? placeholder() : '';
    var attrs = sheetAttrs(cv, 'djp-cv', opts);
    if (LEGACY[tpl]) return renderLegacy(cv, opts, tpl, secs, nm, hl, empty, attrs);

    /* A4-4 terv: kék oldalsáv */
    if (tpl === 'blue') {
      var sideK = { skills: 1, driving: 1, values: 1, traits: 1, salary: 1 };
      var side = secs.filter(function (s) { return sideK[s.kind]; });
      var main = secs.filter(function (s) { return !sideK[s.kind]; });
      var det = contactRows(p, false).concat(details(p).map(function (e) { return [extraLabel(e), '', e.value, 'extra:' + e.key]; }));
      return '<div ' + attrs + '><aside class="cv-side">' + photoHTML(p) + nm + hl +
        (det.length ? '<section class="cv-sec"' + de('personal') + '><h3>' + L.details + '</h3><div class="cv-details">' + det.map(function (d) { return '<div' + de(d[3]) + '><b>' + esc(d[0]) + '</b><span>' + esc(d[2]) + '</span></div>'; }).join('') + '</div></section>' : '') +
        (links(p).length ? '<section class="cv-sec"' + de('personal') + '><h3>' + L.links + '</h3><div class="cv-links">' + links(p).map(function (e) { return '<span' + de('extra:' + e.key) + '>' + esc(e.value) + '</span>'; }).join('') + '</div></section>' : '') +
        side.map(function (s) { return sectionHTML(s, opts, 'bars', 'chips'); }).join('') +
        '<div class="cv-side-logo">' + logo() + '</div></aside>' +
        '<div class="cv-main">' + main.map(function (s) { return sectionHTML(s, opts, 'list', 'chips'); }).join('') + empty + '</div></div>';
    }

    /* A4-3 terv: gradiens háttér (a választott színből), címke-oszlop */
    if (tpl === 'gradient') {
      var profile = secs.find(function (s) { return s.kind === 'profile'; });
      var rest = secs.filter(function (s) { return s !== profile; });
      var tags = rest.filter(function (s) { return s.type === 'tags'; });
      rest = rest.filter(function (s) { return s.type !== 'tags'; });
      var meta = [[p.city || address(p), 'personal:city'], [p.email, 'personal:email'], [p.phone, 'personal:phone']].filter(function (m) { return m[0]; })
        .map(function (m) { return '<span' + de(m[1]) + '>' + esc(m[0]) + '</span>'; }).join('<br>');
      var linkRow = links(p).length ? '<section class="cv-sec"' + de('personal') + '><h3>' + L.links + '</h3><div class="cv-sec-body"><div class="cv-inline">' + links(p).map(function (e) { return '<span' + de('extra:' + e.key) + '>' + esc(e.value) + '</span>'; }).join('') + '</div></div></section>' : '';
      var detRow = details(p).length ? '<section class="cv-sec"' + de('personal') + '><h3>' + L.details + '</h3><div class="cv-sec-body"><div class="cv-inline">' + details(p).map(function (e) { return '<span' + de('extra:' + e.key) + '>' + esc(extraLabel(e)) + ': ' + esc(e.value) + '</span>'; }).join('') + '</div></div></section>' : '';
      return '<div ' + attrs + '><header class="cv-head">' + photoHTML(p) + '<div class="cv-head-txt"><div class="cv-meta">' + meta + '</div>' +
        '<h1 class="cv-name"><b' + de('personal:lastName') + '>' + nmTxt + (hlTxt ? ',</b> <span class="cv-headline"' + de('personal:headline') + '>' + hlTxt + '</span>' : '</b>') + '</h1>' +
        (profile ? '<div class="cv-intro' + (opts.highlight && profile.ai ? ' cv-ai' : '') + '"' + de('sec:' + profile.id) + '>' + richText(profile.text) + '</div>' : '') + '</div></header>' +
        '<div class="cv-body">' + rest.map(function (s) { return sectionHTML(s, opts, 'inline', 'chips'); }).join('') + detRow + linkRow +
        tags.map(function (s) { return sectionHTML(s, opts, 'inline', 'circles'); }).join('') + empty + '</div>' +
        '<div class="cv-bottom-logo">' + logo() + '</div></div>';
    }

    /* A4-5 terv: piros – név fejléc, két oszlop függőleges vonallal, sarokdísz */
    var leftK = { education: 1, courses: 1, skills: 1, languages: 1, driving: 1, salary: 1, values: 1, traits: 1 };
    var left = secs.filter(function (s) { return leftK[s.kind]; });
    var right = secs.filter(function (s) { return !leftK[s.kind]; });
    var more = details(p).concat(links(p));
    var moreHTML = more.length ? '<section class="cv-sec"' + de('personal') + '><h3>' + L.details + '</h3><div class="cv-sec-body cv-more">' +
      more.map(function (e) { return '<div' + de('extra:' + e.key) + '><b>' + esc(extraLabel(e)) + ':</b> ' + esc(e.value) + '</div>'; }).join('') + '</div></section>' : '';
    return '<div ' + attrs + '><header class="cv-head"><div class="cv-head-name"><h1 class="cv-name"><span class="cv-last"' + de('personal:lastName') + '>' + (p.lastName ? esc(p.lastName) : '<span class="cv-ph">' + L.phLast + '</span>') + '</span>' +
      '<span class="cv-first"' + de('personal:firstName') + '>' + (p.firstName ? esc(p.firstName) : '<span class="cv-ph">' + L.phFirst + '</span>') + '</span></h1>' + hl + '</div>' +
      '<div class="cv-contact"' + de('personal') + '>' + contactRows(p, false).map(function (c) { return '<div' + de(c[3]) + '><b>' + esc(c[1]) + ':</b> ' + esc(c[2]) + '</div>'; }).join('') + '</div></header>' +
      '<div class="cv-cols"><div class="cv-left">' + photoHTML(p) + moreHTML + left.map(function (s) { return sectionHTML(s, opts, 'list', 'chips'); }).join('') + '</div>' +
      '<div class="cv-right">' + right.map(function (s) { return sectionHTML(s, opts, 'list', 'chips'); }).join('') + empty + '</div></div>' +
      '<footer class="cv-corner">' + logo() + '<i></i></footer></div>';
  };

  DJP.renderLetter = function (letter, cv, opts) {
    opts = opts || {};
    cv = cv || {};
    LANG = cv.lang || 'hu'; L = DJP.LBL[LANG] || DJP.LBL.hu;
    var p = cv.personal || {};
    var tpl = DJP.tplId(cv.template);
    var rec = letter.recipient || {};
    var body = (letter.body || '').split(/\n{2,}/).map(function (para) { return '<p>' + esc(para).replace(/\n/g, '<br>') + '</p>'; }).join('');
    var text = '<div class="lt-rec">' + [rec.company, rec.person, rec.address].filter(Boolean).map(esc).join('<br>') + '</div>' +
      '<div class="lt-date">' + esc([letter.city, letter.date].filter(Boolean).join(', ')) + '</div>' +
      (letter.subject ? '<div class="lt-subject"><b>' + L.subject + '</b> ' + esc(letter.subject) + '</div>' : '') +
      '<div class="lt-text">' + (body || (opts.preview ? '<p class="cv-ph">' + L.letterPh + '</p>' : '')) + '</div>';
    var nm = name(p) ? esc(name(p)) : '<span class="cv-ph">' + L.phName + '</span>';
    var attrs = sheetAttrs(cv, 'djp-letter', opts);
    var contactList = [p.email, p.phone, address(p)].filter(Boolean).map(esc);

    if (LEGACY[tpl]) {
      return '<div ' + attrs + '><header class="lt-head"><div><h1 class="cv-name">' + nm + '</h1><div class="cv-headline">' + esc(p.headline || '') + '</div>' +
        '<div class="lt-contact">' + contactList.join(' · ') + '</div></div>' + logo('cv-brand-img') + '</header><div class="lt-body">' + text + '</div>' + brandFoot() + '</div>';
    }
    if (tpl === 'blue') {
      return '<div ' + attrs + '><aside class="cv-side">' + photoHTML(p) + '<h1 class="cv-name">' + nm + '</h1><div class="cv-headline">' + esc(p.headline || '') + '</div>' +
        '<div class="cv-details">' + contactList.map(function (c) { return '<div><span>' + c + '</span></div>'; }).join('') + '</div><div class="cv-side-logo">' + logo() + '</div></aside>' +
        '<div class="cv-main lt-body">' + text + '</div></div>';
    }
    if (tpl === 'gradient') {
      return '<div ' + attrs + '><header class="cv-head"><div class="cv-head-txt"><div class="cv-meta">' + contactList.join('<br>') + '</div>' +
        '<h1 class="cv-name"><b>' + nm + (p.headline ? ',</b> <span class="cv-headline">' + esc(p.headline) + '</span>' : '</b>') + '</h1></div></header>' +
        '<div class="lt-body">' + text + '</div><div class="cv-bottom-logo">' + logo() + '</div></div>';
    }
    return '<div ' + attrs + '><header class="cv-head"><div class="cv-head-name"><h1 class="cv-name"><span class="cv-last">' + esc(p.lastName || '') + '</span><span class="cv-first">' + esc(p.firstName || '') + '</span></h1>' +
      '<div class="cv-headline">' + esc(p.headline || '') + '</div></div><div class="cv-contact">' +
      (p.email ? '<div><b>' + L.emailS + ':</b> ' + esc(p.email) + '</div>' : '') + (p.phone ? '<div><b>' + L.telS + ':</b> ' + esc(p.phone) + '</div>' : '') + '</div></header>' +
      '<div class="lt-body">' + text + '</div><footer class="cv-corner">' + logo() + '<i></i></footer></div>';
  };

  /* kicsinyített bélyegképek méretezése a konténer szélességéhez */
  DJP.fitThumbs = function (scope) {
    (scope || document).querySelectorAll('.djp-thumb-in').forEach(function (el) {
      var w = el.parentElement.clientWidth;
      if (w) el.style.transform = 'scale(' + (w / 794) + ')';
    });
  };

  /* ---------- PDF letöltés: html2pdf (cdnjs), tartalék: nyomtatás ---------- */
  var H2P = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  var loading = null;
  function loadH2P() {
    if (window.html2pdf) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = H2P; s.onload = res; s.onerror = function () { loading = null; rej(new Error('offline')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function printFallback(html, filename) {
    var w = window.open('', '_blank');
    if (!w) { DJP.toast && DJP.toast('Engedélyezd a felugró ablakokat a letöltéshez.'); return; }
    var base = location.href.replace(/[^/]*$/, '');
    w.document.write('<!DOCTYPE html><html><head><meta charset=utf-8><title>' + esc(filename) + '</title>' +
      '<link rel=stylesheet href="' + base + 'assets/dj.css"><link rel=stylesheet href="' + base + 'assets/proto.css">' +
      '<style>@page{size:A4;margin:0}body{margin:0;background:#fff}.djp-sheet{box-shadow:none!important;margin:0!important}</style></head><body>' +
      html + '<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>');
    w.document.close();
  }

  DJP.downloadPDF = function (html, filename) {
    filename = (filename || 'dokumentum').replace(/[\\/:*?"<>|]+/g, '-') + '.pdf';
    DJP.toast && DJP.toast('PDF készül…');
    return loadH2P().then(function () {
      var holder = document.createElement('div');
      holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1';
      holder.innerHTML = html;
      document.body.appendChild(holder);
      var el = holder.firstElementChild;
      return (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
        return window.html2pdf().set({
          margin: 0,
          filename: filename,
          image: { type: 'jpeg', quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.cv-entry', '.cv-skill', 'h3'] }
        }).from(el).save();
      }).then(function () {
        holder.remove();
        DJP.toast && DJP.toast('Letöltve: ' + filename);
      }, function (err) {
        holder.remove();
        throw err;
      });
    }).catch(function () {
      printFallback(html, filename);
    });
  };
})(window.DJP);

/* DreamJobs prototípus – CV-generátor (Jobseeker-szerű szerkesztő), AI-felturbózás, motivációs levél, mentés és jelentkezés. */
(function (DJP) {
  var esc = DJP.esc;
  var root = document.getElementById('djp-builder');
  var S = DJP.store;

  var ICON = {
    spark: '<path fill=currentColor d="m19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4L6.5 9.5L1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"/>',
    chev: '<path fill=currentColor d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z"/>',
    trash: '<path fill=currentColor d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>',
    drag: '<path fill=currentColor d="M9 20q-.825 0-1.412-.587T7 18t.588-1.412T9 16t1.413.588T11 18t-.587 1.413T9 20m6 0q-.825 0-1.412-.587T13 18t.588-1.412T15 16t1.413.588T17 18t-.587 1.413T15 20m-6-6q-.825 0-1.412-.587T7 12t.588-1.412T9 10t1.413.588T11 12t-.587 1.413T9 14m6 0q-.825 0-1.412-.587T13 12t.588-1.412T15 10t1.413.588T17 12t-.587 1.413T15 14M9 8q-.825 0-1.412-.587T7 6t.588-1.412T9 4t1.413.588T11 6t-.587 1.413T9 8m6 0q-.825 0-1.412-.587T13 6t.588-1.412T15 4t1.413.588T17 6t-.587 1.413T15 8"/>',
    up: '<path fill=currentColor d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/>',
    down: '<path fill=currentColor d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z"/>',
    upload: '<path fill=currentColor d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M14 13v4h-4v-4H7l5-5l5 5z"/>',
    file: '<path fill=currentColor d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5zM8 12h8v2H8zm0 4h8v2H8z"/>',
    check: '<path fill=currentColor d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"/>',
    back: '<path fill=currentColor d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20z"/>',
    dl: '<path fill=currentColor d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z"/>',
    letter: '<path fill=currentColor d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/>',
    close: '<path fill=currentColor d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>',
    plus: '<path fill=currentColor d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>',
    tpl: '<path fill=currentColor d="M3 3h8v10H3zm10 0h8v6h-8zm0 8h8v10h-8zM3 15h8v6H3z"/>',
    spacing: '<path fill=currentColor d="M6 7h2.5L5 3.5L1.5 7H4v10H1.5L5 20.5L8.5 17H6zm4-2v2h12V5zm0 14h12v-2H10zm0-6h12v-2H10z"/>',
    linkedin: '<path fill=currentColor d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"/>',
    send: '<path fill=currentColor d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"/>',
    arrow: '<path fill=currentColor d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
    edit: '<path fill=currentColor d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"/>',
    eye: '<path fill=currentColor d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-8a3 3 0 1 0 0 6a3 3 0 0 0 0-6"/>'
  };
  function svg(n, cls) { return '<svg class="' + (cls || '') + '" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }

  /* ---------- állapot ---------- */
  var mode = DJP.qs('mode') || (DJP.qs('doc') ? 'edit' : DJP.qs('letter') ? 'letter' : 'new');
  var jobId = DJP.qs('job');
  var key = [mode, jobId, DJP.qs('doc'), DJP.qs('letter'), DJP.qs('src')].join('|');
  var B;

  function freshState() {
    var user = S.user();
    var job = jobId ? DJP.jobs[jobId] : null;
    var b = {
      key: key, mode: mode, jobId: jobId || null, step: 1, phase: 'ready',
      title: job ? 'Önéletrajz – ' + job.company : 'Új önéletrajz',
      cv: DJP.blankCV(user), original: null, changes: [], matchBefore: null,
      answers: {}, qIndex: 0,
      letter: null, letterState: 'idle', tone: 'formal', length: 'normal', letterTitle: null,
      docId: null, letterDocId: null, category: mode === 'boost' ? 'boosted' : 'generated',
      consent: true, ui: { open: { personal: true }, openItem: {}, highlight: true, showOriginal: false, suggest: null }
    };
    if (mode === 'boost') {
      b.phase = 'upload';
      var src = DJP.qs('src');
      if (src) { b.srcDoc = src; b.phase = 'parsing'; }
    }
    if (mode === 'edit') {
      var d = S.getDoc(DJP.qs('doc'));
      if (d && d.data) {
        b.cv = DJP.clone(d.data); b.docId = d.id; b.title = d.title; b.category = d.category; b.jobId = d.jobId || null;
        if (b.jobId) jobId = b.jobId;
      }
    }
    if (mode === 'letter' && !DJP.qs('letter')) {
      var src = S.documents('cv').find(function (d) { return d.data; });
      b.cv = src ? DJP.clone(src.data) : DJP.parsedCV();
      if (!src) { b.cv.personal.firstName = user.firstName; b.cv.personal.lastName = user.lastName; }
      b.title = src ? src.title : 'Önéletrajz';
      b.step = 2; b.letter = null;
    }
    if (mode === 'letter' && DJP.qs('letter')) {
      var l = S.getDoc(DJP.qs('letter'));
      if (l && l.data) {
        b.letter = DJP.clone(l.data.letter); b.letterDocId = l.id; b.letterTitle = l.title; b.jobId = l.jobId || null;
        b.cv = Object.assign(DJP.blankCV(user), DJP.clone(l.data.cv || {}));
        b.step = 2; b.letterState = 'done';
        if (b.jobId) jobId = b.jobId;
      }
    }
    return b;
  }

  var draft = S.getDraft();
  B = draft && draft.key === key && draft.step !== 'done' ? draft : freshState();
  if (B.phase === 'parsing' || B.phase === 'boosting') B.phase = B.phase === 'parsing' ? 'parsing' : 'questions';
  if (B.letterState === 'loading') B.letterState = B.letter && B.letter.body ? 'done' : 'idle';
  B.translating = null;
  if (B.ui) B.ui.dd = null;
  if (B.langs && B.cv && B.langs[B.cv.lang || 'hu']) B.langs[B.cv.lang || 'hu'] = B.cv;

  function job() { return B.jobId ? DJP.jobs[B.jobId] : null; }
  function lang() { return (B.cv && B.cv.lang) || 'hu'; }
  var saveT;
  function persist() {
    clearTimeout(saveT);
    if (B.step === 'done') return;
    saveT = setTimeout(function () { S.setDraft(B); }, 300);
  }

  function hasCvContent() {
    return B.cv.sections.some(function (s) { return s.text ? s.text.trim() : (s.items || []).some(function (i) { return i.title || i.name; }); });
  }
  function secById(id) { return B.cv.sections.find(function (s) { return s.id === id; }); }
  function itemById(sid, iid) { var s = secById(sid); return s && s.items.find(function (i) { return i.id === iid; }); }

  function setField(path, v) {
    var p = path.split(':');
    if (p[0] === 'personal') B.cv.personal[p[1]] = v;
    else if (p[0] === 'extra') { var e = B.cv.personal.extra.find(function (x) { return x.key === p[1]; }); if (e) e.value = v; }
    else if (p[0] === 'sec') { var s = secById(p[1]); if (s) s[p[2]] = v; }
    else if (p[0] === 'item') { var it = itemById(p[1], p[2]); if (it) it[p[3]] = v; }
    else if (p[0] === 'letter') B.letter[p[1]] = v;
    else if (p[0] === 'rec') B.letter.recipient[p[1]] = v;
    else if (p[0] === 'cv') B.cv[p[1]] = v;
    else if (p[0] === 'title') { if (B.step === 2 || B.mode === 'letter') B.letterTitle = v; else B.title = v; }
    else if (p[0] === 'job') { B.jobId = v || null; }
  }

  /* ---------- keret ---------- */
  function stepper() {
    if (B.mode === 'letter') return '';
    var j = job();
    var labels = ['Önéletrajz', 'Motivációs levél', j ? 'Mentés és jelentkezés' : 'Mentés'];
    var cur = B.step === 'done' ? 4 : B.step;
    return '<ol class="djp-stepper">' + labels.map(function (l, i) {
      var n = i + 1;
      var cls = n === cur ? 'is-active' : n < cur ? 'is-done' : '';
      var can = cvReady() && B.step !== 'done';
      return '<li class="' + cls + '"><button type="button" data-act="step" data-n="' + n + '"' + (can ? '' : ' disabled') + '><span>' + (n < cur ? svg('check') : n) + '</span>' + l + '</button></li>';
    }).join('') + '</ol>';
  }
  function cvReady() { return B.phase === 'ready'; }

  function topbar() {
    var j = job();
    var backHref = j ? 'allas.html' : (B.mode === 'letter' ? 'motivacios-leveleim.html' : 'oneletrajzaim.html');
    var backTxt = j ? 'Vissza az álláshoz' : (B.mode === 'letter' ? 'Motivációs leveleim' : 'Önéletrajzaim');
    var back = '<a class="djp-b-back" href="' + backHref + '">' + svg('back') + '<span>' + backTxt + '</span></a>';
    /* bal: vissza + az állás (vagy a dokumentum neve), közép: lépésjelző + alatta az illeszkedés, jobb: fő művelet */
    var left = j
      ? '<div class="djp-b-jobmini"><img src="' + j.logo + '" alt=""><div>' + back + '<b>' + esc(j.title) + '</b><span>' + esc(j.company + ' · ' + j.city + ' · ' + j.salary) + '</span></div></div>'
      : '<div class="djp-b-jobmini is-plain"><div>' + back + '<b>' + esc(B.step === 2 || B.mode === 'letter' ? (B.letterTitle || 'Motivációs levél') : B.title) + '</b><span>CV-generátor</span></div></div>';
    var meter = matchMeter();
    var finish = j && (B.step === 1 || B.step === 2) && B.mode !== 'letter'
      ? '<button type="button" class="djp-btn djp-btn-finish" data-act="finish"' + (cvReady() ? '' : ' disabled') + '>Jelentkezés befejezése ' + svg('arrow', 'djp-arrow-r') + '</button>' : '';
    var save = B.mode === 'letter' ? '<button type="button" class="djp-btn djp-btn-red" data-act="save-letter-only">Mentés</button>' : '';
    return '<div class="djp-b-top"><div class="djp-b-top-l">' + left + '</div>' +
      '<div class="djp-b-top-c">' + stepper() + (meter ? '<div class="djp-b-meter" data-meter>' + meter + '</div>' : '') + '</div>' +
      '<div class="djp-b-top-actions">' + finish + save + '</div></div>';
  }

  /* a dokumentum neve a szerkesztő tetején (mint a Jobseekerben) */
  function docName() {
    var isL = B.step === 2 || B.mode === 'letter';
    var t = isL ? (B.letterTitle || 'Motivációs levél' + (job() ? ' – ' + job().company : '')) : B.title;
    return '<label class="djp-docname">' + svg('edit') + '<input class="djp-b-title" data-f="title" value="' + esc(t) + '" aria-label="' + (isL ? 'A levél neve' : 'Az önéletrajz neve') + '"><span>' + (isL ? 'Levél neve' : 'Önéletrajz neve') + '</span></label>';
  }

  function matchMeter() {
    var j = job();
    if (!j || B.step === 'done' || B.phase === 'upload' || B.phase === 'parsing' || B.phase === 'boosting') return '';
    var m = DJP.ai.match(B.ui.showOriginal && B.original ? B.original : (lang() !== 'hu' && B.langs && B.langs.hu ? B.langs.hu : B.cv), j);
    var col = m.score >= 75 ? 'is-good' : m.score >= 45 ? 'is-mid' : 'is-low';
    return '<div class="djp-meter ' + col + '" title="Becsült illeszkedés a hirdetés követelményeihez"><span>Illeszkedés a hirdetéshez</span><div class="djp-meter-bar"><i style="width:' + m.score + '%"></i></div><b>' + m.score + '%</b></div>';
  }

  function jobStrip() { return ''; }

  /* ---------- 1. lépés: CV szerkesztő ---------- */
  function input(label, path, value, opts) {
    opts = opts || {};
    return '<label class="djp-field' + (opts.full ? ' is-full' : '') + '"><span>' + label + '</span>' +
      (opts.textarea
        ? '<textarea data-f="' + path + '" rows="' + (opts.rows || 4) + '" placeholder="' + esc(opts.ph || '') + '">' + esc(value) + '</textarea>'
        : '<input data-f="' + path + '" type="' + (opts.type || 'text') + '" value="' + esc(value) + '" placeholder="' + esc(opts.ph || '') + '">') + '</label>';
  }

  function acc(id, head, body, extraCls) {
    var open = !!B.ui.open[id];
    return '<div class="djp-acc' + (open ? ' is-open' : '') + (extraCls || '') + '" data-acc="' + id + '">' + head(open) + (open ? '<div class="djp-acc-body">' + body() + '</div>' : '') + '</div>';
  }

  function personalPanel() {
    var p = B.cv.personal;
    return acc('personal', function () {
      return '<div class="djp-acc-head"><button type="button" class="djp-acc-toggle" data-act="toggle" data-id="personal"><b>Személyes adatok</b>' +
        (B.changes.some(function (c) { return c.sectionId === 'personal'; }) ? '<i class="djp-ai-badge">' + svg('spark') + 'AI</i>' : '') + svg('chev', 'djp-chev') + '</button></div>';
    }, function () {
      var extras = p.extra.map(function (e) {
        return '<label class="djp-field"><span>' + esc(e.label) + ' <button type="button" class="djp-x-sm" data-act="rm-extra" data-key="' + e.key + '" aria-label="Törlés">' + svg('close') + '</button></span><input data-f="extra:' + e.key + '" value="' + esc(e.value) + '"></label>';
      }).join('');
      var missing = DJP.EXTRA_FIELDS.filter(function (f) { return !p.extra.some(function (e) { return e.key === f.key; }); });
      return '<div class="djp-photo-row"><div class="djp-photo">' + (p.photo ? '<img src="' + p.photo + '" alt="">' : svg('plus')) + '</div>' +
        '<label class="djp-btn djp-btn-outline djp-btn-sm">Fotó feltöltése<input type="file" accept="image/*" data-photo hidden></label>' +
        (p.photo ? '<button type="button" class="djp-link" data-act="rm-photo">Eltávolítás</button>' : '') + '</div>' +
        '<div class="djp-grid">' +
        input('Vezetéknév', 'personal:lastName', p.lastName) + input('Keresztnév', 'personal:firstName', p.firstName) +
        input('Kívánt pozíció / címsor', 'personal:headline', p.headline, { full: true, ph: 'pl. Ügyfélkapcsolati munkatárs' }) +
        input('E-mail cím', 'personal:email', p.email) + input('Telefonszám', 'personal:phone', p.phone) +
        input('Cím', 'personal:address', p.address, { full: true }) +
        input('Irányítószám', 'personal:postCode', p.postCode) + input('Város', 'personal:city', p.city) + extras + '</div>' +
        (missing.length ? '<div class="djp-chips">' + missing.map(function (f) { return '<button type="button" class="djp-chip" data-act="add-extra" data-key="' + f.key + '">' + svg('plus') + esc(f.label) + '</button>'; }).join('') + '</div>' : '');
    });
  }

  function aiTools(s) {
    var j = job();
    if (s.type === 'text') {
      var empty = !(s.text || '').trim();
      var main = s.kind === 'profile'
        ? '<button type="button" class="djp-btn-ai djp-btn-sm" data-act="ai-profile" data-sec="' + s.id + '">' + svg('spark') + (empty ? ' Írja meg az AI' : (j ? ' Igazítsd az álláshoz' : ' Javítsd AI-val')) + '</button>'
        : '';
      return '<div class="djp-ai-row">' + main + (empty ? '' :
        '<button type="button" class="djp-btn-ghost djp-btn-sm" data-act="ai-text" data-mode="rephrase" data-sec="' + s.id + '">' + svg('spark') + ' Átfogalmaz</button>' +
        '<button type="button" class="djp-btn-ghost djp-btn-sm" data-act="ai-text" data-mode="shorter" data-sec="' + s.id + '">Rövidebb</button>' +
        '<button type="button" class="djp-btn-ghost djp-btn-sm" data-act="ai-text" data-mode="longer" data-sec="' + s.id + '">Bővebb</button>') + '</div>';
    }
    return '';
  }

  function entryItem(s, it, idx) {
    var lab = (DJP.SECTION_TYPES[s.kind] && DJP.SECTION_TYPES[s.kind].labels) || { title: 'Cím', subtitle: 'Alcím', city: 'Város' };
    var open = !!B.ui.openItem[it.id];
    var head = '<div class="djp-item-head"><button type="button" class="djp-item-toggle" data-act="toggle-item" data-id="' + it.id + '"><b data-ihead="' + it.id + '">' + esc(it.title || '(Nincs megadva)') + '</b><span>' +
      esc([it.subtitle, [it.start, it.end].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')) + '</span></button>' +
      '<div class="djp-item-ctl"><button type="button" data-act="item-up" data-sec="' + s.id + '" data-id="' + it.id + '" aria-label="Fel"' + (idx === 0 ? ' disabled' : '') + '>' + svg('up') + '</button>' +
      '<button type="button" data-act="item-down" data-sec="' + s.id + '" data-id="' + it.id + '" aria-label="Le"' + (idx === s.items.length - 1 ? ' disabled' : '') + '>' + svg('down') + '</button>' +
      '<button type="button" data-act="item-rm" data-sec="' + s.id + '" data-id="' + it.id + '" aria-label="Törlés">' + svg('trash') + '</button></div></div>';
    if (!open) return '<div class="djp-item">' + head + '</div>';
    var base = 'item:' + s.id + ':' + it.id + ':';
    return '<div class="djp-item is-open">' + head + '<div class="djp-grid">' +
      input(lab.title, base + 'title', it.title, { full: true }) + input(lab.subtitle, base + 'subtitle', it.subtitle) + input(lab.city, base + 'city', it.city) +
      input('Kezdés', base + 'start', it.start, { ph: 'pl. 2023.11' }) + input('Befejezés', base + 'end', it.end, { ph: 'pl. jelenleg' }) +
      input('Leírás', base + 'desc', it.desc, { full: true, textarea: true, rows: 6, ph: 'Soronként egy pont, „• ” jellel kezdve.' }) + '</div>' +
      '<div class="djp-ai-row"><button type="button" class="djp-btn-ai djp-btn-sm" data-act="ai-entry" data-sec="' + s.id + '" data-id="' + it.id + '">' + svg('spark') + ' Eredményorientált átfogalmazás</button>' +
      '<span class="djp-hint">Tipp: jelölj ki egy mondatot az AI-eszköztárhoz.</span></div></div>';
  }

  function sectionBody(s) {
    if (s.type === 'text') {
      var t = DJP.SECTION_TYPES[s.kind] || {};
      return '<textarea class="djp-ta" data-f="sec:' + s.id + ':text" rows="' + (s.kind === 'profile' ? 6 : 3) + '" placeholder="' + esc(t.placeholder || '') + '">' + esc(s.text || '') + '</textarea>' + aiTools(s);
    }
    if (s.type === 'entries') {
      return s.items.map(function (it, i) { return entryItem(s, it, i); }).join('') +
        '<button type="button" class="djp-add" data-act="add-item" data-sec="' + s.id + '">' + svg('plus') + ' Új tétel hozzáadása</button>';
    }
    if (s.type === 'skills') {
      var rows = s.items.map(function (it) {
        var b = 'item:' + s.id + ':' + it.id + ':';
        return '<div class="djp-skill-row"><input data-f="' + b + 'name" value="' + esc(it.name) + '" placeholder="Készség">' +
          '<select data-f="' + b + 'level">' + DJP.SKILL_LEVELS.map(function (l) { return '<option value="' + l + '"' + (it.level === l ? ' selected' : '') + '>' + (l || 'Szint –') + '</option>'; }).join('') + '</select>' +
          '<button type="button" class="djp-icon-btn" data-act="item-rm" data-sec="' + s.id + '" data-id="' + it.id + '" aria-label="Törlés">' + svg('trash') + '</button>' +
          '<input class="djp-skill-detail" data-f="' + b + 'detail" value="' + esc(it.detail) + '" placeholder="Részletek (opcionális)"></div>';
      }).join('');
      var sugg = B.ui.suggest === s.id ? '<div class="djp-suggest"><span>' + svg('spark') + ' Az AI ezeket javasolja ' + (job() ? DJP.az(esc(job().company)) + ' hirdetése alapján' : '') + ':</span><div class="djp-chips">' +
        DJP.ai.suggestSkills(job(), lang()).filter(function (n) { return !s.items.some(function (i) { return i.name === n; }); }).map(function (n) {
          return '<button type="button" class="djp-chip is-ai" data-act="add-skill" data-sec="' + s.id + '" data-name="' + esc(n) + '">' + svg('plus') + esc(n) + '</button>';
        }).join('') + '</div></div>' : '';
      return rows + '<div class="djp-ai-row"><button type="button" class="djp-add" data-act="add-item" data-sec="' + s.id + '">' + svg('plus') + ' Készség hozzáadása</button>' +
        '<button type="button" class="djp-btn-ai djp-btn-sm" data-act="ai-skills" data-sec="' + s.id + '">' + svg('spark') + ' Javasolj készségeket' + (job() ? ' az álláshoz' : '') + '</button></div>' + sugg;
    }
    if (s.type === 'tags') {
      var tt = DJP.SECTION_TYPES[s.kind] || {};
      var chips = s.items.filter(function (i) { return i.name; }).map(function (it) {
        return '<span class="djp-chip is-on">' + esc(it.name) + '<button type="button" data-act="item-rm" data-sec="' + s.id + '" data-id="' + it.id + '" aria-label="Törlés">' + svg('close') + '</button></span>';
      }).join('');
      var sug = (tt.suggest || []).filter(function (n) { return !s.items.some(function (i) { return i.name === n; }); }).map(function (n) {
        return '<button type="button" class="djp-chip" data-act="add-tag" data-sec="' + s.id + '" data-name="' + esc(n) + '">' + svg('plus') + esc(n) + '</button>';
      }).join('');
      return (chips ? '<div class="djp-chips">' + chips + '</div>' : '') +
        '<label class="djp-field djp-tag-add"><span>Új címke</span><input data-tag-input="' + s.id + '" placeholder="Írd be, majd Enter"></label>' +
        (sug ? '<div class="djp-hint">Javaslatok:</div><div class="djp-chips">' + sug + '</div>' : '');
    }
    return s.items.map(function (it) {
      var b = 'item:' + s.id + ':' + it.id + ':';
      return '<div class="djp-skill-row is-lang"><input data-f="' + b + 'name" value="' + esc(it.name) + '" placeholder="Nyelv">' +
        '<select data-f="' + b + 'level">' + DJP.LANG_LEVELS.map(function (l) { return '<option' + (it.level === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select>' +
        '<button type="button" class="djp-icon-btn" data-act="item-rm" data-sec="' + s.id + '" data-id="' + it.id + '" aria-label="Törlés">' + svg('trash') + '</button></div>';
    }).join('') + '<button type="button" class="djp-add" data-act="add-item" data-sec="' + s.id + '">' + svg('plus') + ' Nyelv hozzáadása</button>';
  }

  function sectionPanel(s) {
    return acc(s.id, function (open) {
      var ai = s.ai && lang() === 'hu' ? '<span class="djp-ai-flag">' + svg('spark') + (s.isNew ? 'Új – AI' : 'AI javította') +
        '<button type="button" data-act="ai-accept" data-sec="' + s.id + '">Elfogad</button><button type="button" data-act="ai-revert" data-sec="' + s.id + '">' + (s.isNew ? 'Eltávolít' : 'Visszaállít') + '</button></span>' : '';
      return '<div class="djp-acc-head" draggable="true" data-drag="' + s.id + '"><span class="djp-drag" title="Húzd az átrendezéshez">' + svg('drag') + '</span>' +
        '<button type="button" class="djp-acc-toggle" data-act="toggle" data-id="' + s.id + '"><b>' + esc(s.title) + '</b>' + (s.items ? '<em>' + s.items.length + '</em>' : '') + svg('chev', 'djp-chev') + '</button>' + ai +
        '<button type="button" class="djp-icon-btn" data-act="sec-rm" data-sec="' + s.id + '" aria-label="Szakasz törlése">' + svg('trash') + '</button></div>';
    }, function () {
      return '<label class="djp-field djp-sec-title"><span>Szakasz címe</span><input data-f="sec:' + s.id + ':title" value="' + esc(s.title) + '"></label>' + sectionBody(s);
    }, s.ai && B.ui.highlight ? ' is-ai' : '');
  }

  function addSectionChips() {
    var present = {};
    B.cv.sections.forEach(function (s) { present[s.kind] = 1; });
    var kinds = Object.keys(DJP.SECTION_TYPES).filter(function (k) { return k === 'custom' || !present[k]; });
    return '<div class="djp-addsec"><div class="djp-addsec-title">Szakasz hozzáadása</div><div class="djp-chips">' +
      kinds.map(function (k) { return '<button type="button" class="djp-chip" data-act="add-sec" data-kind="' + k + '">' + svg('plus') + esc(DJP.SECTION_TYPES[k].title) + '</button>'; }).join('') + '</div></div>';
  }

  function ring(v, label) {
    var c = 2 * Math.PI * 26;
    return '<div class="djp-ring"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" class="bg"/><circle cx="32" cy="32" r="26" class="fg" stroke-dasharray="' + (c * v / 100) + ' ' + c + '"/></svg><b>' + v + '%</b><span>' + label + '</span></div>';
  }

  function boostSummary() {
    if (B.mode !== 'boost' || !B.original || lang() !== 'hu') return '';
    var j = job();
    var before = B.matchBefore || DJP.ai.match(B.original, j);
    var after = DJP.ai.match(B.cv, j);
    var mark = function (st) { return st === 1 ? '<i class="ok">✓</i>' : st === 0.5 ? '<i class="mid">◐</i>' : '<i class="no">✕</i>'; };
    return '<div class="djp-aisum"><div class="djp-aisum-head">' + svg('spark') + '<div><b>Az AI felturbózta az önéletrajzodat</b><span>' + (j ? DJP.az(esc(j.company)) + ' – ' + esc(j.title) + ' hirdetéséhez igazítva' : '') + '</span></div></div>' +
      (j ? '<div class="djp-aisum-match">' + ring(before.score, 'eredeti') + '<span class="djp-arrow">→</span>' + ring(after.score, 'felturbózott') +
        '<ul class="djp-reqs">' + after.reqs.map(function (r, i) {
          return '<li>' + mark(before.reqs[i].status) + '<span class="djp-arrow-sm">→</span>' + mark(r.status) + '<span>' + esc(r.label) + ' <em>(' + esc(r.need) + ')</em></span></li>';
        }).join('') + '</ul></div>' : '') +
      '<details class="djp-changes"><summary>Változtatások (' + B.changes.length + ')</summary><ul>' + B.changes.map(function (c) { return '<li>' + esc(c.label) + '</li>'; }).join('') + '</ul></details>' +
      '<div class="djp-aisum-actions"><div class="djp-seg"><button type="button" data-act="show-orig" data-v="0" class="' + (B.ui.showOriginal ? '' : 'is-on') + '">Felturbózott</button><button type="button" data-act="show-orig" data-v="1" class="' + (B.ui.showOriginal ? 'is-on' : '') + '">Eredeti</button></div>' +
      '<label class="djp-check"><input type="checkbox" data-act-check="highlight"' + (B.ui.highlight ? ' checked' : '') + '> Változások kiemelése</label>' +
      '<button type="button" class="djp-link" data-act="redo-questions">Kérdések újra</button></div></div>';
  }

  function parsedBanner() {
    var boostQ = B.mode === 'boost' && B.phase === 'questions';
    if (!boostQ && !B.parsedNotice) return '';
    var c = function (k) { var s = B.cv.sections.find(function (x) { return x.kind === k; }); return s && s.items ? s.items.length : 0; };
    var head = B.parseSource === 'linkedin' ? 'Importáltuk a LinkedIn profilodat' : 'Kiolvastuk és strukturáltuk az önéletrajzodat';
    var stats = '<div class="djp-parsed-stats"><span><b>' + c('experience') + '</b> munkahely</span><span><b>' + c('education') + '</b> tanulmány</span><span><b>' + c('courses') + '</b> kurzus</span><span><b>' + c('projects') + '</b> projekt</span><span><b>' + c('skills') + '</b> készségcsoport</span><span><b>' + c('languages') + '</b> nyelv</span></div>';
    if (!boostQ) {
      return '<div class="djp-parsed"><div class="djp-parsed-head">' + svg('check') + '<b>' + head + '</b><button type="button" class="djp-x-sm" data-act="hide-notice" aria-label="Bezárás">' + svg('close') + '</button></div>' + stats +
        '<p>Az adataid bekerültek a szerkesztőbe. Szerkesztheted őket, vagy az AI ' + (job() ? DJP.az(esc(job().company)) + ' hirdetéséhez igazíthatja a CV-det 6 rövid kérdés alapján.' : 'felturbózhatja 6 rövid kérdés alapján.') + '</p>' +
        '<button type="button" class="djp-btn-ai" data-act="start-boost">' + svg('spark') + ' Felturbózás AI-val</button></div>';
    }
    return '<div class="djp-parsed"><div class="djp-parsed-head">' + svg('check') + '<b>' + head + '</b></div>' +
      '<div class="djp-parsed-stats"><span><b>' + c('experience') + '</b> munkahely</span><span><b>' + c('education') + '</b> tanulmány</span><span><b>' + c('courses') + '</b> kurzus</span><span><b>' + c('projects') + '</b> projekt</span><span><b>' + c('skills') + '</b> készségcsoport</span><span><b>' + c('languages') + '</b> nyelv</span></div>' +
      '<p>Ellenőrizd az adatokat, majd válaszolj <b>6 rövid kérdésre</b>, hogy az AI ' + (job() ? DJP.az(esc(job().company)) + ' hirdetéséhez' : 'a célodhoz') + ' igazíthassa a CV-det.</p>' +
      '<button type="button" class="djp-btn djp-btn-red" data-act="open-wizard">' + svg('spark') + ' Kérdések indítása</button></div>';
  }

  function cvEditor() {
    var next = '<div class="djp-b-next">' + (B.phase === 'ready'
      ? '<span class="djp-next-lbl">Következő lépés</span><button type="button" class="djp-btn djp-btn-red" data-act="step" data-n="2">' + svg('spark') + ' Motivációs levél generálása →</button>'
      : '<button type="button" class="djp-btn djp-btn-red" data-act="open-wizard">' + svg('spark') + ' Kérdések indítása</button>') + '</div>';
    return '<div class="djp-b-left-in">' + docName() + importBar() + parsedBanner() + boostSummary() + personalPanel() +
      '<div data-secs>' + B.cv.sections.map(sectionPanel).join('') + '</div>' + addSectionChips() + '</div>' + next;
  }

  /* meglévő CV feltöltése / LinkedIn import / törlés – minden módban elérhető */
  function importBar() {
    var li = B.ui.linkedin;
    return '<div class="djp-import"><div class="djp-import-row">' +
      '<label class="djp-import-btn">' + svg('upload') + '<span><b>Meglévő önéletrajz feltöltése</b><em>PDF, DOC, DOCX – kiolvassuk és kitöltjük</em></span><input type="file" accept=".pdf,.doc,.docx" data-import-file hidden></label>' +
      '<button type="button" class="djp-import-btn' + (li ? ' is-on' : '') + '" data-act="toggle-linkedin">' + svg('linkedin', 'djp-li') + '<span><b>LinkedIn profil importálása</b><em>Add meg a profilod linkjét</em></span></button></div>' +
      (li ? '<div class="djp-import-li"><input data-li-url placeholder="https://www.linkedin.com/in/…" value="' + esc(B.ui.liUrl || 'https://www.linkedin.com/in/barna-bogdán-796139188') + '"><button type="button" class="djp-btn djp-btn-sm djp-btn-li" data-act="import-linkedin">Importálás</button></div>' : '') +
      '<button type="button" class="djp-link djp-import-clear" data-act="cv-clear">' + svg('trash') + ' Önéletrajz törlése és újrakezdés</button></div>';
  }

  /* ---------- feltöltés / kiolvasás / felturbózás képernyők ---------- */
  function uploadScreen() {
    var j = job();
    var saved = S.documents('cv').filter(function (d) { return d.category === 'uploaded'; });
    return '<div class="djp-center"><div class="djp-card djp-upload-card"><div class="djp-card-ico">' + svg('spark') + '</div>' +
      '<h2>AI CV-felturbózás</h2><p>Töltsd fel a meglévő önéletrajzodat – minden adatát kiolvassuk és strukturáljuk' + (j ? ', majd a <b>' + esc(j.company) + '</b> hirdetéséhez igazítjuk' : '') + '.</p>' +
      '<label class="djp-drop" data-drop>' + svg('upload') + '<b>Húzd ide az önéletrajzod, vagy kattints a tallózáshoz</b><span>PDF, DOC, DOCX · max. 10 MB</span><input type="file" accept=".pdf,.doc,.docx" data-boost-file hidden></label>' +
      (saved.length ? '<div class="djp-saved"><div class="djp-saved-title">vagy válassz a feltöltött önéletrajzaid közül</div>' + saved.map(function (d) {
        return '<div class="djp-saved-wrap"><button type="button" class="djp-saved-row" data-act="boost-saved" data-id="' + d.id + '">' + svg('file', 'djp-saved-ico') + '<span><b>' + esc(d.title) + '</b><em>Feltöltött · ' + DJP.fmtDate(d.updatedAt) + '</em></span><i>Kiválasztom →</i></button>' +
          '<button type="button" class="djp-icon-btn" data-act="rm-saved" data-id="' + d.id + '" title="Törlés" aria-label="Törlés">' + svg('trash') + '</button></div>';
      }).join('') + '</div>' : '') +
      '<ol class="djp-flow"><li><b>1</b>Kiolvasás és strukturálás</li><li><b>2</b>6 célzott kérdés</li><li><b>3</b>AI-javítás + illeszkedés</li><li><b>4</b>Motivációs levél</li></ol></div></div>';
  }

  function progressScreen(title, file, steps, doneCount) {
    return '<div class="djp-center"><div class="djp-card djp-progress-card"><div class="djp-card-ico is-spin">' + svg('spark') + '</div><h2>' + title + '</h2>' +
      (file ? '<div class="djp-file is-static">' + svg('file') + '<span><b>' + esc(file) + '</b></span></div>' : '') +
      '<ul class="djp-progress">' + steps.map(function (s, i) {
        return '<li class="' + (i < doneCount ? 'is-done' : i === doneCount ? 'is-active' : '') + '"><span>' + (i < doneCount ? svg('check') : i === doneCount ? '<i class="djp-spinner"></i>' : '') + '</span>' + s + '</li>';
      }).join('') + '</ul></div></div>';
  }

  var PARSE_STEPS = ['Szöveg kiolvasása a dokumentumból', 'Szakaszok felismerése (tapasztalat, tanulmányok, készségek…)', 'Adatok strukturálása és fordítása magyarra', 'Összevetés az álláshirdetéssel'];
  var BOOST_STEPS = ['Válaszaid feldolgozása', 'Bemutatkozás újraírása az álláshoz', 'Tapasztalatok átfogalmazása eredményekkel', 'Készségek rangsorolása a követelmények szerint', 'Illeszkedés kiszámítása'];

  var LI_STEPS = ['Kapcsolódás a LinkedIn profilhoz', 'Tapasztalatok és tanulmányok importálása', 'Készségek és nyelvek importálása', 'Adatok strukturálása magyarra'];
  function parseView(i) {
    return B.parseSource === 'linkedin'
      ? progressScreen('LinkedIn profil importálása', B.fileName, LI_STEPS, i)
      : progressScreen('Önéletrajz kiolvasása', B.fileName, PARSE_STEPS, i);
  }

  function runParsing(fileName, source) {
    var keep = { template: B.cv.template, accent: B.cv.accent, font: B.cv.font, spacing: B.cv.spacing };
    B.phase = 'parsing'; B.fileName = fileName; B.parseSource = source || 'upload'; B.wizard = false; render();
    var i = 0;
    (function next() {
      root.querySelector('[data-work]').innerHTML = parseView(i);
      if (i < PARSE_STEPS.length) { i += 1; setTimeout(next, 750); return; }
      var cv = Object.assign(DJP.parsedCV(), keep);
      if (B.parseSource === 'linkedin') {
        var li = cv.personal.extra.find(function (e) { return e.key === 'linkedin'; });
        if (li) li.value = (B.ui.liUrl || li.value).replace(/^https?:\/\/(www\.)?/, '');
      }
      B.cv = cv; B.original = null; B.changes = []; B.matchBefore = null; B.answers = {}; B.langs = null;
      if (B.mode === 'boost') {
        B.title = (job() ? 'Önéletrajz – ' + job().company : 'Felturbózott önéletrajz') + ' (AI)';
        B.phase = 'questions'; B.parsedNotice = false;
      } else {
        B.phase = 'ready'; B.parsedNotice = true;
      }
      B.ui.open = { personal: true }; B.ui.linkedin = false;
      persist();
      render();
      var lp = root.querySelector('[data-left]'); if (lp) lp.scrollTop = 0;
      DJP.toast(B.parseSource === 'linkedin' ? 'LinkedIn profil importálva' : 'Kiolvastuk az önéletrajzodat', 'ok');
    })();
  }

  function runBoost() {
    B.wizard = false;
    B.phase = 'boosting'; render();
    var i = 0;
    (function next() {
      root.querySelector('[data-work]').innerHTML = progressScreen('Az AI felturbózza az önéletrajzodat', null, BOOST_STEPS, i);
      if (i < BOOST_STEPS.length) { i += 1; setTimeout(next, 650); return; }
      var base = B.original || DJP.clone(B.cv);
      var res = DJP.ai.boost(base, B.answers, job());
      B.original = base;
      B.matchBefore = DJP.ai.match(base, job());
      B.cv = res.cv; B.changes = res.changes; B.langs = null;
      B.phase = 'ready'; B.ui.showOriginal = false; B.ui.open = {};
      persist();
      render();
      DJP.toast('Kész! ' + res.changes.length + ' változtatás az álláshoz igazítva', 'ok');
    })();
  }

  /* ---------- kérdés-varázsló ---------- */
  function wizard() {
    if (!B.wizard) { B._wizShown = false; return ''; }
    var qs = DJP.boostQuestions(job() || DJP.jobs.startuphub);
    var q = qs[B.qIndex];
    var a = B.answers[q.id] || (B.answers[q.id] = { chips: q.prefill ? [q.prefill] : [], text: '' });
    var last = B.qIndex === qs.length - 1;
    var enter = !B._wizShown; B._wizShown = true;
    return '<div class="djp-overlay' + (enter ? ' djp-anim-in' : '') + '"><div class="djp-wizard" role="dialog" aria-modal="true">' +
      '<div class="djp-wiz-head">' + svg('spark') + '<div><b>Pár kérdés, hogy a CV-d ehhez az álláshoz illeszkedjen</b><span>' + (B.qIndex + 1) + ' / ' + qs.length + '</span></div><button type="button" class="djp-x" data-act="close-wizard" aria-label="Bezárás">' + svg('close') + '</button></div>' +
      '<div class="djp-wiz-prog"><i style="width:' + ((B.qIndex + 1) / qs.length * 100) + '%"></i></div>' +
      '<h3>' + esc(q.q) + '</h3><p class="djp-wiz-hint">' + esc(q.hint) + '</p>' +
      '<div class="djp-chips">' + q.chips.map(function (c) {
        var on = a.chips.indexOf(c) >= 0;
        return '<button type="button" class="djp-chip' + (on ? ' is-on' : '') + '" data-act="q-chip" data-v="' + esc(c) + '">' + (on ? svg('check') : svg('plus')) + esc(c) + '</button>';
      }).join('') + '</div>' +
      '<label class="djp-field is-full"><span>Saját válasz (opcionális)</span><textarea rows="3" data-q-text placeholder="Írd le a saját szavaiddal…">' + esc(a.text) + '</textarea></label>' +
      '<div class="djp-wiz-foot"><button type="button" class="djp-btn djp-btn-ghost" data-act="q-prev"' + (B.qIndex === 0 ? ' disabled' : '') + '>← Vissza</button>' +
      '<button type="button" class="djp-link" data-act="q-skip">Kihagyom</button>' +
      (last ? '<button type="button" class="djp-btn djp-btn-red" data-act="q-finish">' + svg('spark') + ' CV felturbózása</button>'
        : '<button type="button" class="djp-btn djp-btn-red" data-act="q-next">Tovább →</button>') + '</div></div></div>';
  }

  /* ---------- 2. lépés: motivációs levél ---------- */
  function newLetter() {
    var j = job();
    return {
      recipient: { company: j ? j.company : '', person: 'HR csapat', address: j ? j.companyAddress : '' },
      city: (B.cv.personal.city || 'Sepsiszentgyörgy').split(',')[0], date: DJP.huDate(),
      subject: j ? 'Jelentkezés – ' + j.title : 'Jelentkezés', body: ''
    };
  }

  function chipsGroup(name, cur, opts) {
    return '<div class="djp-seg">' + opts.map(function (o) {
      return '<button type="button" data-act="set-' + name + '" data-v="' + o[0] + '" class="' + (cur === o[0] ? 'is-on' : '') + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  var TONES = [['formal', 'Formális'], ['friendly', 'Barátságos'], ['enthusiastic', 'Lelkes']];
  var LENGTHS = [['short', 'Rövid'], ['normal', 'Közepes'], ['long', 'Hosszú']];

  function letterIntro() {
    var j = job();
    return '<div class="djp-center"><div class="djp-card djp-letter-intro"><div class="djp-card-ico">' + svg('letter') + '</div>' +
      '<h2>Még egy lépés: motivációs levél</h2>' +
      '<div class="djp-stat is-big">' + svg('spark') + '<span>A DreamJobs HR-statisztikái alapján a <b>motivációs levéllel</b> jelentkezők <b>' + DJP.HR_STAT + '-kal nagyobb eséllyel</b> jutnak be interjúra.</span></div>' +
      '<p>Az AI a most elkészült önéletrajzodból' + (j ? ' és a <b>' + esc(j.company) + '</b> „' + esc(j.title) + '” hirdetéséből' : '') + ' megírja helyetted – utána szabadon szerkesztheted.</p>' +
      '<div class="djp-intro-opts"><div><span>Hangnem</span>' + chipsGroup('tone', B.tone, TONES) + '</div><div><span>Hossz</span>' + chipsGroup('length', B.length, LENGTHS) + '</div></div>' +
      '<button type="button" class="djp-btn djp-btn-red djp-btn-lg" data-act="gen-letter">' + svg('spark') + ' Motivációs levél generálása</button>' +
      (B.mode === 'letter' ? '' : '<button type="button" class="djp-link" data-act="skip-letter">Kihagyom, levél nélkül megyek tovább</button>') + '</div></div>';
  }

  function letterEditor() {
    var L = B.letter, j = job();
    return '<div class="djp-b-left-in">' + docName() +
      acc('l-src', function () { return '<div class="djp-acc-head"><button type="button" class="djp-acc-toggle" data-act="toggle" data-id="l-src"><b>Forrás</b>' + svg('chev', 'djp-chev') + '</button></div>'; }, function () {
        return '<div class="djp-src"><div>' + svg('file') + '<span><em>Önéletrajz</em><b>' + esc(B.title) + '</b></span></div>' +
          (j ? '<div><img src="' + j.logo + '" alt=""><span><em>Állás</em><b>' + esc(j.title) + ' · ' + esc(j.company) + '</b></span></div>' : '') + '</div>';
      }) +
      acc('l-rec', function () { return '<div class="djp-acc-head"><button type="button" class="djp-acc-toggle" data-act="toggle" data-id="l-rec"><b>Címzett és adatok</b>' + svg('chev', 'djp-chev') + '</button></div>'; }, function () {
        return '<div class="djp-grid">' + input('Cég', 'rec:company', L.recipient.company) + input('Kapcsolattartó', 'rec:person', L.recipient.person) +
          input('Cím', 'rec:address', L.recipient.address, { full: true }) + input('Város', 'letter:city', L.city) + input('Dátum', 'letter:date', L.date) +
          input('Tárgy', 'letter:subject', L.subject, { full: true }) + '</div>';
      }) +
      '<div class="djp-acc is-open"><div class="djp-acc-head"><b class="djp-acc-static">Tartalom</b></div><div class="djp-acc-body">' +
      '<p class="djp-hint">Jelölj ki egy mondatot, és az AI átfogalmazza, rövidíti vagy bővíti.</p>' +
      '<textarea class="djp-ta djp-ta-letter" data-f="letter:body" rows="18"' + (B.letterState === 'loading' ? ' readonly' : '') + '>' + esc(L.body) + '</textarea>' +
      '<div class="djp-intro-opts is-inline"><div><span>Hangnem</span>' + chipsGroup('tone', B.tone, TONES) + '</div><div><span>Hossz</span>' + chipsGroup('length', B.length, LENGTHS) + '</div></div>' +
      '<div class="djp-ai-row"><button type="button" class="djp-btn-ai" data-act="gen-letter"' + (B.letterState === 'loading' ? ' disabled' : '') + '>' + svg('spark') + ' Újragenerálás AI-val</button></div></div></div></div>' +
      (B.mode === 'letter' ? '' : '<div class="djp-b-next"><button type="button" class="djp-btn djp-btn-ghost djp-next-back" data-act="step" data-n="1">← Önéletrajz</button><span class="djp-next-lbl">Következő lépés</span><button type="button" class="djp-btn djp-btn-red" data-act="step" data-n="3">' + (j ? 'Mentés és jelentkezés' : 'Mentés') + ' →</button></div>');
  }

  function genLetter() {
    if (!B.letter) B.letter = newLetter();
    B.letterState = 'loading';
    B.letter.body = '';
    render();
    DJP.ai.wait(900).then(function () {
      var res = DJP.ai.coverLetter(B.cv, job(), { tone: B.tone, length: B.length });
      B.letter.subject = res.subject;
      var ta = root.querySelector('[data-f="letter:body"]');
      return DJP.ai.typeText(function (t) {
        B.letter.body = t;
        if (ta) { ta.value = t; ta.scrollTop = ta.scrollHeight; }
        schedulePreview(true);
      }, res.body, { frames: 90 });
    }).then(function () {
      B.letterState = 'done';
      if (job()) DJP.toast('Kész a leveled! Már csak véglegesítened kell a jelentkezést.', 'ok');
      if (!B.letterTitle) B.letterTitle = 'Motivációs levél' + (job() ? ' – ' + job().company : '');
      persist();
      render();
    });
  }

  /* ---------- 3. lépés: összegzés / kész ---------- */
  function thumb(html) { return '<div class="djp-thumb"><div class="djp-thumb-in">' + html + '</div></div>'; }

  function summary() {
    var j = job();
    var hasLetter = B.letter && B.letter.body && B.letterState === 'done';
    return '<div class="djp-summary"><h2>' + (j ? 'Minden készen áll a jelentkezéshez' : 'Dokumentumok mentése') + '</h2>' +
      '<p class="djp-muted">' + (j ? 'Ellenőrizd az anyagokat, majd küldd el a jelentkezésedet ' + DJP.az(esc(j.company)) + ' részére. Az önéletrajzod az Önéletrajzaim, a leveled a Motivációs leveleim közé is mentődik.' : 'Az önéletrajzod az Önéletrajzaim, a leveled a Motivációs leveleim közé mentődik – bármikor letöltheted.') + '</p>' +
      '<div class="djp-sum-grid">' +
      '<div class="djp-sum-card">' + thumb(DJP.renderCV(B.cv)) + '<b>' + esc(B.title) + '</b><span class="djp-badge is-' + B.category + '">' + (B.category === 'boosted' ? 'AI-val felturbózott' : 'Generátorral készült') + '</span><button type="button" class="djp-link" data-act="step" data-n="1">Szerkesztés</button></div>' +
      '<div class="djp-sum-card">' + (hasLetter ? thumb(DJP.renderLetter(B.letter, B.cv)) + '<b>' + esc(B.letterTitle) + '</b><span class="djp-badge is-ai-letter">AI motivációs levél</span><button type="button" class="djp-link" data-act="step" data-n="2">Szerkesztés</button>'
        : '<div class="djp-thumb is-empty">' + svg('letter') + '<span>Nincs motivációs levél</span></div><b>Motivációs levél</b><span class="djp-muted text-sm">Ajánlott: ' + DJP.HR_STAT + '-kal nagyobb esély</span><button type="button" class="djp-btn-ai djp-btn-sm" data-act="step" data-n="2">' + svg('spark') + ' Generálás</button>') + '</div>' +
      (j ? '<div class="djp-sum-card djp-sum-job"><img src="' + j.logo + '" alt=""><b>' + esc(j.title) + '</b><span>' + esc(j.company) + '</span><span class="djp-muted">' + esc(j.level + ' · ' + j.type + ' · ' + j.city) + '</span><span class="djp-muted">Jelentkezési határidő: ' + esc(j.deadline) + '</span>' + matchMeter() + '</div>' : saveCard(hasLetter)) +
      '</div>' +
      (j ? '<div class="djp-sum-foot">' +
        '<label class="djp-check djp-consent"><input type="checkbox" data-act-check="consent"' + (B.consent ? ' checked' : '') + '> Elfogadom, hogy az itt megadott adatokat a hirdető cégnek (' + esc(j.company) + ') továbbítjuk</label>' +
        '<div class="djp-sum-actions"><button type="button" class="djp-btn djp-btn-red djp-btn-lg" data-act="save-apply"' + (B.consent ? '' : ' disabled') + '>Mentés és jelentkezés az állásra</button>' +
        '<button type="button" class="djp-btn djp-btn-ghost" data-act="save-only">Csak mentés</button></div></div>' : '') +
      '</div>';
  }

  /* állás nélküli mentés: összegző kártya a harmadik oszlopban, benne a mentés gombbal */
  function saveCard(hasLetter) {
    return '<div class="djp-sum-card djp-sum-save"><div class="djp-sum-save-ico">' + svg('check') + '</div>' +
      '<b class="djp-sum-save-title">Minden kész a mentéshez</b>' +
      '<p>A dokumentumaid a profilmenüből bármikor elérhetők, szerkeszthetők és letölthetők.</p>' +
      '<ul class="djp-sum-list">' +
      '<li>' + svg('file') + '<span><b>' + esc(B.title) + '</b><em>Önéletrajzaim közé</em></span></li>' +
      '<li class="' + (hasLetter ? '' : 'is-off') + '">' + svg('letter') + '<span><b>' + (hasLetter ? esc(B.letterTitle) : 'Motivációs levél') + '</b><em>' + (hasLetter ? 'Motivációs leveleim közé' : 'nem készült – kihagyva') + '</em></span></li>' +
      '</ul><button type="button" class="djp-btn djp-btn-red djp-btn-lg djp-sum-save-btn" data-act="save-only">Mentés</button></div>';
  }

  function doneScreen() {
    var j = job();
    return '<div class="djp-center"><div class="djp-card djp-done"><div class="djp-success-ico">' + svg('check') + '</div>' +
      '<h2>' + (B.applied ? 'Sikeres jelentkezés!' : 'Mentve!') + '</h2>' +
      '<p>' + (B.applied ? 'A <b>' + esc(j.company) + '</b> megkapta az önéletrajzodat' + (B.letterDocId ? ' és a motivációs leveledet' : '') + ' ' + DJP.art(j.title) + ' <b>' + esc(j.title) + '</b> pozícióra.' : 'Az anyagaid az Önéletrajzaim és a Motivációs leveleim között vannak.') + '</p>' +
      '<p class="djp-muted">Az önéletrajzaidat és motivációs leveleidet a profilmenüből bármikor megtekintheted, szerkesztheted és letöltheted.</p>' +
      '<div class="djp-done-actions"><a class="djp-btn djp-btn-red" href="oneletrajzaim.html">Önéletrajzaim</a><a class="djp-btn djp-btn-outline" href="motivacios-leveleim.html">Motivációs leveleim</a>' +
      (j ? '<a class="djp-btn djp-btn-ghost" href="allas.html' + (B.applied ? '?applied=1' : '') + '">Vissza az álláshoz</a>' : '') + '</div></div></div>';
  }

  function save(apply) {
    var j = job();
    var lg = DJP.LANGS.find(function (l) { return l.id === lang(); });
    var cvTitle = lang() === 'hu' ? B.title : B.title.replace(/ \((EN|RO)\)$/, '') + ' (' + lg.short + ')';
    var cvDoc = S.saveDoc({ id: B.docId || undefined, type: 'cv', category: B.category, title: cvTitle, data: DJP.clone(B.cv), jobId: B.jobId });
    B.docId = cvDoc.id;
    if (B.letter && B.letter.body && B.letterState === 'done') {
      var l = S.saveDoc({ id: B.letterDocId || undefined, type: 'letter', category: 'ai-letter', title: B.letterTitle || 'Motivációs levél', jobId: B.jobId,
        data: { letter: DJP.clone(B.letter), cv: { personal: DJP.clone(B.cv.personal), template: B.cv.template, accent: B.cv.accent, font: B.cv.font } } });
      B.letterDocId = l.id;
    }
    if (apply && j) {
      S.addApplication({ jobId: j.id, cvId: B.docId, letterId: B.letterDocId, cvTitle: B.title, letterTitle: B.letterTitle });
      B.applied = true;
    }
    B.step = 'done';
    S.clearDraft();
    render();
  }

  /* ---------- előnézet ---------- */
  /* ---------- előnézet alatti eszközsor: egyedi legördülők ---------- */
  var SPACES = [['compact', 'Szűk', 'Több tartalom egy oldalon'], ['normal', 'Normál', 'Kiegyensúlyozott térközök'], ['airy', 'Tág', 'Levegős, nagyvonalú elrendezés']];
  function ddPop(id) {
    var cv = B.cv;
    var check = svg('check', 'djp-dd-check');
    if (id === 'tpl') {
      var base = DJP.clone(cv);
      return ['Új DreamJobs sablonok', 'Klasszikus sablonok'].map(function (g, gi) {
        return '<div class="djp-dd-title">' + g + '</div><div class="djp-tpl-grid">' + DJP.TEMPLATES.filter(function (t) { return (t.group || 0) === gi; }).map(function (t) {
          var c = Object.assign({}, base, { template: t.id, accent: t.accent, font: t.font });
          var on = DJP.tplId(cv.template) === t.id;
          return '<button type="button" class="djp-tpl-card' + (on ? ' is-on' : '') + '" data-act="set-tpl" data-v="' + t.id + '"><span class="djp-tpl-thumb"><span class="djp-tpl-thumb-in">' + DJP.renderCV(c) + '</span></span><span class="djp-tpl-name">' + (on ? check : '') + esc(t.name) + '</span></button>';
        }).join('') + '</div>';
      }).join('');
    }
    if (id === 'font') {
      return '<div class="djp-dd-title">Betűtípus</div><div class="djp-dd-list">' + DJP.FONTS.map(function (f) {
        var fam = "'" + f + "'," + (DJP.SERIF_FONTS[f] ? 'Georgia,serif' : 'Arial,sans-serif');
        return '<button type="button" class="djp-dd-item' + (cv.font === f ? ' is-on' : '') + '" data-act="set-font" data-v="' + f + '"><span style="font-family:' + fam + '">' + f + '</span><em style="font-family:' + fam + '">Aa Áá 123</em>' + (cv.font === f ? check : '') + '</button>';
      }).join('') + '</div>';
    }
    if (id === 'space') {
      return '<div class="djp-dd-title">Térköz</div><div class="djp-dd-list">' + SPACES.map(function (s) {
        var on = (cv.spacing || 'normal') === s[0];
        return '<button type="button" class="djp-dd-item' + (on ? ' is-on' : '') + '" data-act="set-space" data-v="' + s[0] + '"><span class="djp-space-ico is-' + s[0] + '"><i></i><i></i><i></i></span><span><b>' + s[1] + '</b><small>' + s[2] + '</small></span>' + (on ? check : '') + '</button>';
      }).join('') + '</div>';
    }
    if (id === 'color') {
      return '<div class="djp-dd-title">Kiemelő szín</div><div class="djp-dd-swatches">' + DJP.ACCENTS.map(function (c) {
        return '<button type="button" data-act="set-color" data-v="' + c + '" style="background:' + c + '" class="' + (cv.accent === c ? 'is-on' : '') + '" aria-label="' + c + '">' + (cv.accent === c ? svg('check') : '') + '</button>';
      }).join('') + '</div><label class="djp-dd-custom"><input type="color" data-color value="' + esc(cv.accent) + '"><span>Egyéni szín választása</span></label>';
    }
    var cur = lang();
    return '<div class="djp-dd-title">Önéletrajz nyelve</div><div class="djp-dd-list">' + DJP.LANGS.map(function (l) {
      var on = cur === l.id;
      var st = l.id === 'hu' ? 'Eredeti változat' : (B.langs && B.langs[l.id] ? 'AI-fordítás kész' : 'AI-fordítás készítése');
      return '<button type="button" class="djp-dd-item' + (on ? ' is-on' : '') + '" data-act="set-lang" data-v="' + l.id + '"><span class="djp-flag">' + l.flag + '</span><span><b>' + l.name + '</b><small>' + st + '</small></span>' + (on ? check : (l.id !== 'hu' && !(B.langs && B.langs[l.id]) ? '<i class="djp-ai-badge">' + svg('spark') + 'AI</i>' : '')) + '</button>';
    }).join('') + '</div>' +
      (cur !== 'hu' ? '<button type="button" class="djp-dd-action" data-act="retranslate">' + svg('spark') + ' Fordítás frissítése a magyar változatból</button>' : '') +
      '<p class="djp-dd-note">A fordítás külön nyelvi változatként készül, a magyar eredeti megmarad.</p>';
  }

  function toolbar() {
    var cv = B.cv, dd = B.ui.dd;
    var tpl = DJP.TEMPLATES.find(function (t) { return t.id === DJP.tplId(cv.template); }) || DJP.TEMPLATES[0];
    var ln = DJP.LANGS.find(function (l) { return l.id === lang(); }) || DJP.LANGS[0];
    var sp = SPACES.find(function (s) { return s[0] === (cv.spacing || 'normal'); });
    var isLetter = B.step === 2 || B.mode === 'letter';
    function dd1(id, label, value, cls, icon) {
      var open = dd === id;
      return '<div class="djp-dd' + (open ? ' is-open' : '') + (cls ? ' ' + cls : '') + '"><button type="button" class="djp-dd-btn" data-act="dd" data-v="' + id + '" aria-expanded="' + open + '" title="' + label + '">' +
        '<span class="djp-dd-ico">' + icon + '</span><span class="djp-dd-txt"><span class="djp-dd-lbl">' + label + '</span><span class="djp-dd-val">' + value + '</span></span>' + svg('chev', 'djp-dd-chev') + '</button>' +
        (open ? '<div class="djp-dd-pop djp-dd-pop-' + id + '">' + ddPop(id) + '</div>' : '') + '</div>';
    }
    var COLOR_NAMES = { '#E1415A': 'Piros', '#1E64E1': 'Kék', '#1E2328': 'Grafit', '#0E9F6E': 'Smaragd', '#7C3AED': 'Lila', '#EA7D38': 'Narancs' };
    var colorName = COLOR_NAMES[(cv.accent || '').toUpperCase()] || (cv.accent || '').toUpperCase();
    var canDl = (B.step === 1 && cvReady()) || (isLetter && B.letterState === 'done');
    return '<div class="djp-b-toolbar"><div class="djp-tb-group">' +
      dd1('tpl', 'Sablon', esc(tpl.name.replace(/^DreamJobs /, '').replace(/ \(.*\)$/, '')), 'is-wide', svg('tpl')) +
      dd1('font', 'Betűtípus', '<span style="font-family:&quot;' + cv.font + '&quot;">' + esc(cv.font) + '</span>', '', '<b class="djp-dd-aa" style="font-family:&quot;' + cv.font + '&quot;">Aa</b>') +
      dd1('space', 'Térköz', sp[1], '', svg('spacing')) +
      dd1('color', 'Szín', esc(colorName), 'is-right is-compact', '<i class="djp-dd-dot" style="background:' + esc(cv.accent) + '"></i>') +
      (isLetter ? '' : dd1('lang', 'Nyelv', ln.short, 'is-right', ln.flag)) + '</div>' +
      (canDl ? '<button type="button" class="djp-tb-dl" data-act="download" title="' + (isLetter ? 'Motivációs levél letöltése PDF-ben' : 'Önéletrajz letöltése PDF-ben') + '">' + svg('dl') + '<span>Letöltés</span></button>' : '') + '</div>';
  }
  function previewHTML() {
    if (B.step === 2 || B.mode === 'letter') return DJP.renderLetter(B.letter || newLetter(), B.cv, { preview: true });
    var cv = B.ui.showOriginal && B.original ? B.original : B.cv;
    return DJP.renderCV(cv, { preview: true, highlight: B.ui.highlight && !B.ui.showOriginal });
  }

  var pvT;
  function schedulePreview(now) {
    clearTimeout(pvT);
    var run = function () {
      var host = root.querySelector('[data-sheet]');
      if (host) { host.innerHTML = previewHTML(); fitPreview(); markSel(); }
      var m = root.querySelector('[data-meter]');
      if (m) m.innerHTML = matchMeter();
    };
    if (now) run(); else pvT = setTimeout(run, 120);
  }

  function fitPreview() {
    var canvas = root.querySelector('.djp-b-canvas');
    var scaler = root.querySelector('[data-sheet]');
    if (!canvas || !scaler) return;
    var w = canvas.clientWidth - 48;
    var sc = Math.min(1, w / 794);
    scaler.style.transform = 'scale(' + sc + ')';
    var sheet = scaler.firstElementChild;
    var h = sheet ? sheet.offsetHeight : 1123;
    scaler.parentElement.style.height = (h * sc) + 'px';
    scaler.parentElement.style.width = (794 * sc) + 'px';
  }
  window.addEventListener('resize', fitPreview);

  /* ---------- fő render ---------- */
  var ro = null;
  function render() {
    var work;
    if (B.step === 'done') work = doneScreen();
    else if (B.step === 3) work = summary();
    else if (B.step === 1 && B.phase === 'upload') work = uploadScreen();
    else if (B.step === 1 && B.phase === 'parsing') work = parseView(0);
    else if (B.step === 1 && B.phase === 'boosting') work = progressScreen('Az AI felturbózza az önéletrajzodat', null, BOOST_STEPS, 0);
    else if (B.step === 2 && B.letterState === 'idle') work = letterIntro();
    else if (B.translating) work = progressScreen('Fordítás: ' + B.translating.name, null, TR_STEPS, B.translating.i || 0);
    else {
      var left = B.step === 2 || B.mode === 'letter' ? letterEditor() : cvEditor();
      work = '<div class="djp-b-split"><div class="djp-b-left" data-left>' + left + '</div>' +
        '<div class="djp-b-right"><div class="djp-b-canvas"><div class="djp-b-fit"><div class="djp-b-scale" data-sheet>' + previewHTML() + '</div></div></div>' + toolbar() + '</div></div>';
    }
    var leftScroll = root.querySelector('[data-left]');
    var ls = leftScroll ? leftScroll.scrollTop : 0;
    var oldCanvas = root.querySelector('.djp-b-canvas');
    var cs = oldCanvas ? oldCanvas.scrollTop : 0;
    root.innerHTML = topbar() + jobStrip() + '<div class="djp-b-work" data-work>' + work + '</div>' + wizard() + '<div class="djp-seltool" data-seltool hidden></div>';
    if (DJP.fitThumbs) DJP.fitThumbs(root);
    var rj = job();
    if (rj && (B.step === 1 || B.step === 2) && B.mode !== 'letter') {
      DJP.remind({ key: 'builder-' + rj.id, job: rj, step: B.step, ready: cvReady(), onAction: actions.finish });
    } else if (DJP.remind) DJP.remind(null);
    var stp = root.querySelector('.djp-b-top .djp-stepper');
    if (stp) root.style.setProperty('--stepw', stp.offsetWidth + 'px');
    var nl = root.querySelector('[data-left]');
    if (nl) nl.scrollTop = ls;
    fitPreview();
    var nc = root.querySelector('.djp-b-canvas');
    if (nc) nc.scrollTop = cs;
    root.querySelectorAll('.djp-tpl-thumb-in').forEach(function (el) { el.style.transform = 'scale(' + (el.parentElement.clientWidth / 794) + ')'; });
    markSel();
    if (window.ResizeObserver) {
      if (!ro) ro = new ResizeObserver(fitPreview);
      ro.disconnect();
      var cnv = root.querySelector('.djp-b-canvas');
      if (cnv) ro.observe(cnv);
    }
    persist();
  }

  /* ---------- nyelvi változatok (szimulált AI-fordítás) ---------- */
  var TR_STEPS = ['Szakaszok és címek fordítása', 'Szakmai kifejezések egységesítése', 'Formázás és ellenőrzés'];
  function runTranslate(base, v) {
    var ln = DJP.LANGS.find(function (l) { return l.id === v; });
    B.translating = { name: ln.flag + ' ' + ln.name, i: 0 };
    render();
    (function next() {
      var w = root.querySelector('[data-work]');
      if (w) w.innerHTML = progressScreen('Fordítás: ' + B.translating.name, null, TR_STEPS, B.translating.i);
      if (B.translating.i < TR_STEPS.length) { B.translating.i += 1; setTimeout(next, 650); return; }
      var res = DJP.translateCV(base, v);
      B.langs = B.langs || {};
      B.langs[v] = res.cv;
      B.cv = res.cv;
      B.translating = null;
      render();
      DJP.toast(res.missing ? 'Lefordítva: ' + ln.name + '. ' + res.missing + ' saját mondatodat érdemes átnézni.' : 'Az önéletrajz elkészült ezen a nyelven: ' + ln.name, 'ok');
    })();
  }
  function switchLang(v) {
    B.ui.dd = null;
    var cur = lang();
    if (v === cur) { render(); return; }
    B.langs = B.langs || {};
    B.langs[cur] = B.cv;
    if (B.langs[v]) {
      B.cv = B.langs[v];
      render();
      DJP.toast('Nyelvi változat: ' + DJP.LANGS.find(function (l) { return l.id === v; }).name, 'ok');
      return;
    }
    var base = B.langs.hu || B.cv;
    if (v === 'hu') { base.lang = 'hu'; B.cv = base; render(); return; }
    runTranslate(base, v);
  }

  /* ---------- kattintható előnézet: a kijelölt rész szerkesztése ---------- */
  function markSel() {
    var host = root.querySelector('[data-sheet]');
    if (!host) return;
    host.querySelectorAll('.cv-selected').forEach(function (x) { x.classList.remove('cv-selected'); });
    if (!B.ui.sel || B.step !== 1) return;
    var el = host.querySelector('[data-edit="' + B.ui.sel + '"]');
    if (!el && B.ui.sel === 'personal:firstName') el = host.querySelector('[data-edit="personal:lastName"]');
    if (!el && /^(personal|extra):/.test(B.ui.sel)) el = host.querySelector('[data-edit="personal"]');
    if (el) el.classList.add('cv-selected');
    return el;
  }
  function revealInPreview(el) {
    var c = root.querySelector('.djp-b-canvas');
    if (!el || !c) return;
    var r = el.getBoundingClientRect(), cr = c.getBoundingClientRect();
    if (r.top < cr.top + 20 || r.bottom > cr.bottom - 20) c.scrollTop += r.top - cr.top - 60;
  }
  function editPath(path) {
    if (B.step !== 1 || (B.phase !== 'ready' && B.phase !== 'questions')) return;
    var p = path.split(':'), sel = null;
    if (p[0] === 'personal' || p[0] === 'extra') {
      B.ui.open.personal = true;
      if (p[0] === 'extra') sel = '[data-f="extra:' + p[1] + '"]';
      else if (p[1] === 'photo') sel = '.djp-photo-row .djp-btn';
      else sel = '[data-f="personal:' + (p[1] || 'lastName') + '"]';
    } else if (p[0] === 'sec') {
      var s = secById(p[1]); if (!s) return;
      B.ui.open[s.id] = true;
      sel = s.type === 'text' ? '[data-f="sec:' + s.id + ':text"]' : '.djp-acc[data-acc="' + s.id + '"]';
    } else if (p[0] === 'item') {
      var s2 = secById(p[1]); if (!s2) return;
      B.ui.open[s2.id] = true;
      if (s2.type === 'entries') { B.ui.openItem[p[2]] = true; sel = '[data-f="item:' + p[1] + ':' + p[2] + ':title"]'; }
      else if (s2.type === 'tags') sel = '.djp-acc[data-acc="' + s2.id + '"]';
      else sel = '[data-f="item:' + p[1] + ':' + p[2] + ':name"]';
    }
    B.ui.sel = path;
    render();
    var el = sel && root.querySelector(sel);
    if (!el) return;
    var lp = root.querySelector('[data-left]');
    if (lp) {
      var er = el.getBoundingClientRect(), lr = lp.getBoundingClientRect();
      lp.scrollTop += er.top - lr.top - lr.height / 3;
    }
    syncLock = true;
    if (el.focus && /INPUT|TEXTAREA/.test(el.tagName)) el.focus({ preventScroll: true });
    syncLock = false;
    var box = el.closest('.djp-item') || el.closest('.djp-field') || el;
    box.classList.add('is-flash');
    setTimeout(function () { box.classList.remove('is-flash'); }, 1400);
  }
  var syncLock = false;

  /* ---------- AI műveletek a szerkesztőben ---------- */
  function busy(btn, on) {
    if (!btn) return;
    btn.disabled = on;
    btn.classList.toggle('is-busy', on);
  }

  function aiIntoField(btn, path, producer) {
    busy(btn, true);
    var ta = root.querySelector('[data-f="' + path + '"]');
    if (ta) ta.classList.add('is-ai-writing');
    return DJP.ai.wait(850).then(function () {
      var text = producer();
      return DJP.ai.typeText(function (t) {
        setField(path, t);
        if (ta) ta.value = t;
        schedulePreview(true);
      }, text, { frames: 60 });
    }).then(function () {
      if (ta) ta.classList.remove('is-ai-writing');
      busy(btn, false);
      persist();
      var m = root.querySelector('[data-meter]');
      if (m) m.innerHTML = matchMeter();
    });
  }

  function move(arr, from, to) { var x = arr.splice(from, 1)[0]; arr.splice(to, 0, x); }

  var actions = {
    toggle: function (b) { var id = b.dataset.id; B.ui.open[id] = !B.ui.open[id]; render(); },
    'toggle-item': function (b) { var id = b.dataset.id; B.ui.openItem[id] = !B.ui.openItem[id]; render(); },
    step: function (b) {
      var n = +b.dataset.n;
      if (n === 2 && !B.letter) B.letter = newLetter();
      B.step = n; B.wizard = false; render(); window.scrollTo(0, 0);
    },
    'add-extra': function (b) {
      var f = DJP.EXTRA_FIELDS.find(function (x) { return x.key === b.dataset.key; });
      B.cv.personal.extra.push({ key: f.key, label: f.label, value: '' });
      render();
      var el = root.querySelector('[data-f="extra:' + f.key + '"]'); if (el) el.focus();
    },
    'rm-extra': function (b) { B.cv.personal.extra = B.cv.personal.extra.filter(function (e) { return e.key !== b.dataset.key; }); render(); },
    'rm-photo': function () { B.cv.personal.photo = null; render(); },
    'add-sec': function (b) {
      var s = DJP.newSection(b.dataset.kind);
      if (s.items && s.type !== 'tags') s.items.push(DJP.newItem(s.type));
      if (s.items && s.type === 'entries') B.ui.openItem[s.items[0].id] = true;
      B.cv.sections.push(s); B.ui.open[s.id] = true; render();
    },
    'sec-rm': function (b) {
      var s = secById(b.dataset.sec);
      if (!confirm('Biztosan törlöd ' + DJP.art(s.title) + ' „' + s.title + '” szakaszt?')) return;
      B.cv.sections = B.cv.sections.filter(function (x) { return x !== s; }); render();
    },
    'add-item': function (b) {
      var s = secById(b.dataset.sec), it = DJP.newItem(s.type);
      s.items.push(it); if (s.type === 'entries') B.ui.openItem[it.id] = true; render();
    },
    'item-rm': function (b) { var s = secById(b.dataset.sec); s.items = s.items.filter(function (i) { return i.id !== b.dataset.id; }); render(); },
    'item-up': function (b) { var s = secById(b.dataset.sec), i = s.items.findIndex(function (x) { return x.id === b.dataset.id; }); if (i > 0) move(s.items, i, i - 1); render(); },
    'item-down': function (b) { var s = secById(b.dataset.sec), i = s.items.findIndex(function (x) { return x.id === b.dataset.id; }); if (i < s.items.length - 1) move(s.items, i, i + 1); render(); },
    'ai-profile': function (b) {
      var s = secById(b.dataset.sec);
      aiIntoField(b, 'sec:' + s.id + ':text', function () {
        var all = DJP.ai.profileForAll(B.langs && B.langs.hu && lang() !== 'hu' ? B.langs.hu : B.cv, job());
        s.i18n = { text: all };
        return all[lang()];
      }).then(render);
    },
    'ai-text': function (b) { var s = secById(b.dataset.sec); aiIntoField(b, 'sec:' + s.id + ':text', function () { return DJP.ai.rewrite(s.text, b.dataset.mode, lang()); }); },
    'ai-entry': function (b) { var it = itemById(b.dataset.sec, b.dataset.id); aiIntoField(b, 'item:' + b.dataset.sec + ':' + it.id + ':desc', function () { return DJP.ai.improveEntry(it, job(), lang()); }); },
    'ai-skills': function (b) {
      busy(b, true);
      DJP.ai.wait(700).then(function () { B.ui.suggest = b.dataset.sec; render(); });
    },
    'add-skill': function (b) {
      var s = secById(b.dataset.sec);
      var empty = s.items.find(function (i) { return !i.name; });
      if (empty) empty.name = b.dataset.name; else s.items.push({ id: DJP.uid('it'), name: b.dataset.name, level: '', detail: '' });
      render();
    },
    dd: function (b) { B.ui.dd = B.ui.dd === b.dataset.v ? null : b.dataset.v; render(); },
    'set-tpl': function (b) {
      var td = DJP.TEMPLATES.find(function (x) { return x.id === b.dataset.v; });
      B.cv.template = td.id; B.cv.accent = td.accent; B.cv.font = td.font; B.ui.dd = null; render();
    },
    'set-font': function (b) { B.cv.font = b.dataset.v; B.ui.dd = null; render(); },
    'set-space': function (b) { B.cv.spacing = b.dataset.v; B.ui.dd = null; render(); },
    'set-color': function (b) { B.cv.accent = b.dataset.v; render(); },
    'set-lang': function (b) { switchLang(b.dataset.v); },
    retranslate: function () {
      var cur = lang();
      B.ui.dd = null;
      if (cur === 'hu' || !B.langs || !B.langs.hu) return render();
      runTranslate(B.langs.hu, cur);
    },
    finish: function () { if (!B.letter) B.letter = newLetter(); B.step = 3; B.wizard = false; render(); window.scrollTo(0, 0); },
    'toggle-linkedin': function () { B.ui.linkedin = !B.ui.linkedin; render(); var i = root.querySelector('[data-li-url]'); if (i) i.focus(); },
    'import-linkedin': function () {
      var v = (root.querySelector('[data-li-url]') || {}).value || '';
      if (!/linkedin\.com\/in\//i.test(v)) { DJP.toast('Adj meg egy érvényes LinkedIn profil linket (linkedin.com/in/…)'); return; }
      if (hasCvContent() && !confirm('A jelenlegi önéletrajz tartalmát lecseréljük a LinkedIn profilod adataira. Folytatod?')) return;
      B.ui.liUrl = v; runParsing(v.replace(/^https?:\/\/(www\.)?/, ''), 'linkedin');
    },
    'cv-clear': function () {
      if (!confirm('Biztosan törlöd az önéletrajz teljes tartalmát? Utána feltölthetsz egy újat, vagy elölről kezdheted.')) return;
      var keep = { template: B.cv.template, accent: B.cv.accent, font: B.cv.font, spacing: B.cv.spacing };
      B.cv = Object.assign(DJP.blankCV(S.user()), keep);
      B.original = null; B.changes = []; B.matchBefore = null; B.answers = {}; B.parsedNotice = false; B.langs = null;
      B.ui.open = { personal: true };
      if (B.mode === 'boost') B.phase = 'upload';
      render();
      DJP.toast('Önéletrajz törölve – tölts fel egy újat, vagy kezdd el kitölteni');
    },
    'rm-saved': function (b) {
      var d = S.getDoc(b.dataset.id);
      if (!d || !confirm('Biztosan törlöd: „' + d.title + '”?')) return;
      S.deleteDoc(d.id); render(); DJP.toast('Önéletrajz törölve');
    },
    'start-boost': function () {
      B.mode = 'boost'; B.category = 'boosted'; B.phase = 'questions'; B.parsedNotice = false;
      B.qIndex = 0; B.wizard = true; render();
    },
    'hide-notice': function () { B.parsedNotice = false; render(); },
    'add-tag': function (b) { secById(b.dataset.sec).items.push({ id: DJP.uid('it'), name: b.dataset.name }); render(); },
    'ai-accept': function (b) { var s = secById(b.dataset.sec); delete s.ai; delete s.isNew; render(); },
    'ai-revert': function (b) {
      var s = secById(b.dataset.sec);
      var idx = B.cv.sections.indexOf(s);
      var orig = B.original && B.original.sections.find(function (x) { return x.id === s.id; });
      if (s.isNew || !orig) B.cv.sections.splice(idx, 1); else B.cv.sections[idx] = DJP.clone(orig);
      B.changes = B.changes.filter(function (c) { return c.sectionId !== s.id; });
      render();
    },
    'show-orig': function (b) { B.ui.showOriginal = b.dataset.v === '1'; render(); },
    'redo-questions': function () { B.qIndex = 0; B.wizard = true; render(); },
    'open-wizard': function () { B.qIndex = 0; B.wizard = true; render(); },
    'close-wizard': function () { B.wizard = false; render(); },
    'q-chip': function (b) {
      var q = DJP.boostQuestions(job() || DJP.jobs.startuphub)[B.qIndex];
      var a = B.answers[q.id];
      var i = a.chips.indexOf(b.dataset.v);
      if (i >= 0) a.chips.splice(i, 1); else a.chips.push(b.dataset.v);
      render();
    },
    'q-prev': function () { B.qIndex = Math.max(0, B.qIndex - 1); render(); },
    'q-next': function () { B.qIndex += 1; render(); },
    'q-skip': function () {
      var qs = DJP.boostQuestions(job() || DJP.jobs.startuphub);
      B.answers[qs[B.qIndex].id] = { chips: [], text: '' };
      if (B.qIndex < qs.length - 1) { B.qIndex += 1; render(); } else runBoost();
    },
    'q-finish': function () { runBoost(); },
    'boost-saved': function (b) { var d = S.getDoc(b.dataset.id); runParsing(d ? d.title : 'önéletrajz.pdf'); },
    'set-tone': function (b) { B.tone = b.dataset.v; render(); },
    'set-length': function (b) { B.length = b.dataset.v; render(); },
    'gen-letter': function () { genLetter(); },
    'skip-letter': function () { B.letter = null; B.letterState = 'idle'; B.step = 3; render(); },
    accent: function (b) { B.cv.accent = b.dataset.v; render(); },
    download: function () {
      if (B.step === 2 || B.mode === 'letter') DJP.downloadPDF(DJP.renderLetter(B.letter, B.cv), B.letterTitle || 'Motivációs levél');
      else DJP.downloadPDF(DJP.renderCV(B.ui.showOriginal && B.original ? B.original : B.cv), B.title);
    },
    'save-apply': function () { save(true); },
    'save-only': function () { save(false); },
    'save-letter-only': function () {
      var l = S.saveDoc({ id: B.letterDocId || undefined, type: 'letter', category: 'ai-letter', title: B.letterTitle || 'Motivációs levél', jobId: B.jobId,
        data: { letter: DJP.clone(B.letter), cv: { personal: DJP.clone(B.cv.personal), template: B.cv.template, accent: B.cv.accent, font: B.cv.font } } });
      B.letterDocId = l.id; S.clearDraft();
      DJP.toast('Levél mentve a Motivációs leveleim közé', 'ok');
    }
  };

  /* ---------- események (delegálás) ---------- */
  root.addEventListener('click', function (e) {
    var sh = e.target.closest && e.target.closest('[data-sheet]');
    if (sh && B.step === 1 && B.mode !== 'letter') {
      var ed = e.target.closest('[data-edit]');
      if (ed) { e.preventDefault(); editPath(ed.getAttribute('data-edit')); return; }
    }
    var b = e.target.closest('[data-act]');
    if (b && root.contains(b) && !b.disabled && actions[b.dataset.act]) {
      e.preventDefault();
      actions[b.dataset.act](b);
    }
  });

  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-q-text')) {
      var q = DJP.boostQuestions(job() || DJP.jobs.startuphub)[B.qIndex];
      B.answers[q.id].text = t.value; persist(); return;
    }
    var f = t.getAttribute('data-f');
    if (!f || t.tagName === 'SELECT') return;
    setField(f, t.value);
    var m = f.match(/^item:[^:]+:([^:]+):title$/);
    if (m) { var h = root.querySelector('[data-ihead="' + m[1] + '"]'); if (h) h.textContent = t.value || '(Nincs megadva)'; }
    schedulePreview();
    persist();
  });

  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.tagName === 'SELECT' && t.getAttribute('data-f')) {
      setField(t.getAttribute('data-f'), t.value);
      if (t.getAttribute('data-f') === 'job') { jobId = t.value || null; }
      if (t.getAttribute('data-f') === 'cv:template') {
        var td = DJP.TEMPLATES.find(function (x) { return x.id === t.value; });
        if (td) { B.cv.accent = td.accent; B.cv.font = td.font; }
      }
      if (/^(cv:|job)/.test(t.getAttribute('data-f'))) render(); else { schedulePreview(); persist(); }
    }
    if (t.hasAttribute('data-color')) { B.cv.accent = t.value; render(); return; }
    var chk = t.getAttribute('data-act-check');
    if (chk === 'highlight') { B.ui.highlight = t.checked; render(); }
    if (chk === 'consent') { B.consent = t.checked; render(); }
    if (t.hasAttribute('data-photo') && t.files[0]) {
      var r = new FileReader();
      r.onload = function () { B.cv.personal.photo = r.result; render(); };
      r.readAsDataURL(t.files[0]);
    }
    if (t.hasAttribute('data-boost-file') && t.files[0]) runParsing(t.files[0].name);
    if (t.hasAttribute('data-import-file') && t.files[0]) {
      if (hasCvContent() && !confirm('A jelenlegi önéletrajz tartalmát lecseréljük a feltöltött fájl adataira. Folytatod?')) { t.value = ''; return; }
      runParsing(t.files[0].name, 'upload');
    }
  });

  root.addEventListener('focusin', function (e) {
    var f = e.target.getAttribute && e.target.getAttribute('data-f');
    if (!f || syncLock || B.step !== 1) return;
    var p = f.split(':');
    var sel = p[0] === 'personal' || p[0] === 'extra' ? f : p[0] === 'sec' ? 'sec:' + p[1] : p[0] === 'item' ? 'item:' + p[1] + ':' + p[2] : null;
    if (!sel || sel === B.ui.sel) return;
    B.ui.sel = sel;
    revealInPreview(markSel());
  });
  var hoverEl = null;
  root.addEventListener('mouseover', function (e) {
    var sh = e.target.closest && e.target.closest('[data-sheet]');
    var ed = sh && B.step === 1 && B.mode !== 'letter' ? e.target.closest('[data-edit]') : null;
    if (ed === hoverEl) return;
    if (hoverEl) hoverEl.classList.remove('cv-hover');
    hoverEl = ed;
    if (ed) ed.classList.add('cv-hover');
  });
  document.addEventListener('click', function (e) {
    if (!e.target.isConnected) return; /* a kattintott elem már újrarajzolódott */
    if (B.ui.dd && !(e.target.closest && e.target.closest('.djp-dd'))) { B.ui.dd = null; render(); }
  });

  /* címke hozzáadása Enterrel */
  root.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key === 'Enter' && t.hasAttribute && t.hasAttribute('data-tag-input') && t.value.trim()) {
      e.preventDefault();
      secById(t.getAttribute('data-tag-input')).items.push({ id: DJP.uid('it'), name: t.value.trim() });
      render();
      var again = root.querySelector('[data-tag-input]');
      if (again) again.focus();
    }
  });

  /* fájl ráhúzása a feltöltő mezőre */
  root.addEventListener('dragover', function (e) { var d = e.target.closest('[data-drop]'); if (d) { e.preventDefault(); d.classList.add('is-over'); } });
  root.addEventListener('dragleave', function (e) { var d = e.target.closest('[data-drop]'); if (d) d.classList.remove('is-over'); });
  root.addEventListener('drop', function (e) {
    var d = e.target.closest('[data-drop]');
    if (d && e.dataTransfer.files[0]) { e.preventDefault(); runParsing(e.dataTransfer.files[0].name, 'upload'); }
  });

  /* szakaszok átrendezése húzással */
  var dragId = null;
  root.addEventListener('dragstart', function (e) {
    var h = e.target.closest && e.target.closest('[data-drag]');
    if (h) { dragId = h.dataset.drag; e.dataTransfer.effectAllowed = 'move'; h.parentElement.classList.add('is-dragging'); }
  });
  root.addEventListener('dragover', function (e) {
    if (!dragId) return;
    var over = e.target.closest('.djp-acc[data-acc]');
    if (over && over.dataset.acc !== dragId && secById(over.dataset.acc)) {
      e.preventDefault();
      root.querySelectorAll('.is-drop-target').forEach(function (x) { x.classList.remove('is-drop-target'); });
      over.classList.add('is-drop-target');
    }
  });
  root.addEventListener('drop', function (e) {
    if (!dragId) return;
    var over = e.target.closest('.djp-acc[data-acc]');
    if (over && secById(over.dataset.acc)) {
      e.preventDefault();
      var arr = B.cv.sections;
      var from = arr.indexOf(secById(dragId)), to = arr.indexOf(secById(over.dataset.acc));
      move(arr, from, to);
    }
    dragId = null; render();
  });
  root.addEventListener('dragend', function () { if (dragId) { dragId = null; render(); } });

  /* ---------- kijelölés → AI-eszköztár ---------- */
  var sel = null;
  function hideTool() { var t = root.querySelector('[data-seltool]'); if (t) t.hidden = true; sel = null; }
  root.addEventListener('mouseup', function (e) {
    var ta = e.target.closest && e.target.closest('textarea[data-f]');
    if (!ta || ta.readOnly) { if (!e.target.closest('[data-seltool]')) hideTool(); return; }
    setTimeout(function () {
      var a = ta.selectionStart, z = ta.selectionEnd;
      if (z - a < 4) return hideTool();
      sel = { path: ta.getAttribute('data-f'), a: a, z: z };
      var tool = root.querySelector('[data-seltool]');
      tool.innerHTML = '<span>' + svg('spark') + ' AI</span>' +
        [['rephrase', 'Átfogalmaz'], ['shorter', 'Rövidebb'], ['longer', 'Bővebb'], ['formal', 'Professzionálisabb']].map(function (m) {
          return '<button type="button" data-sel="' + m[0] + '">' + m[1] + '</button>';
        }).join('');
      tool.hidden = false;
      tool.style.left = Math.min(window.innerWidth - 380, e.clientX - 20) + 'px';
      tool.style.top = (e.clientY - 52) + 'px';
    }, 0);
  });
  root.addEventListener('mousedown', function (e) {
    var b = e.target.closest('[data-sel]');
    if (!b || !sel) return;
    e.preventDefault();
    var s = sel, mode = b.dataset.sel;
    var ta = root.querySelector('[data-f="' + s.path + '"]');
    var full = ta.value, part = full.slice(s.a, s.z);
    b.classList.add('is-busy');
    DJP.ai.wait(650).then(function () {
      var rep = DJP.ai.rewrite(part, mode, lang());
      var v = full.slice(0, s.a) + rep + full.slice(s.z);
      ta.value = v; setField(s.path, v);
      ta.focus(); ta.setSelectionRange(s.a, s.a + rep.length);
      ta.classList.add('is-ai-flash'); setTimeout(function () { ta.classList.remove('is-ai-flash'); }, 900);
      hideTool(); schedulePreview(true); persist();
    });
  });

  /* ---------- indítás ---------- */
  render();
  if (B.phase === 'parsing') runParsing(B.srcDoc ? (S.getDoc(B.srcDoc) || {}).title : B.fileName);
})(window.DJP);

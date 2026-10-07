/* DreamJobs prototípus – Önéletrajzaim / Motivációs leveleim / Jelentkezéseim oldalak (kategorizálva). */
(function (DJP) {
  var esc = DJP.esc;
  var S = DJP.store;
  var root = document.getElementById('djp-docs');

  var ICON = {
    file: '<path fill=currentColor d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5zM8 12h8v2H8zm0 4h8v2H8z"/>',
    edit: '<path fill=currentColor d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"/>',
    dl: '<path fill=currentColor d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z"/>',
    upload: '<path fill=currentColor d="M5 20h14v-2H5zm0-10h4v6h6v-6h4l-7-7z"/>',
    copy: '<path fill=currentColor d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"/>',
    trash: '<path fill=currentColor d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>',
    spark: '<path fill=currentColor d="m19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4L6.5 9.5L1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"/>',
    plus: '<path fill=currentColor d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>',
    link: '<path fill=currentColor d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5"/>',
    letter: '<path fill=currentColor d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/>',
    check: '<path fill=currentColor d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"/>'
  };
  function svg(n) { return '<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }

  var CATS = {
    cv: [['all', 'Mind'], ['uploaded', 'Feltöltött'], ['generated', 'Generátorral készült'], ['boosted', 'AI-val felturbózott']],
    letter: [['all', 'Mind'], ['ai-letter', 'AI-val generált']]
  };
  var CAT_LABEL = { uploaded: 'Feltöltött', generated: 'Generátorral készült', boosted: 'AI-val felturbózott', 'ai-letter': 'AI motivációs levél' };

  var PAGE = document.body.getAttribute('data-djp-page');
  var ui = { tab: PAGE === 'apps' ? 'apps' : PAGE === 'letters' ? 'letter' : 'cv', cat: 'all', q: '' };
  var HERO = {
    cv: { title: 'Önéletrajzaim', text: 'A feltöltött, a CV-generátorral készült és az AI-val felturbózott önéletrajzaid egy helyen. Bármikor szerkesztheted, letöltheted vagy törölheted őket.' },
    letter: { title: 'Motivációs leveleim', text: 'Az állásokra szabott motivációs leveleid. Az AI a CV-dből és a hirdetésből írja meg őket, te pedig szabadon szerkesztheted.' },
    apps: { title: 'Jelentkezéseim', text: 'Az elküldött jelentkezéseid és a hozzájuk csatolt önéletrajzok, motivációs levelek.' }
  };

  function jobLine(d) {
    var j = d.jobId && DJP.jobs[d.jobId];
    return j ? '<span class="djp-doc-job">' + svg('link') + esc(j.title) + ' · ' + esc(j.company) + '</span>' : '';
  }

  function thumbFor(d) {
    if (d.type === 'cv' && d.data) return '<div class="djp-thumb"><div class="djp-thumb-in">' + DJP.renderCV(d.data) + '</div></div>';
    if (d.type === 'letter' && d.data) return '<div class="djp-thumb"><div class="djp-thumb-in">' + DJP.renderLetter(d.data.letter, d.data.cv) + '</div></div>';
    return '<div class="djp-thumb is-file">' + svg('file') + '<span>' + esc((d.fileName || '').split('.').pop().toUpperCase() || 'PDF') + '</span></div>';
  }

  function card(d) {
    var isUpload = d.category === 'uploaded';
    var open = isUpload ? '' : (d.type === 'cv' ? 'cv-generator.html?mode=edit&doc=' + d.id : 'cv-generator.html?mode=letter&letter=' + d.id);
    return '<article class="djp-doc">' +
      (open ? '<a class="djp-doc-thumb" href="' + open + '" title="Megnyitás">' + thumbFor(d) + '</a>' : '<div class="djp-doc-thumb">' + thumbFor(d) + '</div>') +
      '<div class="djp-doc-body"><span class="djp-badge is-' + d.category + '">' + (d.category === 'boosted' ? svg('spark') : '') + CAT_LABEL[d.category] + '</span>' +
      (d.data && d.data.lang && d.data.lang !== 'hu' ? '<span class="djp-badge is-lang">' + d.data.lang.toUpperCase() + '</span>' : '') +
      '<b>' + esc(d.title) + '</b><em>Módosítva: ' + DJP.fmtDate(d.updatedAt) + '</em>' + jobLine(d) + '</div>' +
      '<div class="djp-doc-actions">' +
      (isUpload
        ? '<a class="djp-btn-ai djp-btn-sm" href="cv-generator.html?mode=boost&src=' + d.id + '&job=startuphub">' + svg('spark') + ' Felturbózás AI-val</a>'
        : '<a class="djp-btn djp-btn-outline djp-btn-sm" href="' + open + '">' + svg('edit') + ' Szerkesztés</a>') +
      '<button type="button" class="djp-icon-btn" data-act="dl" data-id="' + d.id + '" title="Letöltés PDF" aria-label="Letöltés">' + svg('dl') + '</button>' +
      (isUpload ? '' : '<button type="button" class="djp-icon-btn" data-act="dup" data-id="' + d.id + '" title="Duplikálás" aria-label="Duplikálás">' + svg('copy') + '</button>') +
      '<button type="button" class="djp-icon-btn" data-act="rm" data-id="' + d.id + '" title="Törlés" aria-label="Törlés">' + svg('trash') + '</button></div></article>';
  }

  function newCard(type) {
    return type === 'cv'
      ? '<a class="djp-doc djp-doc-new" href="cv-generator.html"><span>' + svg('plus') + '</span><b>Új önéletrajz</b><em>Készítsd el a CV-generátorral</em></a>'
      : '<a class="djp-doc djp-doc-new" href="cv-generator.html?mode=letter&job=startuphub"><span>' + svg('letter') + '</span><b>Új motivációs levél</b><em>Egy állásra szabva, AI-val</em></a>';
  }

  function appsList() {
    var apps = S.get().applications;
    if (!apps.length) {
      return '<div class="djp-empty">' + svg('file') + '<b>Még nincs jelentkezésed</b><span>Nézz körül az állások között, és jelentkezz egy kattintással.</span><a class="djp-btn djp-btn-red" href="allas.html">Állások böngészése</a></div>';
    }
    return '<div class="djp-apps">' + apps.map(function (a) {
      var j = DJP.jobs[a.jobId] || {};
      var docs = [a.cvId && S.getDoc(a.cvId), a.letterId && S.getDoc(a.letterId)].filter(Boolean);
      return '<div class="djp-app"><img src="' + (j.logo || '') + '" alt=""><div class="djp-app-main"><b>' + esc(j.title) + '</b><span>' + esc(j.company) + ' · ' + esc(j.city) + '</span>' +
        '<div class="djp-app-docs">' + (docs.length ? docs.map(function (d) { return '<button type="button" data-act="dl" data-id="' + d.id + '">' + svg(d.type === 'cv' ? 'file' : 'letter') + esc(d.title) + '</button>'; }).join('') :
          [a.cvTitle, a.letterTitle].filter(Boolean).map(function (t) { return '<span>' + svg('file') + esc(t) + '</span>'; }).join('')) + '</div></div>' +
        '<div class="djp-app-side"><span class="djp-status">' + svg('check') + esc(a.status) + '</span><em>' + DJP.fmtDate(a.date) + '</em><a href="allas.html" class="djp-link">Állás megtekintése</a></div></div>';
    }).join('') + '</div>';
  }

  function render() {
    var st = S.get();
    var cvs = S.documents('cv'), letters = S.documents('letter');
    var body;
    if (ui.tab === 'apps') body = appsList();
    else {
      var list = (ui.tab === 'cv' ? cvs : letters).filter(function (d) {
        return (ui.cat === 'all' || d.category === ui.cat) && (!ui.q || d.title.toLowerCase().indexOf(ui.q.toLowerCase()) >= 0);
      });
      body = '<div class="djp-docs-filter"><div class="djp-chips">' + CATS[ui.tab].map(function (c) {
        var n = (ui.tab === 'cv' ? cvs : letters).filter(function (d) { return c[0] === 'all' || d.category === c[0]; }).length;
        return '<button type="button" class="djp-chip' + (ui.cat === c[0] ? ' is-on' : '') + '" data-act="cat" data-v="' + c[0] + '">' + c[1] + ' <i>' + n + '</i></button>';
      }).join('') + '</div><input class="djp-search" type="search" placeholder="Keresés a dokumentumok között…" value="' + esc(ui.q) + '" data-search></div>' +
        '<div class="djp-doc-grid">' + newCard(ui.tab) + list.map(card).join('') + '</div>' +
        (list.length ? '' : '<p class="djp-muted djp-noresult">Nincs találat ebben a kategóriában.</p>');
    }
    var h = HERO[ui.tab];
    var cta = ui.tab === 'cv'
      /* egy fő (piros) gomb, a többi másodlagos – ne legyen több vörös gomb egymás mellett */
      ? '<label class="djp-btn djp-btn-plain">' + svg('upload') + ' Meglévő CV feltöltése<input type="file" accept=".pdf,.doc,.docx,.rtf,.txt" data-upload hidden></label>' +
        '<a class="djp-btn djp-btn-outline djp-btn-ai-outline" href="cv-generator.html?mode=boost&job=startuphub">' + svg('spark') + ' Felturbózás AI-val</a>' +
        '<a class="djp-btn djp-btn-red" href="cv-generator.html">' + svg('plus') + ' Új önéletrajz</a>'
      : ui.tab === 'letter'
        ? '<a class="djp-btn-ai" href="cv-generator.html?mode=letter&job=startuphub">' + svg('spark') + ' Új motivációs levél AI-val</a>'
        : '<a class="djp-btn djp-btn-red" href="allas.html">Állások böngészése</a>';
    root.innerHTML = '<section class="djp-hero"><div class="container djp-docs-wrap"><div class="djp-hero-in">' +
      '<div><span class="djp-hero-kicker">' + svg('spark') + ' Önéletrajz és levelek</span><h1>' + h.title + '</h1><p>' + h.text + '</p></div>' +
      '<div class="djp-docs-cta">' + cta + '</div></div>' +
      '<nav class="djp-subnav">' + [['cv', 'oneletrajzaim.html', 'Önéletrajzaim', cvs.length], ['letter', 'motivacios-leveleim.html', 'Motivációs leveleim', letters.length], ['apps', 'jelentkezeseim.html', 'Jelentkezéseim', st.applications.length]].map(function (t) {
        return '<a href="' + t[1] + '" class="' + (ui.tab === t[0] ? 'is-on' : '') + '">' + t[2] + ' <i>' + t[3] + '</i></a>';
      }).join('') + '</nav></div></section>' +
      '<div class="container djp-docs-wrap djp-docs-body">' + body + '</div>';
    DJP.fitThumbs(root);
    var s = root.querySelector('[data-search]');
    if (s && ui.focusSearch) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
  }

  function download(d) {
    if (d.category === 'uploaded') {
      if (!d.fileUrl) return DJP.toast('A demóban a feltöltött fájl tartalma nem került eltárolásra.');
      var a = document.createElement('a');
      a.href = d.fileUrl; a.download = d.fileName || d.title;
      document.body.appendChild(a); a.click(); a.remove();
      return;
    }
    if (d.type === 'cv') DJP.downloadPDF(DJP.renderCV(d.data), d.title);
    else DJP.downloadPDF(DJP.renderLetter(d.data.letter, d.data.cv), d.title);
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.dataset.act, d = b.dataset.id && S.getDoc(b.dataset.id);
    if (act === 'cat') ui.cat = b.dataset.v;
    if (act === 'dl' && d) return download(d);
    if (act === 'dup' && d) {
      var c = DJP.clone(d); delete c.id; c.title = d.title + ' (másolat)';
      S.saveDoc(c); DJP.toast('Duplikálva', 'ok');
    }
    if (act === 'rm' && d) {
      if (!confirm('Biztosan törlöd: „' + d.title + '”?')) return;
      S.deleteDoc(d.id); DJP.toast('Törölve');
    }
    ui.focusSearch = false;
    render();
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.hasAttribute('data-upload') || !t.files[0]) return;
    var f = t.files[0];
    var save = function (url) {
      var doc = S.saveDoc({ type: 'cv', category: 'uploaded', title: f.name, fileName: f.name, fileUrl: url, jobId: null });
      /* kiolvasás a háttérben – a felturbózás és a levélírás ebből dolgozik */
      if (doc && DJP.parseCVFile) DJP.parseCVFile(f, { user: S.user() }).then(function (r) { var d = S.getDoc(doc.id); if (d) { d.parsed = r.cv; S.saveDoc(d); } }, function () {});
      DJP.toast('Feltöltve: ' + f.name + ' – most már felturbózhatod AI-val', 'ok');
      ui.cat = 'all'; render();
    };
    if (f.size < 1500000) { var r = new FileReader(); r.onload = function () { save(r.result); }; r.readAsDataURL(f); } else save(null);
  });
  root.addEventListener('input', function (e) {
    if (e.target.hasAttribute('data-search')) { ui.q = e.target.value; ui.focusSearch = true; render(); }
  });

  window.addEventListener('resize', function () { DJP.fitThumbs(root); });
  render();
})(window.DJP);

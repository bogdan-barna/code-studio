/* DreamJobs prototípus – állásoldali jelentkezési modal (regisztráció/belépés → CV-opciók → AI motivációs levél → jelentkezés). */
(function (DJP) {
  var esc = DJP.esc;
  var job = DJP.jobs.startuphub;
  var root = document.getElementById('djp-modal-root');

  var ICON = {
    close: '<path fill=currentColor d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>',
    file: '<path fill=currentColor d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5zM8 12h8v2H8zm0 4h8v2H8z"/>',
    edit: '<path fill=currentColor d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"/>',
    spark: '<path fill=currentColor d="m19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4L6.5 9.5L1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"/>',
    upload: '<path fill=currentColor d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M14 13v4h-4v-4H7l5-5l5 5z"/>',
    linkedin: '<path fill=currentColor d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"/>',
    check: '<path fill=currentColor d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"/>',
    arrow: '<path fill=currentColor d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
    eye: '<path fill=currentColor d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-8a3 3 0 1 0 0 6a3 3 0 0 0 0-6"/>',
    trash: '<path fill=currentColor d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>'
  };
  function svg(name, cls) {
    return '<svg class="' + (cls || '') + '" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">' + ICON[name] + '</svg>';
  }

  var CHECKBOX = 'bg-white content-box shrink-0 flex items-center justify-center material-icons-outlined appearance-none cursor-pointer border border-dj-gray-light hover:border-dj-gray checked:after:content-[\'done\'] checked:bg-dj-blue checked:border-0 checked:after:text-base checked:after:text-white w-8 h-8 rounded-normal';
  var SWITCH = 'switch appearance-none w-dj-60 h-dj-30 relative rounded-big bg-dj-gray-light opacity-50 transition-opacity cursor-pointer hover:opacity-100 after:transition-transform after:absolute after:top-[3px] after:left-[3px] after:w-dj-24 after:h-dj-24 after:bg-white after:rounded-full checked:after:translate-x-dj-30 checked:bg-dj-blue checked:opacity-100 checked:hover:bg-dj-blue-hover';
  var BTN = 'flex justify-center items-center px-5 rounded-normal disabled:pointer-events-none disabled:bg-dj-gray/20 disabled:text-dj-gray disabled:border-none transition-colors min-h-50 text-sm w-full';
  var BTN_RED = BTN + ' bg-dj-red text-white hover:bg-dj-red-dark active:bg-dj-red-dark';
  var BTN_BLUE = BTN + ' bg-dj-blue text-white hover:bg-dj-blue-dark active:bg-dj-blue-dark';

  /* modal állapot */
  var st = null;
  function fresh(opts) {
    return {
      view: DJP.store.user().loggedIn ? 'apply' : (opts.auth || 'register'),
      standalone: !!opts.standalone,
      option: opts.opt || null,         // 'existing' | 'new' | 'boost'
      upload: null,                     // {name, size, dataUrl}
      cvId: null,                       // választott mentett CV
      letter: '', letterState: 'idle',  // idle | loading | done
      tone: 'formal',
      saveLetter: true,
      consent: false, notify: true, linkedin: false, useCv: true
    };
  }

  var huDate = DJP.huDate;

  /* ---------- nézetek ---------- */
  function field(label, name, type, value, ph) {
    return '<div class="flex flex-col mb-2" style="width:100%"><label class="bg-white flex flex-col border rounded-normal border-dj-gray-light cursor-text hover:border-dj-gray focus-within:border-dj-blue px-dj-30 py-4">' +
      '<span class="font-medium text-sm mb-1">' + label + '</span><input name="' + name + '" type="' + type + '" placeholder="' + esc(ph) + '" class="outline-none flex-1" value="' + esc(value || '') + '"></label></div>';
  }

  function authView() {
    var login = st.view === 'login';
    function f(label, name, type, ph, ac) {
      return '<label class="djp-af"><span>' + label + '</span><input name="' + name + '" type="' + type + '" placeholder="' + esc(ph) + '" autocomplete="' + ac + '"></label>';
    }
    var pw = '<label class="djp-af"><span>Jelszó' + (login ? '<a href="#" class="djp-af-forgot">Elfelejtett jelszó?</a>' : '') + '</span><div class="djp-af-pw">' +
      '<input name="password" type="password" placeholder="' + (login ? 'A jelszavad' : 'Legalább 8 karakter') + '" autocomplete="' + (login ? 'current-password' : 'new-password') + '">' +
      '<button type="button" data-pw-toggle aria-label="Jelszó megjelenítése">' + svg('eye') + '</button></div></label>';
    var head = st.standalone ? '' :
      '<div class="djp-auth-job"><img src="' + job.logo + '" alt=""><div><span>Jelentkezés erre az állásra</span><b>' + esc(job.title) + '</b><em>' + esc(job.company + ' · ' + job.city) + '</em></div></div>' +
      '<ol class="djp-auth-steps"><li class="is-now"><span>1</span>Fiók</li><li><span>2</span>Jelentkezés</li></ol>';
    var tabs = '<div class="djp-seg djp-auth-tabs" role="tablist"><button type="button" data-switch="register" class="' + (login ? '' : 'is-on') + '">Regisztráció</button><button type="button" data-switch="login" class="' + (login ? 'is-on' : '') + '">Belépés</button></div>';
    var form = login
      ? '<form class="djp-auth" data-auth="login"><p class="djp-auth-intro">Lépj be a DreamJobs fiókodba, és folytasd a jelentkezést.</p>' +
        f('E-mail cím', 'email', 'email', 'nev@email.com', 'email') + pw +
        '<button type="submit" class="djp-btn djp-btn-red djp-auth-submit">Belépés és folytatás ' + svg('arrow') + '</button>' +
        '<p class="djp-auth-alt">Még nincs fiókod? <a href="#" data-switch="register">Regisztrálj egy perc alatt</a></p></form>'
      : '<form class="djp-auth" data-auth="register"><p class="djp-auth-intro">Hozz létre egy ingyenes DreamJobs fiókot – az adataidat a jelentkezésnél és a CV-generátorban is használjuk.</p>' +
        '<div class="djp-auth-grid">' + f('Vezetéknév', 'lastName', 'text', 'pl. Bogdán', 'family-name') + f('Keresztnév', 'firstName', 'text', 'pl. Barna', 'given-name') + '</div>' +
        f('E-mail cím', 'email', 'email', 'nev@email.com', 'email') + pw +
        '<label class="djp-auth-terms"><input type="checkbox" name="terms" checked><span>Elfogadom a <a href="#">felhasználási feltételeket</a> és az <a href="#">adatvédelmi irányelveket</a>.</span></label>' +
        '<button type="submit" class="djp-btn djp-btn-red djp-auth-submit">Regisztrálok és folytatom ' + svg('arrow') + '</button>' +
        '<p class="djp-auth-alt">Már van DreamJobs fiókod? <a href="#" data-switch="login">Lépj be</a></p></form>';
    return '<div class="djp-auth-wrap">' + head + tabs + form + '</div>';
  }

  function companyCard() {
    return '<div class="p-dj-20 w-full bg-dj-blue/5 rounded-big"><div class="flex"><div class="w-dj-80 h-dj-80 overflow-hidden rounded-normal"><img src="' + job.logo + '" alt="" style="width:80px;height:80px;object-fit:cover"></div>' +
      '<div class="ml-5 flex flex-col justify-center"><span class="text-sm text-dj-gray">' + esc(job.company) + '</span><span class="md:text-xl font-medium">' + esc(job.title) + '</span></div></div></div>';
  }

  function personalBox() {
    var u = DJP.store.user();
    function row(l, v, last) {
      return '<div class="flex flex-col"><div class="flex items-center"><span class="text-xs text-dj-gray">' + l + '</span><span class="ml-auto font-medium text-sm">' + esc(v) + '</span></div>' + (last ? '' : '<div class="h-[1px] w-full bg-dj-gray-light my-5"></div>') + '</div>';
    }
    return '<div class="w-full mt-8"><div class="flex items-center text-dj-gray"><span class="md:text-xl font-medium text-dj-black">Az alábbi adatokkal jelentkezel</span></div>' +
      '<div class="border border-dj-gray-light rounded-big px-dj-40 py-dj-30 mt-5 djp-personal">' +
      row('Név', u.lastName + ' ' + u.firstName) + row('Email cím', u.email) + row('Telefonszám', u.phone || 'Nincs megadva', true) + '</div></div>';
  }

  function optionCard(id, icon, title, desc, badge) {
    var on = st.option === id;
    return '<label class="djp-opt' + (on ? ' is-on' : '') + '"><input type="radio" name="cvopt" value="' + id + '"' + (on ? ' checked' : '') + '>' +
      '<span class="djp-opt-ico">' + svg(icon) + '</span><span class="djp-opt-txt"><b>' + title + (badge ? ' <i class="djp-ai-badge">' + svg('spark') + 'AI</i>' : '') + '</b><span>' + desc + '</span></span>' +
      '<span class="djp-radio"></span></label>';
  }

  function savedCvList() {
    var docs = DJP.store.documents('cv');
    if (!docs.length) return '';
    var cat = { uploaded: 'Feltöltött', generated: 'Generátorral készült', boosted: 'AI-val felturbózott' };
    return '<div class="djp-saved"><div class="djp-saved-title">vagy válassz a mentett önéletrajzaid közül</div>' +
      docs.map(function (d) {
        var on = st.cvId === d.id && !st.upload;
        return '<label class="djp-saved-row' + (on ? ' is-on' : '') + '"><input type="radio" name="savedcv" value="' + d.id + '"' + (on ? ' checked' : '') + '>' +
          svg('file', 'djp-saved-ico') + '<span><b>' + esc(d.title) + '</b><em>' + cat[d.category] + ' · ' + DJP.fmtDate(d.updatedAt) + '</em></span>' +
          '<button type="button" class="djp-icon-btn djp-saved-rm" data-rm-cv="' + d.id + '" title="CV törlése" aria-label="CV törlése">' + svg('trash') + '</button></label>';
      }).join('') + '</div>';
  }

  function letterBlock() {
    var hasCv = !!(st.upload || st.cvId);
    var body;
    if (st.letterState === 'idle') {
      body = '<button type="button" data-act="gen-letter" class="djp-btn-ai"' + (hasCv ? '' : ' disabled') + '>' + svg('spark') + ' Motivációs levél generálása a CV-mből</button>' +
        (hasCv ? '' : '<div class="djp-hint">Előbb töltsd fel vagy válaszd ki az önéletrajzodat.</div>');
    } else if (st.letterState === 'loading') {
      body = '<div class="djp-ai-loading"><span class="djp-spinner"></span><span data-ai-step>Önéletrajz kiolvasása…</span></div><textarea class="djp-textarea" rows="12" data-letter readonly>' + esc(st.letter) + '</textarea>';
    } else {
      body = '<textarea class="djp-textarea" rows="14" data-letter>' + esc(st.letter) + '</textarea>' +
        '<div class="djp-letter-tools"><select data-tone class="djp-select">' +
        [['formal', 'Formális'], ['friendly', 'Barátságos'], ['enthusiastic', 'Lelkes']].map(function (t) {
          return '<option value="' + t[0] + '"' + (st.tone === t[0] ? ' selected' : '') + '>Hangnem: ' + t[1] + '</option>';
        }).join('') + '</select><button type="button" data-act="regen" class="djp-btn-ghost">' + svg('spark') + ' Újragenerálás</button>' +
        '<label class="djp-check"><input type="checkbox" data-save-letter' + (st.saveLetter ? ' checked' : '') + '> Mentés a Motivációs leveleim közé</label></div>';
    }
    return '<div class="djp-letterbox"><div class="djp-letterbox-head"><span class="font-medium">Motivációs levél</span><span class="djp-tag">Ajánlott</span></div>' +
      '<div class="djp-stat">' + svg('spark') + '<span>A DreamJobs HR-statisztikái alapján a <b>motivációs levéllel</b> jelentkezők <b>' + DJP.HR_STAT + '-kal nagyobb eséllyel</b> jutnak tovább a kiválasztásban. Az AI a CV-dből, ebből a hirdetésből és a cég bemutatkozásából megírja helyetted.</span></div>' +
      body + '</div>';
  }

  function optionPanel() {
    if (st.option === 'existing') {
      var up = st.upload
        ? '<div class="djp-file">' + svg('file') + '<span><b>' + esc(st.upload.name) + '</b><em>' + Math.max(1, Math.round(st.upload.size / 1024)) + ' KB · feltöltve</em></span><button type="button" data-act="rm-upload" aria-label="Eltávolítás">' + svg('close') + '</button></div>'
        : '<label class="djp-drop" data-drop>' + svg('upload') + '<b>Húzd ide az önéletrajzod, vagy kattints a tallózáshoz</b><span>PDF, DOC, DOCX · max. 10 MB</span><input type="file" accept=".pdf,.doc,.docx" data-file hidden></label>';
      return '<div class="djp-panel">' + up + savedCvList() + '</div>' + letterBlock();
    }
    if (st.option === 'new') {
      return '<div class="djp-panel djp-panel-cta"><p>A <b>DreamJobs CV-generátorban</b> lépésről lépésre elkészítheted az önéletrajzodat. A regisztrációkor megadott adataid már ki vannak töltve, és bármelyik részt megírathatod vagy feljavíttathatod AI-val.</p>' +
        '<ol class="djp-steps"><li>Önéletrajz</li><li>Motivációs levél</li><li>Mentés és jelentkezés</li></ol>' +
        '<a href="cv-generator.html?mode=new&job=' + job.id + '" data-go-builder class="' + BTN_RED + '">Tovább a CV-generátorba →</a></div>';
    }
    if (st.option === 'boost') {
      return '<div class="djp-panel djp-panel-cta"><p>Töltsd fel a meglévő önéletrajzodat. Kiolvassuk és strukturáljuk az adataidat, felteszünk <b>6 rövid kérdést</b>, majd az AI felturbózza a CV-det, és a <b>' + esc(job.company) + '</b> hirdetéséhez igazítja.</p>' +
        '<ol class="djp-steps"><li>Feltöltés és kiolvasás</li><li>Kérdések</li><li>AI-javítás</li><li>Motivációs levél</li><li>Jelentkezés</li></ol>' +
        '<a href="cv-generator.html?mode=boost&job=' + job.id + '" data-go-builder class="' + BTN_RED + '">' + svg('spark') + '&nbsp;Felturbózás indítása →</a></div>';
    }
    return '';
  }

  function applyView() {
    /* jelentkezni lehet önéletrajzzal (meglévő CV kiválasztva) vagy csak LinkedIn profillal */
    var cvOk = st.useCv && st.option === 'existing' && (st.upload || st.cvId);
    var liOnly = !st.useCv && st.linkedin;
    var canApply = (cvOk || liOnly) && st.consent && st.letterState !== 'loading';
    var showApply = !st.useCv || st.option === 'existing' || !st.option;
    return companyCard() + personalBox() +
      '<h3 class="font-medium text-xl mb-3 mt-8">Jelentkezés módja</h3>' +
      '<div class="mt-3"><div class="flex flex-col border rounded-big py-4 md:py-5 px-4 md:px-dj-30 border-dj-gray-light"><div class="flex items-center"><div class="flex items-center min-h-full">' +
      '<span class="text-4xl" style="color:rgb(6,102,195);display:flex">' + svg('linkedin') + '</span><span class="ml-5 font-medium">LinkedIn profillal jelentkezem</span></div>' +
      '<label class="flex items-center ml-auto"><input type=checkbox data-linkedin class="' + SWITCH + '"' + (st.linkedin ? ' checked' : '') + '></label></div></div></div>' +
      '<div class="mt-3 djp-cvblock' + (st.useCv ? '' : ' is-off') + '"><div class="djp-cvblock-head"><div><span class="font-medium">Önéletrajzzal jelentkezem</span><span class="djp-muted text-sm">' + (st.useCv ? 'Válaszd ki, hogyan szeretnél jelentkezni' : 'Kapcsold be, ha önéletrajzot is küldenél') + '</span></div>' +
      '<label class="flex items-center ml-auto"><input type=checkbox data-usecv class="' + SWITCH + '"' + (st.useCv ? ' checked' : '') + ' aria-label="Önéletrajzzal jelentkezem"></label></div>' +
      (st.useCv ? '<div class="djp-opts">' +
        optionCard('existing', 'file', 'Meglévő önéletrajzommal jelentkezem', 'Töltsd fel, vagy válassz a mentett önéletrajzaid közül.') +
        optionCard('boost', 'spark', 'Meglévő önéletrajzom felturbózása', 'Az AI kiolvassa az önéletrajzodat, feltesz pár kérdést, és ehhez az álláshoz igazítja.', true) +
        optionCard('new', 'edit', 'Új önéletrajzot készítek', 'Lépésről lépésre, AI-segítséggel a DreamJobs CV-generátorban.', true) +
        '</div>' + optionPanel() : '') + '</div>' +
      (showApply ?
        '<div class="p-[15px] md:p-[25px] mt-[30px] bg-dj-blue-light rounded-normal"><label class="flex max-w-max items-start"><input type=checkbox data-notify class="' + CHECKBOX + '"' + (st.notify ? ' checked' : '') + '><span class="font-medium mt-1 ml-dj-20">Értesülj elsőként hasonló állásokról</span></label></div>' +
        '<label class="flex max-w-max items-center ml-[15px] md:ml-[25px] my-[15px] md:my-5"><input type=checkbox data-consent class="' + CHECKBOX + '"' + (st.consent ? ' checked' : '') + '><span class="font-medium mt-1 ml-dj-20">Elfogadom, hogy az itt megadott adatokat a hirdető cégnek (' + esc(job.company) + ') továbbítjuk</span></label>' +
        '<div class="w-full"><button type=button data-act="apply" class="' + BTN_RED + '"' + (canApply ? '' : ' disabled') + '>Jelentkezem</button></div>' : '');
  }

  function successView() {
    var app = DJP.store.applicationFor(job.id);
    var letter = app && app.letterId ? DJP.store.getDoc(app.letterId) : null;
    var cv = app && app.cvId ? DJP.store.getDoc(app.cvId) : null;
    return '<div class="djp-success">' + '<div class="djp-success-ico">' + svg('check') + '</div>' +
      '<h3>Jelentkezésed elküldtük!</h3><p>A <b>' + esc(job.company) + '</b> megkapta az önéletrajzodat' + (letter ? ' és a motivációs leveledet' : '') + ' ' + DJP.art(job.title) + ' <b>' + esc(job.title) + '</b> pozícióra.</p>' +
      '<div class="djp-success-docs">' + (cv ? '<span>' + svg('file') + esc(cv.title) + '</span>' : '') + (letter ? '<span>' + svg('file') + esc(letter.title) + '</span>' : '') + '</div>' +
      '<div class="djp-success-actions"><a href="jelentkezeseim.html" class="' + BTN_RED + '">Jelentkezéseim megtekintése</a><button type="button" data-close class="djp-btn-ghost w-full">Vissza az álláshoz</button></div></div>';
  }

  /* ---------- render ---------- */
  function render() {
    var title = st.view === 'success' ? 'Sikeres jelentkezés' : (st.view === 'login' ? 'Belépés' : 'Jelentkezés');
    var content = st.view === 'apply' ? applyView() : st.view === 'success' ? successView() : authView();
    var box = root.querySelector('.dj-jobprofile-modal-box');
    var scroll = box ? box.scrollTop : 0;
    var enter = st._enter; st._enter = false;
    root.innerHTML = '<section class="dj-jobprofile-modal-container fixed grid place-content-center w-full h-full top-0 left-0 bg-black/70 z-40 py-0 md:py-5 pt-20 md:pt-20 djp-modal' + (enter ? ' djp-anim-in' : '') + '">' +
      '<div class="dj-jobprofile-modal-box flex flex-col md:w-[680px] h-full overflow-y-auto md:rounded-big p-4 md:p-dj-40 bg-white"><div>' +
      '<div class="flex w-full text-dj-gray mb-6"><span class="text-dj-black font-medium text-xl">' + title + '</span><button type="button" data-close class="ml-auto djp-x" aria-label="Bezárás">' + svg('close') + '</button></div>' +
      content + '</div></div></section>';
    var nb = root.querySelector('.dj-jobprofile-modal-box');
    if (nb) nb.scrollTop = scroll;
    bind();
  }

  function bind() {
    root.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    root.querySelector('.djp-modal').addEventListener('click', function (e) { if (e.target.classList.contains('djp-modal')) close(); });
    root.querySelectorAll('[data-switch]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); st.view = a.getAttribute('data-switch'); root.innerHTML = ''; render(); });
    });
    var pwb = root.querySelector('[data-pw-toggle]');
    if (pwb) pwb.addEventListener('click', function () {
      var i = pwb.parentElement.querySelector('input');
      i.type = i.type === 'password' ? 'text' : 'password';
      pwb.classList.toggle('is-on', i.type === 'text');
    });
    var form = root.querySelector('form.djp-auth');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var u = { email: (f.get('email') || '').trim() || DJP.store.user().email };
      if (form.getAttribute('data-auth') === 'register') { u.firstName = (f.get('firstName') || '').trim() || 'Barna'; u.lastName = (f.get('lastName') || '').trim() || 'Bogdán'; }
      DJP.store.login(u);
      DJP.applyHeaderState();
      DJP.toast(form.getAttribute('data-auth') === 'register' ? 'Sikeres regisztráció – üdv a DreamJobs-on!' : 'Sikeres belépés', 'ok');
      if (st.standalone) { close(); return; }
      st.view = 'apply';
      render();
    });

    root.querySelectorAll('input[name=cvopt]').forEach(function (r) {
      r.addEventListener('change', function () { st.option = r.value; render(); });
    });
    root.querySelectorAll('input[name=savedcv]').forEach(function (r) {
      r.addEventListener('change', function () { st.cvId = r.value; st.upload = null; render(); });
    });
    root.querySelectorAll('[data-rm-cv]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var d = DJP.store.getDoc(b.getAttribute('data-rm-cv'));
        if (!d || !confirm('Biztosan törlöd ezt az önéletrajzot: „' + d.title + '”?')) return;
        DJP.store.deleteDoc(d.id);
        if (st.cvId === d.id) { st.cvId = null; st.letterState = 'idle'; st.letter = ''; }
        DJP.toast('Önéletrajz törölve – tölts fel egy újat');
        render();
      });
    });
    var file = root.querySelector('[data-file]');
    if (file) file.addEventListener('change', function () { if (file.files[0]) takeFile(file.files[0]); });
    var drop = root.querySelector('[data-drop]');
    if (drop) {
      ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove('is-over'); }); });
      drop.addEventListener('drop', function (e) { e.preventDefault(); if (e.dataTransfer.files[0]) takeFile(e.dataTransfer.files[0]); });
    }
    act('rm-upload', function () { st.upload = null; render(); });
    act('gen-letter', generateLetter);
    act('regen', generateLetter);
    act('apply', submit);
    var tone = root.querySelector('[data-tone]');
    if (tone) tone.addEventListener('change', function () { st.tone = tone.value; generateLetter(); });
    var ta = root.querySelector('[data-letter]');
    if (ta) ta.addEventListener('input', function () { st.letter = ta.value; });
    bindCheck('[data-save-letter]', 'saveLetter');
    bindCheck('[data-consent]', 'consent', true);
    bindCheck('[data-notify]', 'notify');
    bindCheck('[data-linkedin]', 'linkedin', true);
    bindCheck('[data-usecv]', 'useCv', true);
    root.querySelectorAll('[data-go-builder]').forEach(function (a) {
      a.addEventListener('click', function () { DJP.store.clearDraft(); });
    });
  }
  function act(name, fn) {
    root.querySelectorAll('[data-act="' + name + '"]').forEach(function (b) { b.addEventListener('click', fn); });
  }
  function bindCheck(sel, key, rerender) {
    var el = root.querySelector(sel);
    if (el) el.addEventListener('change', function () { st[key] = el.checked; if (rerender) render(); });
  }

  function takeFile(f) {
    st.upload = { name: f.name, size: f.size, dataUrl: null };
    st.cvId = null;
    if (f.size < 1500000) {
      var r = new FileReader();
      r.onload = function () { if (st.upload && st.upload.name === f.name) st.upload.dataUrl = r.result; };
      r.readAsDataURL(f);
    }
    DJP.toast('Önéletrajz feltöltve: ' + f.name, 'ok');
    render();
  }

  /* a választott/feltöltött CV "kiolvasott" adatai (a demóban a csatolt PDF tartalma) */
  function cvForLetter() {
    if (st.cvId) {
      var d = DJP.store.getDoc(st.cvId);
      if (d && d.data) return d.data;
    }
    var cv = DJP.parsedCV();
    var u = DJP.store.user();
    cv.personal.firstName = u.firstName || cv.personal.firstName;
    cv.personal.lastName = u.lastName || cv.personal.lastName;
    return cv;
  }

  function generateLetter() {
    st.letterState = 'loading';
    st.letter = '';
    render();
    var stepEl = function () { return root.querySelector('[data-ai-step]'); };
    var steps = ['Önéletrajz kiolvasása…', 'A ' + job.company + ' hirdetésének elemzése…', 'A cég bemutatkozásának feldolgozása…', 'A levél megírása…'];
    var chain = Promise.resolve();
    steps.forEach(function (s, i) {
      chain = chain.then(function () { var el = stepEl(); if (el) el.textContent = s; return DJP.ai.wait(i === steps.length - 1 ? 300 : 650); });
    });
    chain.then(function () {
      var res = DJP.ai.coverLetter(cvForLetter(), job, { tone: st.tone });
      var ta = root.querySelector('[data-letter]');
      return DJP.ai.typeText(function (t) { st.letter = t; if (ta) { ta.value = t; ta.scrollTop = ta.scrollHeight; } }, res.body, { frames: 70 });
    }).then(function () {
      st.letterState = 'done';
      render();
    });
  }

  function submit() {
    var cvDoc = null, letterDoc = null;
    if (!st.useCv) {
      cvDoc = null; /* csak LinkedIn profillal */
    } else if (st.upload) {
      cvDoc = DJP.store.saveDoc({ type: 'cv', category: 'uploaded', title: st.upload.name, fileName: st.upload.name, fileUrl: st.upload.dataUrl, jobId: job.id });
    } else {
      cvDoc = DJP.store.getDoc(st.cvId);
    }
    if (st.useCv && st.letterState === 'done' && st.letter.trim()) {
      var cv = cvForLetter();
      var letter = { recipient: { company: job.company, person: 'HR csapat', address: job.companyAddress }, city: 'Sepsiszentgyörgy', date: huDate(), subject: 'Jelentkezés – ' + job.title, body: st.letter };
      var ldoc = { type: 'letter', category: 'ai-letter', title: 'Motivációs levél – ' + job.company, jobId: job.id,
        data: { letter: letter, cv: { personal: cv.personal, template: cv.template, accent: cv.accent, font: cv.font } } };
      letterDoc = st.saveLetter ? DJP.store.saveDoc(ldoc) : null;
      if (!st.saveLetter) letterDoc = { id: null, title: ldoc.title };
    }
    DJP.store.addApplication({ jobId: job.id, cvId: cvDoc && cvDoc.id, letterId: letterDoc && letterDoc.id, cvTitle: cvDoc ? cvDoc.title : (st.linkedin ? 'LinkedIn profil' : null), letterTitle: letterDoc && letterDoc.title });
    st.view = 'success';
    render();
    markApplied();
  }

  /* ---------- nyitás / zárás ---------- */
  DJP.openApply = function (opts) {
    opts = opts || {};
    st = fresh(opts);
    st._enter = true;
    if (st.view === 'apply' && DJP.store.applicationFor(job.id) && !opts.opt) st.view = 'success';
    document.documentElement.style.overflow = 'hidden';
    root.innerHTML = '';
    render();
  };
  function close() {
    root.innerHTML = '';
    document.documentElement.style.overflow = '';
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.innerHTML) close(); });

  /* ---------- oldal gombjai ---------- */
  function applyButtons() {
    return Array.prototype.filter.call(document.querySelectorAll('button'), function (b) {
      return !root.contains(b) && /^Jelentkez(em|tél)/.test(b.textContent.trim());
    });
  }
  function markApplied() {
    if (!DJP.store.applicationFor(job.id)) return;
    applyButtons().forEach(function (b) {
      if (b.childElementCount === 0) b.textContent = 'Jelentkeztél ✓';
      b.classList.add('djp-applied');
    });
  }
  applyButtons().forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); DJP.openApply({}); });
  });
  markApplied();

  if (DJP.qs('applied')) {
    DJP.toast('Jelentkezésed elküldtük a ' + job.company + ' részére!', 'ok');
    history.replaceState(null, '', location.pathname);
  }
  if (DJP.qs('open')) {
    var o = DJP.qs('opt');
    history.replaceState(null, '', location.pathname);
    DJP.openApply({ opt: o || null });
  }
})(window.DJP);

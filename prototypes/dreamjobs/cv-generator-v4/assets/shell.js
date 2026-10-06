/* DreamJobs prototípus – közös keret: fejléc állapot, profilmenü, toast, Demó panel. */
(function (DJP) {
  var page = document.body.getAttribute('data-djp-page');

  var IC = {
    ok: '<path fill=currentColor d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"/>',
    info: '<path fill=currentColor d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8"/>',
    clock: '<path fill=currentColor d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m.5-13H11v6l5.2 3.2l.8-1.3l-4.5-2.7z"/>',
    send: '<path fill=currentColor d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"/>',
    arrow: '<path fill=currentColor d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
    close: '<path fill=currentColor d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>',
    up: '<path fill=currentColor d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/>'
  };
  function ic(n) { return '<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }

  /* ---------- toast ---------- */
  var toastEl;
  DJP.toast = function (msg, kind) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'djp-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span class="djp-toast-ico">' + ic(kind === 'ok' ? 'ok' : 'info') + '</span><span class="djp-toast-msg">' + DJP.esc(msg) + '</span>';
    toastEl.className = 'djp-toast is-on' + (kind === 'ok' ? ' is-ok' : '');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.className = 'djp-toast' + (kind === 'ok' ? ' is-ok' : ''); }, 3200);
  };

  DJP.go = function (url) { location.href = url; };

  /* ---------- fejléc: belépett / kijelentkezett ---------- */
  DJP.applyHeaderState = function () {
    var user = DJP.store.user();
    var header = document.querySelector('header[data-djp-header]');
    var tpl = document.getElementById('djp-header-loggedout');
    if (!header) return;
    if (!user.loggedIn && tpl) {
      if (!DJP._headerIn) DJP._headerIn = header.outerHTML;
      var wrap = document.createElement('div');
      wrap.innerHTML = tpl.innerHTML;
      var out = wrap.firstElementChild;
      out.setAttribute('data-djp-header', 'out');
      header.replaceWith(out);
      out.querySelectorAll('button').forEach(function (b) {
        var t = b.textContent.trim().toLowerCase();
        if (t === 'belépés' || t.indexOf('regisztráció') === 0) {
          b.addEventListener('click', function () {
            if (DJP.openApply) DJP.openApply({ auth: t === 'belépés' ? 'login' : 'register', standalone: true });
          });
        }
      });
    } else if (user.loggedIn && header.getAttribute('data-djp-header') === 'out' && DJP._headerIn) {
      var w2 = document.createElement('div');
      w2.innerHTML = DJP._headerIn;
      header.replaceWith(w2.firstElementChild);
      bindProfileMenu();
    }
    markActiveNav();
  };

  function markActiveNav() {
    var key = page === 'builder' ? 'cvgen' : page === 'documents' ? 'docs' : null;
    document.querySelectorAll('[data-djp-nav]').forEach(function (a) {
      a.classList.toggle('djp-nav-active', a.getAttribute('data-djp-nav') === key);
    });
  }

  /* ---------- profil (avatar) menü ---------- */
  function bindProfileMenu() {
    var trigger = document.querySelector('header [data-header-actions] .cursor-pointer');
    if (!trigger || trigger._djp) return;
    trigger._djp = true;
    trigger.parentElement.style.position = 'relative';
    var menu = document.createElement('div');
    menu.className = 'djp-usermenu';
    var u = DJP.store.user();
    menu.innerHTML =
      '<div class="djp-usermenu-head"><b>' + DJP.esc(u.lastName + ' ' + u.firstName) + '</b><span>' + DJP.esc(u.email) + '</span></div>' +
      '<a href="profil.html">Profilom</a>' +
      '<div class="djp-usermenu-cv"><span class="djp-usermenu-label">Önéletrajz és levelek</span>' +
      '<a href="cv-generator.html">CV-generátor <i class="djp-new">Új</i></a>' +
      '<a href="oneletrajzaim.html">Önéletrajzaim <em>' + DJP.store.documents('cv').length + '</em></a>' +
      '<a href="motivacios-leveleim.html">Motivációs leveleim <em>' + DJP.store.documents('letter').length + '</em></a></div>' +
      '<a href="jelentkezeseim.html">Jelentkezéseim</a>' +
      '<button type="button" data-logout>Kijelentkezés</button>';
    trigger.parentElement.appendChild(menu);
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('is-open');
    });
    document.addEventListener('click', function () { menu.classList.remove('is-open'); });
    menu.querySelector('[data-logout]').addEventListener('click', function () {
      DJP.store.logout();
      location.href = 'allas.html';
    });
  }

  /* ---------- Demó panel ---------- */
  function demoPanel() {
    var box = document.createElement('div');
    box.className = 'djp-demo';
    box.innerHTML =
      '<button type="button" class="djp-demo-toggle" aria-expanded="false"><span>▶</span> Demó</button>' +
      '<div class="djp-demo-panel">' +
      '<div class="djp-demo-title">Bemutató forgatókönyvek</div>' +
      '<button data-s="1"><b>1</b>Kijelentkezett jelentkezés (regisztráció)</button>' +
      '<button data-s="2"><b>2</b>Meglévő CV + AI motivációs levél</button>' +
      '<button data-s="3"><b>3</b>Új CV a CV-generátorral</button>' +
      '<button data-s="4"><b>4</b>AI CV-felturbózás</button>' +
      '<button data-s="5"><b>5</b>Önéletrajzaim</button>' +
      '<button data-s="6"><b>6</b>Motivációs leveleim</button>' +
      '<button data-s="7"><b>7</b>Régi profil (Self-Branding CV)</button>' +
      '<button data-s="reset" class="djp-demo-reset">↺ Demó visszaállítása</button>' +
      '</div>';
    document.body.appendChild(box);
    var t = box.querySelector('.djp-demo-toggle');
    t.addEventListener('click', function () {
      var open = box.classList.toggle('is-open');
      t.setAttribute('aria-expanded', open);
    });
    box.querySelectorAll('[data-s]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-s');
        if (s === 'reset') { DJP.store.reset(); return DJP.go('allas.html'); }
        if (s === '1') { DJP.store.logout(); return DJP.go('allas.html?open=1'); }
        DJP.store.login();
        if (s === '2') return DJP.go('allas.html?open=1&opt=existing');
        if (s === '3') { DJP.store.clearDraft(); return DJP.go('cv-generator.html?mode=new&job=startuphub'); }
        if (s === '4') { DJP.store.clearDraft(); return DJP.go('cv-generator.html?mode=boost&job=startuphub'); }
        if (s === '5') return DJP.go('oneletrajzaim.html');
        if (s === '6') return DJP.go('motivacios-leveleim.html');
        if (s === '7') return DJP.go('profil.html');
      });
    });
  }

  /* ---------- emlékeztető: a jelentkezés véglegesítése ---------- */
  /* o: { key, job, step (1–3), ready, href | onAction } – kártya jobb alul, összecsukható */
  var remindEl = null;
  function isMin(key) { try { return sessionStorage.getItem('djp_remind_min') === key; } catch (e) { return false; } }
  function setMin(key, on) { try { if (on) sessionStorage.setItem('djp_remind_min', key); else sessionStorage.removeItem('djp_remind_min'); } catch (e) { /* privát mód */ } }
  DJP.remind = function (o) {
    if (!o) { if (remindEl) remindEl.hidden = true; return; }
    if (!remindEl) {
      remindEl = document.createElement('div');
      remindEl.className = 'djp-remind';
      remindEl.setAttribute('role', 'complementary');
      remindEl.setAttribute('aria-label', 'Jelentkezés befejezése');
      document.body.appendChild(remindEl);
    }
    var j = o.job, step = o.step || 1;
    var cta = o.href
      ? '<a class="djp-remind-cta" href="' + o.href + '">Jelentkezés befejezése' + ic('arrow') + '</a>'
      : '<button type="button" class="djp-remind-cta" data-remind-act' + (o.ready === false ? ' disabled' : '') + '>Jelentkezés befejezése' + ic('arrow') + '</button>';
    var steps = ['Önéletrajz', 'Motivációs levél', 'Elküldés'].map(function (l, i) {
      var n = i + 1;
      return '<li class="' + (n < step ? 'is-done' : n === step ? 'is-now' : '') + '"><span>' + (n < step ? ic('ok') : n) + '</span>' + l + '</li>';
    }).join('');
    remindEl.hidden = false;
    remindEl.classList.toggle('is-min', isMin(o.key));
    remindEl.innerHTML =
      '<button type="button" class="djp-remind-pill" data-remind-open>' + ic('clock') + '<b>Jelentkezés befejezése</b><span>' + step + '/3</span>' + ic('up') + '</button>' +
      '<div class="djp-remind-card">' +
      '<div class="djp-remind-head"><span class="djp-remind-bgico" aria-hidden="true">' + ic('clock') + '</span>' +
      '<div class="djp-remind-headrow"><b>Még nem küldted el a jelentkezésed</b>' +
      '<button type="button" class="djp-remind-x" data-remind-min aria-label="Összecsukás">' + ic('close') + '</button></div>' +
      '<p class="djp-remind-desc">A cég csak akkor kapja meg, ha az utolsó lépésben elküldöd.</p></div>' +
      '<div class="djp-remind-job"><img src="' + j.logo + '" alt=""><div><b>' + DJP.esc(j.title) + '</b><span>' + DJP.esc(j.company + ' · ' + j.city) + '</span></div></div>' +
      '<ol class="djp-remind-steps">' + steps + '</ol>' + cta +
      (o.ready === false ? '<div class="djp-remind-note">Előbb töltsd ki az önéletrajzodat.</div>' : '') + '</div>';
    var b = remindEl.querySelector('[data-remind-act]');
    if (b && o.onAction) b.addEventListener('click', o.onAction);
    remindEl.querySelector('[data-remind-min]').addEventListener('click', function () { setMin(o.key, true); remindEl.classList.add('is-min'); });
    remindEl.querySelector('[data-remind-open]').addEventListener('click', function () { setMin(o.key, false); remindEl.classList.remove('is-min'); });
  };

  /* felső sáv a fejléc alatt (nem a generátorban) */
  function pendingBar(j, url) {
    var header = document.querySelector('header');
    if (!header || document.querySelector('.djp-pending')) return;
    var bar = document.createElement('div');
    bar.className = 'djp-pending';
    bar.innerHTML = '<div class="djp-pending-in"><span class="djp-pending-ico">' + ic('clock') + '</span>' +
      '<span class="djp-pending-txt"><b>Befejezetlen jelentkezés:</b> ' + DJP.esc(j.title) + ' – ' + DJP.esc(j.company) + '</span>' +
      '<a class="djp-pending-btn" href="' + url + '">Jelentkezés befejezése' + ic('arrow') + '</a></div>';
    header.insertAdjacentElement('afterend', bar);
  }

  /* más oldalakon: ha van befejezetlen, álláshoz kötött piszkozat */
  function draftReminder() {
    var d = DJP.store.getDraft();
    if (!d || !d.jobId || d.step === 'done' || DJP.store.applicationFor(d.jobId)) return;
    var j = DJP.jobs[d.jobId];
    var k = (d.key || '').split('|');
    var url = 'cv-generator.html?mode=' + (k[0] || 'new') + '&job=' + d.jobId + (k[2] ? '&doc=' + k[2] : '') + (k[4] ? '&src=' + k[4] : '');
    var step = d.step === 3 ? 3 : d.step === 2 ? 2 : 1;
    pendingBar(j, url);
    DJP.remind({ key: 'draft-' + d.jobId, job: j, step: step, href: url });
  }

  /* ---------- régi profil oldal: figyelemfelhívás az új CV-generátorra ---------- */
  function profileBanner() {
    var header = document.querySelector('header');
    if (!header) return;
    var bar = document.createElement('div');
    bar.className = 'djp-profile-banner';
    bar.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><path fill=currentColor d="m19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4L6.5 9.5L1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"/></svg>' +
      '<span><b>Új: CV-generátor.</b> A Self-Branding CV helyett mostantól DreamJobs-sablonos önéletrajzot és motivációs levelet készíthetsz – AI-segítséggel.</span>' +
      '<a class="djp-btn-ai" href="cv-generator.html">Kipróbálom</a><a class="djp-btn djp-btn-outline djp-btn-sm" href="cv-generator.html?mode=boost">CV felturbózása</a>';
    header.insertAdjacentElement('afterend', bar);
  }

  /* ---------- indítás ---------- */
  if (page !== 'job' && !DJP.store.user().loggedIn) DJP.store.login();
  DJP.applyHeaderState();
  bindProfileMenu();
  demoPanel();
  if (page === 'profile') profileBanner();
  if (page !== 'builder') draftReminder();
})(window.DJP);

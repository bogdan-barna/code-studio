/* DreamJobs prototípus – állásoldali jelentkezés (felugró ablak nélkül).
   A „Jelentkezem” gomb a jelentkezési oldalra visz (cv-generator.html?mode=apply): ugyanaz a keret és lépésjelző
   (Önéletrajz → Motivációs levél → Mentés és jelentkezés), mint a felturbózásnál és az új CV-nél.
   Kijelentkezve előbb a regisztráció / belépés oldal jön (belepes.html), utána a jelentkezési oldal. */
(function (DJP) {
  var job = DJP.jobs.startuphub;

  /* a jelentkezési oldal: meglévő CV a saját lépésein, felturbózás és új CV a CV-generátor folyamatain */
  function applyUrl(opt) {
    var base = 'cv-generator.html?job=' + job.id;
    return opt === 'new' ? base + '&mode=new' : opt === 'boost' ? base + '&mode=boost' : base + '&mode=apply' + (opt === 'existing' ? '&opt=existing' : '');
  }
  DJP.openApply = function (opts) {
    opts = opts || {};
    DJP.store.clearDraft();
    if (DJP.store.user().loggedIn) DJP.go(applyUrl(opts.opt));
    else DJP.goAuth({ tab: opts.auth || 'login', job: job.id, next: applyUrl(opts.opt) }); /* kijelentkezve: belépés külön oldalon, onnan regisztrálni is lehet */
  };

  /* ---------- oldal gombjai ---------- */
  function applyButtons() {
    return Array.prototype.filter.call(document.querySelectorAll('button'), function (b) {
      return /^Jelentkez(em|tél)/.test(b.textContent.trim());
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
  /* demó: allas.html?open=1[&opt=existing] – azonnal indul a jelentkezés */
  if (DJP.qs('open')) {
    var o = DJP.qs('opt'), a = DJP.qs('auth');
    history.replaceState(null, '', location.pathname);
    DJP.openApply({ opt: o || null, auth: a || null });
  }
})(window.DJP);

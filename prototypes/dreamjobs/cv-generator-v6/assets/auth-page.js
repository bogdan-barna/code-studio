/* DreamJobs prototípus – regisztráció / belépés külön oldalon (belepes.html).
   Paraméterek: tab=register|login, job=<állás azonosító> (jelentkezésnél), next=<ahová belépés után megyünk>.
   Jelentkezésnél ugyanaz a keret és lépésjelző, mint a jelentkezési oldalon: Fiók → Önéletrajz → Motivációs levél → Mentés és jelentkezés. */
(function (DJP) {
  var esc = DJP.esc;
  var root = document.getElementById('djp-auth');
  if (!root) return;

  var ICON = {
    back: '<path fill=currentColor d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20z"/>',
    arrow: '<path fill=currentColor d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
    eye: '<path fill=currentColor d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-8a3 3 0 1 0 0 6a3 3 0 0 0 0-6"/>',
    user: '<path fill=currentColor d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"/>'
  };
  function svg(name, cls) {
    return '<svg class="' + (cls || '') + '" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">' + ICON[name] + '</svg>';
  }

  /* csak a saját oldalainkra engedünk továbblépni (nyitott átirányítás ellen) */
  function safeNext(u) { return u && /^[a-z0-9-]+\.html(\?[^#]*)?$/i.test(u) ? u : null; }
  var job = DJP.qs('job') ? DJP.jobs[DJP.qs('job')] : null;
  var next = safeNext(DJP.qs('next')) || (job ? 'cv-generator.html?job=' + job.id + '&mode=apply' : 'allas.html');
  var tab = DJP.qs('tab') === 'login' ? 'login' : 'register';

  /* már belépve: nincs mit tenni itt, megyünk tovább */
  if (DJP.store.user().loggedIn) { location.replace(next); return; }

  function topbar() {
    var login = tab === 'login';
    var back = '<a class="djp-b-back" href="' + (job ? 'allas.html' : esc(next)) + '">' + svg('back') + '<span>' + (job ? 'Vissza az álláshoz' : 'Vissza') + '</span></a>';
    var left = job
      ? '<div class="djp-b-jobmini"><img src="' + job.logo + '" alt=""><div>' + back + '<b>' + esc(job.title) + '</b><span>' + esc(job.company + ' · ' + job.city + ' · ' + job.salary) + '</span></div></div>'
      : '<div class="djp-b-jobmini is-plain"><div>' + back + '<b>' + (login ? 'Belépés' : 'Regisztráció') + '</b><span>DreamJobs fiók</span></div></div>';
    var steps = job ? '<ol class="djp-stepper">' + ['Fiók', 'Önéletrajz', 'Motivációs levél', 'Mentés és jelentkezés'].map(function (l, i) {
      return '<li class="' + (i === 0 ? 'is-active' : '') + '"><button type="button" disabled><span>' + (i + 1) + '</span>' + l + '</button></li>';
    }).join('') + '</ol>' : '';
    return '<div class="djp-b-top"><div class="djp-b-top-l">' + left + '</div><div class="djp-b-top-c">' + steps + '</div><div class="djp-b-top-actions"></div></div>';
  }

  function form() {
    var login = tab === 'login';
    function f(label, name, type, ph, ac) {
      return '<label class="djp-af"><span>' + label + '</span><input name="' + name + '" type="' + type + '" placeholder="' + esc(ph) + '" autocomplete="' + ac + '"></label>';
    }
    var pw = '<label class="djp-af"><span>Jelszó' + (login ? '<a href="#" class="djp-af-forgot">Elfelejtett jelszó?</a>' : '') + '</span><div class="djp-af-pw">' +
      '<input name="password" type="password" placeholder="' + (login ? 'A jelszavad' : 'Legalább 8 karakter') + '" autocomplete="' + (login ? 'current-password' : 'new-password') + '">' +
      '<button type="button" data-pw-toggle aria-label="Jelszó megjelenítése">' + svg('eye') + '</button></div></label>';
    var tabs = '<div class="djp-seg djp-auth-tabs" role="tablist"><button type="button" data-switch="register" class="' + (login ? '' : 'is-on') + '">Regisztráció</button><button type="button" data-switch="login" class="' + (login ? 'is-on' : '') + '">Belépés</button></div>';
    var head = '<div class="djp-card-ico">' + svg('user') + '</div>' +
      '<h2>' + (login ? 'Lépj be a fiókodba' : 'Hozd létre a fiókodat') + '</h2>' +
      '<p>' + (job ? 'A jelentkezéshez DreamJobs fiók kell – ' + (login ? 'belépés után' : 'regisztráció után') + ' egyből folytathatod ' + DJP.az('<b>' + esc(job.company) + '</b>') + ' „' + esc(job.title) + '” állására.'
        : (login ? 'Lépj be, és folytasd ott, ahol abbahagytad.' : 'Ingyenes, egy perc alatt kész – az adataidat a jelentkezésnél és a CV-generátorban is használjuk.')) + '</p>';
    var body = login
      ? '<form class="djp-auth" data-auth="login">' + f('E-mail cím', 'email', 'email', 'nev@email.com', 'email') + pw +
        '<button type="submit" class="djp-btn djp-btn-red djp-auth-submit">' + (job ? 'Belépés és tovább a jelentkezéshez' : 'Belépés') + ' ' + svg('arrow') + '</button>' +
        '<p class="djp-auth-alt">Még nincs fiókod? <a href="#" data-switch="register">Regisztrálj egy perc alatt</a></p></form>'
      : '<form class="djp-auth" data-auth="register">' +
        '<div class="djp-auth-grid">' + f('Vezetéknév', 'lastName', 'text', 'pl. Bogdán', 'family-name') + f('Keresztnév', 'firstName', 'text', 'pl. Barna', 'given-name') + '</div>' +
        f('E-mail cím', 'email', 'email', 'nev@email.com', 'email') + pw +
        '<label class="djp-auth-terms"><input type="checkbox" name="terms" checked><span>Elfogadom a <a href="#">felhasználási feltételeket</a> és az <a href="#">adatvédelmi irányelveket</a>.</span></label>' +
        '<button type="submit" class="djp-btn djp-btn-red djp-auth-submit">' + (job ? 'Regisztrálok és tovább a jelentkezéshez' : 'Regisztrálok') + ' ' + svg('arrow') + '</button>' +
        '<p class="djp-auth-alt">Már van DreamJobs fiókod? <a href="#" data-switch="login">Lépj be</a></p></form>';
    return '<div class="djp-center djp-authpage-in"><div class="djp-card djp-auth-card">' + head + tabs + body + '</div></div>';
  }

  function render() {
    root.innerHTML = topbar() + '<div class="djp-b-work">' + form() + '</div>';
    document.title = (tab === 'login' ? 'Belépés' : 'Regisztráció') + ' – DreamJobs';
    var stp = root.querySelector('.djp-stepper');
    if (stp) root.style.setProperty('--stepw', stp.offsetWidth + 'px');
    var first = root.querySelector('form input');
    if (first) first.focus({ preventScroll: true });
  }

  root.addEventListener('click', function (e) {
    var sw = e.target.closest('[data-switch]');
    if (sw) {
      e.preventDefault();
      tab = sw.getAttribute('data-switch');
      /* a fül a címben is megmarad (újratöltésnél, megosztásnál) */
      var p = new URLSearchParams(location.search); p.set('tab', tab);
      history.replaceState(null, '', location.pathname + '?' + p.toString());
      render();
      return;
    }
    var pwb = e.target.closest('[data-pw-toggle]');
    if (pwb) {
      var i = pwb.parentElement.querySelector('input');
      i.type = i.type === 'password' ? 'text' : 'password';
      pwb.classList.toggle('is-on', i.type === 'text');
    }
  });

  root.addEventListener('submit', function (e) {
    var form = e.target.closest('form.djp-auth');
    if (!form) return;
    e.preventDefault();
    var f = new FormData(form);
    var u = { email: (f.get('email') || '').trim() || DJP.store.user().email };
    if (form.getAttribute('data-auth') === 'register') { u.firstName = (f.get('firstName') || '').trim() || 'Barna'; u.lastName = (f.get('lastName') || '').trim() || 'Bogdán'; }
    DJP.store.login(u);
    DJP.toast(form.getAttribute('data-auth') === 'register' ? 'Sikeres regisztráció – üdv a DreamJobs-on!' : 'Sikeres belépés', 'ok');
    setTimeout(function () { DJP.go(next); }, 500);
  });

  render();
})(window.DJP);

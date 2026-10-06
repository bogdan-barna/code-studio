/* DreamJobs prototípus – állapot (localStorage). Minden oldal ezt tölti be elsőként. */
window.DJP = window.DJP || {};

(function (DJP) {
  var KEY = 'djproto_v1';

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function defaults() {
    return {
      user: {
        loggedIn: false,
        firstName: 'Barna',
        lastName: 'Bogdán',
        email: 'barna.bogdan@dreamjobs.ro',
        phone: ''
      },
      documents: [
        {
          id: 'doc_seed_pdf',
          type: 'cv',
          category: 'uploaded',
          title: 'Bogdan-Barna-CV-Product-Manager.pdf',
          fileName: 'Bogdan-Barna-CV-Product-Manager.pdf',
          fileUrl: 'assets/Bogdan-Barna-CV-Product-Manager.pdf',
          createdAt: '2026-10-02T09:12:00.000Z',
          updatedAt: '2026-10-02T09:12:00.000Z',
          jobId: null
        }
      ],
      applications: [],
      draft: null
    };
  }

  var mem = null;
  function load() {
    if (mem) return mem;
    try {
      var raw = localStorage.getItem(KEY);
      mem = raw ? JSON.parse(raw) : defaults();
    } catch (e) {
      mem = defaults();
    }
    return mem;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* tárhely tele / privát mód */ }
  }

  DJP.uid = uid;
  DJP.store = {
    get: function () { return load(); },
    save: save,
    update: function (fn) { fn(load()); save(); },
    reset: function () {
      mem = defaults();
      save();
    },
    user: function () { return load().user; },
    login: function (u) {
      DJP.store.update(function (s) {
        Object.assign(s.user, u || {}, { loggedIn: true });
      });
    },
    logout: function () {
      DJP.store.update(function (s) { s.user.loggedIn = false; });
    },
    documents: function (type) {
      return load().documents.filter(function (d) { return !type || d.type === type; });
    },
    getDoc: function (id) {
      return load().documents.find(function (d) { return d.id === id; }) || null;
    },
    saveDoc: function (doc) {
      var s = load();
      var now = new Date().toISOString();
      doc.updatedAt = now;
      if (!doc.id) { doc.id = uid('doc'); doc.createdAt = now; }
      var i = s.documents.findIndex(function (d) { return d.id === doc.id; });
      if (i >= 0) { doc.createdAt = s.documents[i].createdAt || now; s.documents[i] = doc; } else s.documents.unshift(doc);
      save();
      return doc;
    },
    deleteDoc: function (id) {
      DJP.store.update(function (s) {
        s.documents = s.documents.filter(function (d) { return d.id !== id; });
      });
    },
    addApplication: function (app) {
      app.id = uid('app');
      app.date = new Date().toISOString();
      app.status = 'Elküldve';
      DJP.store.update(function (s) {
        // ugyanarra az állásra újra jelentkezve a korábbi jelentkezés frissül
        s.applications = s.applications.filter(function (a) { return a.jobId !== app.jobId; });
        s.applications.unshift(app);
      });
      return app;
    },
    applicationFor: function (jobId) {
      return load().applications.find(function (a) { return a.jobId === jobId; }) || null;
    },
    getDraft: function () { return load().draft; },
    setDraft: function (d) { load().draft = d; save(); },
    clearDraft: function () { load().draft = null; save(); }
  };

  DJP.qs = function (name) {
    return new URLSearchParams(location.search).get(name);
  };

  DJP.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  DJP.fmtDate = function (iso) {
    var d = new Date(iso);
    var m = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
    return d.getFullYear() + '. ' + m[d.getMonth()] + ' ' + d.getDate() + '. ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  DJP.huDate = function () {
    var m = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
    var d = new Date();
    return d.getFullYear() + '. ' + m[d.getMonth()] + ' ' + d.getDate() + '.';
  };

  /* magyar névelő: a / az */
  DJP.art = function (x) { return /^[aáeéiíoóöőuúüű]/i.test(String(x || '').trim()) ? 'az' : 'a'; };
  DJP.az = function (x) { return DJP.art(x) + ' ' + x; };
  DJP.Az = function (x) { var a = DJP.art(x); return a.charAt(0).toUpperCase() + a.slice(1) + ' ' + x; };

  DJP.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
})(window.DJP);

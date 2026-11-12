/* Firebase bağlantısı: panelin claude.ai veritabanı arayüzünü (window.claude.use("db"/"user")) Firestore ile sağlar.
   Panel kodu (index.html) değişmez; bu dosya ondan önce yüklenir.
   - Okuma herkese açık, canlı (onSnapshot): bir kişinin kaydı herkesin ekranına anında gelir.
   - Kayıt: Google ile giriş + Firestore'da Editors/<e-posta> dokümanı.
   - Dokümanlar Firestore'a {j: "<JSON metni>"} olarak yazılır (Firestore iç içe dizileri desteklemiyor; ör. bands [[3.25,150]]).
   - Sağ alttaki çubuk: giriş/çıkış, "Download JSON" (aktarım md'si için yedek), veritabanı boşsa ilk yükleme. */
(function(){
  const CFG = window.HFP_FIREBASE;
  if (!CFG || !CFG.apiKey || (window.claude && window.claude.use)) return;   // ayar yoksa: JSON'dan salt okunur
  const V = "10.12.2", BASE = "https://www.gstatic.com/firebasejs/" + V + "/";
  const loadJs = src => new Promise((ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("load " + src)); document.head.appendChild(s); });

  let fs = null, auth = null, user = null, isEditor = false;
  const ready = (async () => {
    await loadJs(BASE + "firebase-app-compat.js");
    await Promise.all([loadJs(BASE + "firebase-auth-compat.js"), loadJs(BASE + "firebase-firestore-compat.js")]);
    const app = firebase.initializeApp(CFG);
    fs = firebase.firestore(app); auth = firebase.auth(app);
    user = await new Promise(res => { const off = auth.onAuthStateChanged(u => { off(); res(u); }); });
    if (user && user.email) {
      try { isEditor = (await fs.collection("Editors").doc(user.email.toLowerCase()).get()).exists; } catch (e) { isEditor = false; }
    }
    bar();
  })();

  const dec = raw => { if (!raw) return raw; if (typeof raw.j === "string") { try { return JSON.parse(raw.j); } catch (e) { return null; } } return raw; };
  const enc = obj => ({ j: JSON.stringify(obj) });
  const mapErr = e => { const c = e && e.code; const o = new Error((e && e.message) || "error");
    o.code = c === "permission-denied" || c === "unauthenticated" ? "invalid_argument" : c === "resource-exhausted" ? "quota_exceeded" : c; return o; };
  const snapDoc = d => ({ exists: !!d.exists, id: d.id, data: () => dec(d.data()) });
  const ref = path => { const [col, id] = path.split("/"); return fs.collection(col).doc(id); };

  const db = {
    collection(name) { return {
      onSnapshot(cb, err) { let off = () => {}, dead = false;
        ready.then(() => { if (!dead) off = fs.collection(name).onSnapshot(s => cb({ docs: s.docs.map(snapDoc) }), e => err && err(mapErr(e))); }, e => err && err(e));
        return () => { dead = true; off(); }; },
      async get() { await ready; const s = await fs.collection(name).get(); return { docs: s.docs.map(snapDoc) }; }
    }; },
    doc(path) { return {
      onSnapshot(cb, err) { let off = () => {}, dead = false;
        ready.then(() => { if (!dead) off = ref(path).onSnapshot(d => cb(snapDoc(d)), e => err && err(mapErr(e))); }, e => err && err(e));
        return () => { dead = true; off(); }; },
      async get() { await ready; return snapDoc(await ref(path).get()); },
      async set(body) { await ready; try { await ref(path).set(enc(body)); } catch (e) { throw mapErr(e); } },
      async delete() { await ready; try { await ref(path).delete(); } catch (e) { throw mapErr(e); } }
    }; }
  };
  const usr = { async can() { await ready; return isEditor; } };
  window.claude = { use: async k => { await ready; return k === "db" ? db : k === "user" ? usr : null; } };

  /* ---- sağ alt çubuk ---- */
  const sortKeys = v => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === "object" ? Object.keys(v).sort().reduce((o, k) => (o[k] = sortKeys(v[k]), o), {}) : v;
  async function exportJson() {
    const [a, s] = await Promise.all([fs.collection("airports").get(), fs.collection("settings").get()]);
    const out = { airports: {}, settings: {} };
    a.docs.forEach(d => { const x = dec(d.data()); if (x && x.icao) out.airports[x.icao] = x; });
    s.docs.forEach(d => { if (d.id === "fuel" || d.id === "fx") out.settings[d.id] = dec(d.data()); });
    const blob = new Blob([JSON.stringify(sortKeys(out))], { type: "application/json" });
    const u = URL.createObjectURL(blob), l = document.createElement("a");
    l.href = u; l.download = "handling-database.json"; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  async function importJson(btn) {
    if (!confirm("handling-database.json içindeki bütün meydanlar ve ayarlar Firebase'e yazılacak. Devam?")) return;
    btn.disabled = true; btn.textContent = "Importing…";
    try {
      const r = await fetch("handling-database.json", { cache: "no-store" }); const j = await r.json();
      const ap = j.airports || {}; const list = (Array.isArray(ap) ? ap : Object.values(ap)).filter(x => x && x.icao);
      const writes = list.map(x => [fs.collection("airports").doc(x.icao), x]);
      Object.entries(j.settings || {}).forEach(([k, v]) => writes.push([fs.collection("settings").doc(k), v]));
      for (let i = 0; i < writes.length; i += 400) { const b = fs.batch(); writes.slice(i, i + 400).forEach(([r, v]) => b.set(r, enc(v))); await b.commit(); }
      btn.remove(); alert(list.length + " airports imported.");
    } catch (e) { btn.disabled = false; btn.textContent = "Import failed — retry"; alert("Import failed: " + (e.message || e)); }
  }
  function bar() {
    const css = document.createElement("style");
    css.textContent = `#hfp-fb{position:fixed;right:14px;bottom:14px;z-index:50;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;
      background:var(--panel,#fff);color:var(--ink,#222);border:1px solid var(--line,#ddd);border-radius:10px;padding:6px 8px 6px 12px;font:13px var(--f-body,system-ui);box-shadow:0 4px 16px rgba(0,0,0,.18)}
      #hfp-fb button{font:inherit;font-weight:600;border:1px solid var(--line,#ccc);background:var(--panel-2,#f6f6f6);color:var(--ink,#222);border-radius:7px;padding:5px 10px;cursor:pointer}
      #hfp-fb button.pri{background:var(--accent,#a3414c);border-color:var(--accent,#a3414c);color:#fff}
      #hfp-fb .who{color:var(--ink-2,#555)} #hfp-fb .ro{color:var(--muted,#888)}
      @media print{#hfp-fb{display:none}}`;
    document.head.appendChild(css);
    const el = document.createElement("div"); el.id = "hfp-fb";
    const add = (txt, fn, cls) => { const b = document.createElement("button"); b.type = "button"; b.textContent = txt; if (cls) b.className = cls; b.onclick = () => fn(b); el.appendChild(b); return b; };
    const span = (txt, cls) => { const s = document.createElement("span"); s.className = cls; s.textContent = txt; el.appendChild(s); };
    if (!user) {
      add("Sign in to edit", async () => { try { await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); location.reload(); } catch (e) { if (e && e.code !== "auth/popup-closed-by-user") alert("Sign-in failed: " + (e.message || e)); } }, "pri");
    } else {
      span(user.email + (isEditor ? "" : " · view only"), isEditor ? "who" : "ro");
      if (isEditor) {
        add("Download JSON", () => exportJson().catch(e => alert("Export failed: " + (e.message || e))));
        fs.collection("airports").limit(1).get().then(s => { if (s.empty) add("Import data", importJson, "pri"); }, () => {});
      }
      add("Sign out", async () => { await auth.signOut(); location.reload(); });
    }
    document.body.appendChild(el);
  }
})();

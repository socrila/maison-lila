(() => {
  const APP_KEY = "maison-lila-simple-v1";
  const CONFIG_KEY = "maison-lila-supabase-config";
  const TABLE = "maison_lila_app_states";
  let client = null;
  let user = null;
  let timer = null;
  let applying = false;
  const state = { url: "", anonKey: "", email: "", status: "Cloud non connecte" };

  const json = (value, fallback = null) => { try { return JSON.parse(value); } catch { return fallback; } };
  const localData = () => json(localStorage.getItem(APP_KEY));
  const saveLocal = (data) => { applying = true; localStorage.setItem(APP_KEY, JSON.stringify(data)); applying = false; };
  const loadConfig = () => Object.assign(state, json(localStorage.getItem(CONFIG_KEY), {}));
  const saveConfig = () => localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: state.url.trim(), anonKey: state.anonKey.trim(), email: state.email.trim() }));

  function setStatus(message, ok = false) {
    state.status = message;
    const label = document.querySelector("[data-cloud-status]");
    const button = document.querySelector("[data-cloud-button]");
    if (label) label.textContent = message;
    if (button) {
      button.textContent = ok ? "Cloud actif" : "Cloud";
      button.dataset.connected = ok ? "true" : "false";
    }
  }

  function makeClient() {
    if (!state.url || !state.anonKey || !window.supabase) return null;
    client = window.supabase.createClient(state.url, state.anonKey, { auth: { persistSession: true, storageKey: "maison-lila-supabase-auth" } });
    return client;
  }

  async function refreshUser() {
    if (!client) return null;
    const { data } = await client.auth.getUser();
    user = data?.user || null;
    return user;
  }

  async function pushCloud({ silent = false } = {}) {
    if (!client) makeClient();
    const currentUser = await refreshUser();
    if (!client || !currentUser) { if (!silent) setStatus("Connecte-toi au Cloud"); return false; }
    const payload = localData();
    if (!payload) { if (!silent) setStatus("Aucune donnee locale a envoyer"); return false; }
    const { error } = await client.from(TABLE).upsert({ user_id: currentUser.id, payload, updated_at: new Date().toISOString() });
    if (error) { setStatus("Erreur Cloud : " + error.message); return false; }
    setStatus("Donnees sauvegardees dans le Cloud", true);
    return true;
  }

  async function pullCloud({ ask = true } = {}) {
    if (!client) makeClient();
    const currentUser = await refreshUser();
    if (!client || !currentUser) { setStatus("Connecte-toi au Cloud"); return false; }
    const { data, error } = await client.from(TABLE).select("payload, updated_at").eq("user_id", currentUser.id).maybeSingle();
    if (error) { setStatus("Erreur Cloud : " + error.message); return false; }
    if (!data?.payload) { setStatus("Premiere sauvegarde Cloud en cours", true); return pushCloud(); }
    if (ask && !confirm("Remplacer les donnees de cet appareil par les donnees sauvegardees dans Supabase ?")) return false;
    saveLocal(data.payload);
    setStatus("Donnees recuperees, rechargement", true);
    setTimeout(() => location.reload(), 350);
    return true;
  }

  async function login(email, password) {
    if (!email || !password) { setStatus("Email et mot de passe requis"); return; }
    saveConfig();
    makeClient();
    if (!client) { setStatus("Configuration Supabase incomplete"); return; }
    let result = await client.auth.signInWithPassword({ email, password });
    if (result.error) result = await client.auth.signUp({ email, password });
    if (result.error) { setStatus("Connexion impossible : " + result.error.message); return; }
    await refreshUser();
    if (!user) { setStatus("Compte cree. Verifie tes emails si Supabase le demande."); return; }
    setStatus("Cloud connecte", true);
    await pullCloud({ ask: false });
  }

  function schedulePush() {
    if (applying || !client || !user) return;
    clearTimeout(timer);
    timer = setTimeout(() => pushCloud({ silent: true }), 900);
  }

  function patchStorage() {
    const original = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key, value) => { original(key, value); if (key === APP_KEY) schedulePush(); };
  }

  function readPanel(backdrop) {
    state.url = backdrop.querySelector("#cloudUrl").value.trim();
    state.anonKey = backdrop.querySelector("#cloudAnonKey").value.trim();
    state.email = backdrop.querySelector("#cloudEmail").value.trim();
    saveConfig();
    makeClient();
  }

  function injectUi() {
    const style = document.createElement("style");
    style.textContent = ".cloud-sync-button{position:fixed;right:18px;bottom:84px;z-index:70;border:0;border-radius:999px;padding:11px 16px;background:rgba(255,255,255,.92);color:#6f5750;box-shadow:0 18px 48px rgba(96,70,62,.18);font:700 13px/1 'DM Sans',system-ui,sans-serif;cursor:pointer}.cloud-sync-button[data-connected=true]{background:#6f8f75;color:#fff}.cloud-sync-backdrop{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:18px;background:rgba(50,39,36,.28)}.cloud-sync-backdrop[hidden]{display:none}.cloud-sync-panel{width:min(520px,100%);border-radius:28px;padding:24px;background:var(--card,#fffaf7);color:var(--text,#342621);box-shadow:0 28px 80px rgba(55,39,34,.26)}.cloud-sync-panel h2{margin:0 0 8px;font-size:1.45rem}.cloud-sync-panel p{margin:0 0 16px;color:var(--muted,#846e66);line-height:1.5}.cloud-sync-grid{display:grid;gap:12px}.cloud-sync-grid label{display:grid;gap:6px;color:var(--muted,#846e66);font-weight:700;font-size:.82rem}.cloud-sync-grid input{width:100%;border:1px solid rgba(111,87,80,.22);border-radius:16px;padding:12px 13px;background:rgba(255,255,255,.75);color:inherit;font:inherit}.cloud-sync-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.cloud-sync-actions button{border:0;border-radius:999px;padding:11px 14px;background:#efe3dd;color:#6f5750;font-weight:800;cursor:pointer}.cloud-sync-actions button:first-child{background:#6f5750;color:white}.cloud-sync-note{margin-top:14px;padding:12px;border-radius:18px;background:rgba(111,143,117,.12);color:#56705b;font-size:.9rem}@media(max-width:760px){.cloud-sync-button{right:14px;bottom:76px;padding:10px 13px}.cloud-sync-panel{border-radius:24px;padding:20px}}";
    document.head.appendChild(style);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "cloud-sync-button";
    button.dataset.cloudButton = "true";
    button.textContent = "Cloud";
    document.body.appendChild(button);

    const backdrop = document.createElement("div");
    backdrop.className = "cloud-sync-backdrop";
    backdrop.dataset.cloudBackdrop = "true";
    backdrop.hidden = true;
    backdrop.innerHTML = `<section class="cloud-sync-panel" role="dialog" aria-modal="true" aria-labelledby="cloudTitle"><h2 id="cloudTitle">Synchronisation Cloud</h2><p>Connecte Maison Lila au projet Supabase choisi. Les donnees sont rangees dans une table separee, sans toucher aux tables du boulot.</p><div class="cloud-sync-grid"><label>URL Supabase<input id="cloudUrl" type="url" autocomplete="off" placeholder="https://xxxxx.supabase.co"></label><label>Cle anon publique<input id="cloudAnonKey" type="password" autocomplete="off" placeholder="eyJ..."></label><label>Email<input id="cloudEmail" type="email" autocomplete="email" placeholder="ton@email.fr"></label><label>Mot de passe<input id="cloudPassword" type="password" autocomplete="current-password" placeholder="Minimum 6 caracteres"></label></div><div class="cloud-sync-actions"><button type="button" data-cloud-login>Se connecter</button><button type="button" data-cloud-push>Envoyer cet appareil</button><button type="button" data-cloud-pull>Recuperer le Cloud</button><button type="button" data-cloud-close>Fermer</button></div><div class="cloud-sync-note" data-cloud-status>Cloud non connecte</div></section>`;
    document.body.appendChild(backdrop);

    button.addEventListener("click", () => {
      backdrop.hidden = false;
      backdrop.querySelector("#cloudUrl").value = state.url || "";
      backdrop.querySelector("#cloudAnonKey").value = state.anonKey || "";
      backdrop.querySelector("#cloudEmail").value = state.email || "";
    });
    backdrop.addEventListener("click", (event) => { if (event.target === backdrop) backdrop.hidden = true; });
    backdrop.querySelector("[data-cloud-close]").addEventListener("click", () => backdrop.hidden = true);
    backdrop.querySelector("[data-cloud-login]").addEventListener("click", () => { readPanel(backdrop); login(state.email, backdrop.querySelector("#cloudPassword").value); });
    backdrop.querySelector("[data-cloud-push]").addEventListener("click", () => { readPanel(backdrop); pushCloud(); });
    backdrop.querySelector("[data-cloud-pull]").addEventListener("click", () => { readPanel(backdrop); pullCloud(); });
    setStatus(state.status, Boolean(user));
  }

  async function boot() {
    loadConfig();
    injectUi();
    patchStorage();
    if (!window.supabase) { setStatus("Librairie Supabase non chargee"); return; }
    if (!makeClient()) return;
    if (await refreshUser()) { setStatus("Cloud connecte", true); await pullCloud({ ask: false }); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

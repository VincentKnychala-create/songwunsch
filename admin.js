(() => {
  const loginForm = document.querySelector("#login-form");
  const loginStatus = document.querySelector("#login-status");
  const dashboard = document.querySelector("#dashboard");
  const requestsEl = document.querySelector("#requests");
  const countEl = document.querySelector("#count");
  const configured = window.SUPABASE_URL?.startsWith("https://") &&
    window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.startsWith("DEIN_");
  if (!configured) {
    loginStatus.textContent = "Zuerst config.js mit deinem Supabase-Projekt verbinden.";
    loginStatus.className = "status error";
    loginForm.querySelector("button").disabled = true; return;
  }
  const db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  let channel;
  const showError = msg => { loginStatus.textContent = msg; loginStatus.className = "status error"; };
  async function loadRequests() {
    const { data, error } = await db.from("song_requests").select("*").order("created_at", {ascending:false});
    if (error) { requestsEl.innerHTML = '<p class="empty">Laden fehlgeschlagen. Prüfe die Datenbank-Berechtigungen.</p>'; return; }
    countEl.textContent = `${data.length} ${data.length === 1 ? "Songwunsch" : "Songwünsche"}`;
    requestsEl.replaceChildren();
    if (!data.length) { requestsEl.innerHTML = '<p class="empty">Noch keine Songwünsche.</p>'; return; }
    data.forEach(item => {
      const card = document.createElement("article"); card.className = "request";
      const head = document.createElement("div"); head.className = "request-head";
      const left = document.createElement("div"); const title = document.createElement("h3");
      title.textContent = item.song; const by = document.createElement("div"); by.className = "by"; by.textContent = `Von ${item.name}`;
      left.append(title,by); const time = document.createElement("time");
      time.textContent = new Date(item.created_at).toLocaleString("de-DE");
      head.append(left,time); card.append(head);
      if (item.message) { const msg = document.createElement("p"); msg.className = "message"; msg.textContent = item.message; card.append(msg); }
      const statusText = document.createElement("p");
statusText.textContent =
  item.status === "approved" ? "😊 Ihr Song wurde angenommen!" :
  item.status === "rejected" ? "😢 Ihr Song wurde abgelehnt." :
  "🕒 Ihr Song wird überprüft.";
card.append(statusText);

const approve = document.createElement("button");
approve.textContent = "😊 Annehmen";
approve.addEventListener("click", async () => {
  const { error } = await db.from("song_requests")
    .update({ status: "approved" }).eq("id", item.id);
  if (error) alert("Status konnte nicht geändert werden.");
  else loadRequests();
});

const reject = document.createElement("button");
reject.textContent = "😢 Ablehnen";
reject.addEventListener("click", async () => {
  const { error } = await db.from("song_requests")
    .update({ status: "rejected" }).eq("id", item.id);
  if (error) alert("Status konnte nicht geändert werden.");
  else loadRequests();
});

card.append(approve, reject);
      const del = document.createElement("button"); del.className = "delete"; del.textContent = "Wunsch löschen";
      del.addEventListener("click", async () => { if (confirm("Diesen Songwunsch löschen?")) { const {error} = await db.from("song_requests").delete().eq("id",item.id); if(error) alert("Löschen nicht möglich."); else loadRequests(); }});
      card.append(del); requestsEl.append(card);
    });
  }
  async function startDashboard() {
    loginForm.hidden = true; dashboard.hidden = false;
    await loadRequests();
    channel = db.channel("song-requests-live").on("postgres_changes",
      {event:"*",schema:"public",table:"song_requests"}, () => loadRequests()).subscribe();
  }
  loginForm.addEventListener("submit", async e => {
    e.preventDefault(); loginStatus.textContent = "Anmeldung läuft …";
    const {error} = await db.auth.signInWithPassword({
      email: document.querySelector("#email").value,
      password: document.querySelector("#password").value
    });
    if(error) { showError("Anmeldung fehlgeschlagen. E-Mail und Passwort prüfen."); return; }
    await startDashboard();
  });
  document.querySelector("#logout").addEventListener("click", async () => {
    if(channel) await db.removeChannel(channel);
    await db.auth.signOut(); dashboard.hidden = true; loginForm.hidden = false; loginForm.reset();
  });
  db.auth.getSession().then(({data}) => { if(data.session) startDashboard(); });
})();

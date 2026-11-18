(() => {
  const form = document.querySelector("#request-form");
  const status = document.querySelector("#status");
  const button = document.querySelector("#submit");
  const configured = window.SUPABASE_URL?.startsWith("https://") &&
    window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.startsWith("DEIN_");
  if (!configured) {
    status.textContent = "Die Website muss noch mit der Datenbank verbunden werden.";
    status.className = "status error";
    button.disabled = true;
    return;
  }
  const db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

db.from("page_views").insert({}).then(({ error }) => {
  if (error) console.error("Besuch konnte nicht gezählt werden:", error);
});
  form.addEventListener("submit", async e => {
    e.preventDefault();
    button.disabled = true; status.textContent = "Wird gesendet …"; status.className = "status";
    const values = new FormData(form);
    const { error } = await db.from("song_requests").insert({
      name: String(values.get("name")).trim(),
      song: String(values.get("song")).trim(),
      message: String(values.get("message") || "").trim()
    });
    button.disabled = false;
    if (error) {
      status.textContent = "Das hat leider nicht geklappt. Bitte versuche es erneut.";
      status.className = "status error";
    } else {
      form.reset(); status.textContent = "Danke! Dein Songwunsch ist angekommen. 🖤";
      status.className = "status success";
    }
  });
})();

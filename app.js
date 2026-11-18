
(() => {
  const form = document.querySelector("#request-form");
  const status = document.querySelector("#status");
  const button = document.querySelector("#submit");

  const checkButton = document.querySelector("#check-status");
  const codeInput = document.querySelector("#request-code");
  const resultEl = document.querySelector("#lookup-result");

  const configured =
    window.SUPABASE_URL?.startsWith("https://") &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_ANON_KEY.startsWith("DEIN_");

  if (!configured) {
    status.textContent =
      "Die Website muss noch mit der Datenbank verbunden werden.";
    status.className = "status error";
    button.disabled = true;
    return;
  }

  const db = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

  // Seitenaufruf zählen
  db.from("page_views").insert({}).then(({ error }) => {
    if (error) {
      console.error("Besuch konnte nicht gezählt werden:", error);
    }
  });

  // Songwunsch absenden
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const values = new FormData(form);

    const requestCode = crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase();

    button.disabled = true;
    status.textContent = "Wird gesendet ...";
    status.className = "status";

    const { error } = await db.from("song_requests").insert({
      name: String(values.get("name")).trim(),
      song: String(values.get("song")).trim(),
      message: String(values.get("message") || "").trim(),
      status: "pending",
      request_code: requestCode
    });

    button.disabled = false;

    if (error) {
      console.error(error);
      status.textContent =
        "Das hat leider nicht geklappt. Bitte versuche es erneut.";
      status.className = "status error";
    } else {
      form.reset();
      status.textContent =
        "🕒 Ihr Song wird überprüft. Dein persönlicher Code: " +
        requestCode;
      status.className = "status success";
    }
  });

  // Status mit persönlichem Code überprüfen
  checkButton.addEventListener("click", async () => {
    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
      resultEl.textContent =
        "Bitte gib deinen persönlichen Code ein.";
      return;
    }

    checkButton.disabled = true;
    resultEl.textContent = "Status wird geprüft ...";

    try {
      const { data, error } = await db.rpc("check_song_request", {
        p_code: code
      });

      if (error) {
        console.error(error);
        resultEl.textContent =
          "Fehler beim Abrufen des Status.";
      } else if (!data || data.length === 0) {
        resultEl.textContent = "Code nicht gefunden.";
      } else {
        const songStatus = data[0].status;

        resultEl.textContent =
          songStatus === "approved"
            ? "😊 Ihr Song wurde angenommen!"
            : songStatus === "rejected"
            ? "😢 Ihr Song wurde abgelehnt."
            : "🕒 Ihr Song wird überprüft.";
      }
    } catch (error) {
      console.error(error);
      resultEl.textContent =
        "Es ist ein Fehler aufgetreten.";
    }

    checkButton.disabled = false;
  });
})();

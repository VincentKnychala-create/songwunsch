
(() => {
  const list = document.querySelector("#requests");
  const message = document.querySelector("#message");

  const configured =
    window.SUPABASE_URL?.startsWith("https://") &&
    window.SUPABASE_ANON_KEY &&
    window.supabase;

  if (!configured) {
    if (message) {
      message.textContent = "Datenbankverbindung fehlt.";
    }
    return;
  }

  const db = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

  async function loadRequests() {
    if (!list) return;

    list.textContent = "Songwünsche werden geladen ...";

    const { data, error } = await db
      .from("song_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      list.textContent =
        "Fehler beim Laden. Bitte Datenbank-Berechtigungen prüfen.";
      return;
    }

    list.innerHTML = "";

    if (!data || data.length === 0) {
      list.textContent = "Noch keine Songwünsche vorhanden.";
      return;
    }

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "request-card";

      const name = document.createElement("h3");
      name.textContent = item.name;

      const song = document.createElement("p");
      song.textContent = "🎵 " + item.song;

      const note = document.createElement("p");
      note.textContent = item.message || "Keine Nachricht";

      const statusText = document.createElement("p");
      statusText.textContent =
        item.status === "approved"
          ? "😊 Angenommen"
          : item.status === "rejected"
          ? "😢 Abgelehnt"
          : "🕒 Wird überprüft";

      const approve = document.createElement("button");
      approve.textContent = "😊 Annehmen";

      approve.addEventListener("click", async () => {
        await updateStatus(item.id, "approved");
      });

      const reject = document.createElement("button");
      reject.textContent = "😢 Ablehnen";

      reject.addEventListener("click", async () => {
        await updateStatus(item.id, "rejected");
      });

      const remove = document.createElement("button");
      remove.textContent = "🗑️ Löschen";

      remove.addEventListener("click", async () => {
        if (!confirm("Songwunsch wirklich löschen?")) return;

        const { error } = await db
          .from("song_requests")
          .delete()
          .eq("id", item.id);

        if (error) {
          alert("Löschen fehlgeschlagen.");
          console.error(error);
        } else {
          loadRequests();
        }
      });

      card.append(
        name,
        song,
        note,
        statusText,
        approve,
        reject,
        remove
      );

      list.appendChild(card);
    });
  }

  async function updateStatus(id, newStatus) {
    const { error } = await db
      .from("song_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Status konnte nicht geändert werden.");
      console.error(error);
    } else {
      loadRequests();
    }
  }

  loadRequests();
})();

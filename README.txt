SONGWUNSCH-WEBSITE – EINRICHTUNG

Die Dateien enthalten:
- index.html: öffentliche Songwunsch-Seite für Handys
- admin.html: privates Dashboard für deinen Laptop
- config.js: Verbindung zu Supabase
- database.sql: Datenbank und Zugriffsregeln

WICHTIG: Die Website ist vorbereitet, aber noch nicht online. Für echte Nachrichten
muss ein Supabase-Projekt eingerichtet und die Website veröffentlicht werden.

1) Datenbank einrichten
- Öffne https://supabase.com/ und erstelle ein kostenloses Projekt.
- Bestätige deine E-Mail und bewahre dein Projekt-Passwort sicher auf.
- Öffne im Projekt den SQL Editor, füge database.sql ein und führe es aus.
- Öffne Authentication > Users und lege deinen Admin-Benutzer an:
  Add user / Create new user. Verwende deine eigene E-Mail und ein sicheres Passwort.
- Deaktiviere öffentliche Registrierung (Authentication > Providers > Email:
  Disable sign-ups), damit nicht jeder einen Admin-Account erstellen kann.

2) Website verbinden
- Öffne Project Settings > API.
- Kopiere Project URL und den anon/public Key.
- Trage beides in config.js ein und speichere.
- NIEMALS den service_role Key in config.js oder in eine Website kopieren.

3) Veröffentlichen
- Lade den gesamten Ordner in ein GitHub-Repository hoch.
- Aktiviere im Repository Settings > Pages > Deploy from a branch > main > /(root).
- GitHub zeigt dir danach die öffentliche Website-Adresse.
- Die Besucher öffnen die Adresse; dein Dashboard ist dieselbe Adresse plus /admin.html
  (z.B. https://DEINNAME.github.io/REPO/admin.html).

4) Testen
- Öffne die öffentliche Seite auf deinem Handy und sende einen Testwunsch.
- Öffne /admin.html auf deinem Laptop und melde dich mit deinem Admin-Benutzer an.
- Neue Songwünsche sollten automatisch erscheinen.

SICHERHEIT
- Das Admin-Dashboard ist durch Supabase-Anmeldung geschützt.
- Besucher können nur neue Wünsche eintragen; sie können keine Wünsche lesen.
- Teile den Admin-Link nicht als Ersatz für ein Passwort.
- Ein öffentliches Formular kann Spam erhalten. Für den Start ist es bewusst einfach gehalten.
- Kostenlose Tarife haben Nutzungsgrenzen; bei sehr viel Traffic oder Datenbanknutzung
  kann später ein kostenpflichtiger Tarif nötig werden.

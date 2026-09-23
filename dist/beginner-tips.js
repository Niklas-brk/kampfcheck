/**
 * Freiwillige Einstiegshilfe für Rechner, Team-Baukasten und Bibliothek.
 * Dieses Modul enthält nur feste Erklärungstexte. Der Controller entscheidet,
 * ob die Hilfe sichtbar ist, und speichert die gewählte Einstellung.
 */
(function (root) {
  "use strict";

  const html = root.KampfView.html;

  function calculatorTips(doubles) {
    return [
      {
        title: "Wer greift zuerst an?",
        text: "Zuerst zählt die Attackenpriorität, danach die Initiative. Bizarroraum kehrt nur die Initiative-Reihenfolge innerhalb derselben Priorität um. Bei Gleichstand ist der Erstangriff nicht sicher.",
      },
      {
        title: "Schaden ist eine Spanne",
        text: "Der Schaden schwankt zwischen Minimum und Maximum. Die KO-Chance setzt voraus, dass die Attacke trifft; spätere Effekte am Rundenende sind nicht enthalten. Trage die aktuellen KP ein und prüfe auch den höchsten Schaden.",
      },
      {
        title: "Gegnerwerte sind Annahmen",
        text: "Die Vorschau verrät dir keine Statuspunkte. Solange du Wesen, Item oder Fähigkeit nicht kennst, vergleiche mehrere plausible Varianten. Das Ergebnis gilt immer für deine eingetragenen Werte.",
      },
      doubles
        ? {
            title: "Im Doppel das ganze Feld prüfen",
            text: "Rückenwind, Schutzschirme und Partnerboni können das Ergebnis ändern. Prüfe bei Flächenattacken, ob mehrere Ziele getroffen werden. Der Rechner betrachtet einen Angriff; zwei gegnerische Angriffe können zusammen zum KO führen.",
          }
        : {
            title: "Im Einzel auch ans Wechseln denken",
            text: "Vergleiche, welches Teammitglied die erwartete Attacke abfangen kann. Wenig Schaden in diesem Vergleich bedeutet noch keinen sicheren Wechsel: Eine andere gegnerische Attacke kann deutlich gefährlicher sein.",
          },
    ];
  }

  function teamTips(doubles) {
    return [
      {
        title: "Angriff oder Spezial-Angriff?",
        text: "Physische Attacken nutzen meist Angriff gegen Verteidigung, spezielle Attacken Spezial-Angriff gegen Spezial-Verteidigung. Wähle passende Attacken und verteile deine Statuspunkte entsprechend; einzelne Attacken haben Sonderregeln.",
      },
      {
        title: "Wesen an den Plan anpassen",
        text: "Rot mit ↑ zeigt den durch das Wesen erhöhten Wert, Blau mit ↓ den gesenkten. Neutrale Wesen ändern nichts. Senke möglichst einen Wert, den dein Pokémon für seine Aufgabe wenig braucht.",
      },
      doubles
        ? {
            title: "Partner statt Einzelkämpfer planen",
            text: "Überlege, welches Pokémon angreift und welches Tempo oder Unterstützung liefert. Schutzschild kann ein bedrohtes Pokémon schützen, während sein Partner handelt. Prüfe, ob dein Pokémon die gewünschte Attacke lernen kann.",
          }
        : {
            title: "Schwächen gemeinsam abdecken",
            text: "Plane Pokémon ein, die in Schwächen ihrer Teammitglieder einwechseln können. Der Typencheck zeigt nur Typen: Fähigkeiten und Items können das tatsächliche Ergebnis verändern. Prüfe wichtige Situationen im Rechner.",
          },
      {
        title: "Deinem Team einen Namen geben",
        text: "Mit „Team speichern“ legst du einen benannten Stand in „Meine Teams“ ab. Das Übernehmen in den Rechner ersetzt diesen Schritt nicht. Ein Name wie „Regen – Version 2“ hilft dir beim Vergleichen.",
      },
    ];
  }

  function libraryTips() {
    return [
      {
        title: "Teams wiederfinden",
        text: "Gib jedem Team einen erkennbaren Namen. Eigene Teams und Gegnerteams haben getrennte Listen. Der gespeicherte Einzel- oder Doppelkampfmodus wird beim Öffnen wieder übernommen.",
      },
      {
        title: "Gegner als Ausgangspunkt nutzen",
        text: "Ein gespeichertes Gegnerteam spart Eingaben. Prüfe vor einem neuen Kampf trotzdem Pokémon, Items und bekannte Werte: Der aktuelle Gegner kann eine andere Variante spielen.",
      },
      {
        title: "Änderungen bewusst speichern",
        text: "Ein benanntes Team ist ein gespeicherter Stand. Speichere nach dem Bearbeiten erneut, wenn du die neue Version später wieder auswählen möchtest.",
      },
    ];
  }

  /** Keine Benutzereingaben im HTML: Alle Überschriften und Texte stehen oben fest. */
  function render(state) {
    const doubles = state.field?.gameType !== "Singles";
    const tips =
      state.view === "library"
        ? libraryTips()
        : state.view === "team"
          ? teamTips(doubles)
          : calculatorTips(doubles);

    return html`<aside class="beginner-tips" aria-labelledby="beginner-tips-title">
      <h2 id="beginner-tips-title">Tipps für den Einstieg</h2>
      ${
        state.view === "team" && doubles
          ? html`<p>
              Der Typencheck berücksichtigt nur Typen, keine Fähigkeiten oder Items. Prüfe wichtige
              Begegnungen zusätzlich im Rechner.
            </p>`
          : ""
      }
      <div class="beginner-tip-grid">
        ${tips
          .map(
            (tip) =>
              html`<article class="beginner-tip">
                <h3>${tip.title}</h3>
                <p>${tip.text}</p>
              </article>`,
          )
          .join("")}
      </div>
    </aside>`;
  }

  root.KampfBeginner = { render };
})(typeof window !== "undefined" ? window : globalThis);

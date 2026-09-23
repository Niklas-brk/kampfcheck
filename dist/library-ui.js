/** Dialoge und Ansichten für benannte eigene Teams und Gegnerteams. Die Speicherlogik ist ausgelagert.
 * Die Factory erhält ihre Abhängigkeiten und Rückrufe vom App-Controller.
 */
(function (root) {
  "use strict";
  const html = root.KampfView.html;
  root.createKampfLibraryUI = function ({
    state,
    esc,
    tr,
    sprite,
    itemIcon,
    render,
    save,
    savePreferences,
    toast,
  }) {
    const L = root.KampfLibrary,
      storage = {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
      };
    const stores = {
        own: L.create(storage),
        foe: L.create(storage, L.FOE_KEY),
      },
      teams = { own: [], foe: [] },
      errors = { own: "", foe: "" };
    let saveContext = null;
    const dialog = document.getElementById("save-team-dialog");
    function refresh(side = "own") {
      try {
        teams[side] = stores[side].load().teams;
        errors[side] = "";
        return true;
      } catch (e) {
        errors[side] = e.message;
        return false;
      }
    }
    refresh("own");
    refresh("foe");
    if (!state.example && !errors.own) {
      try {
        const migrated = stores.own.migrate(state.own, state.field.gameType);
        if (migrated) {
          state.ownLibraryId = migrated.id;
          state.ownName = migrated.name;
          save();
          refresh("own");
        }
      } catch (e) {
        errors.own = e.message;
      }
    }
    const find = (id, side = "own") => teams[side].find((t) => t.id === id);
    function source(side = state.view === "library" ? state.librarySide : "own") {
      const builder =
        side === "own" &&
        (state.view === "team" || (state.view === "library" && state.libraryReturn === "team"));
      const prefix = builder ? "builder" : side;
      return {
        side,
        builder,
        team: state[prefix],
        id: state[prefix + "LibraryId"],
        name: state[prefix + "Name"],
        mode: state.field.gameType,
      };
    }
    function name(side = "own") {
      return (
        find(state[side + "LibraryId"], side === "foe" ? "foe" : "own")?.name ||
        state[side + "Name"] ||
        (side === "foe" ? "Gegnerteam" : "Mein Team")
      );
    }
    function badge(side = "own") {
      const record = find(state[side + "LibraryId"], side === "foe" ? "foe" : "own");
      if (!record)
        return side === "foe" ? "Werte sind Annahmen" : "Noch nicht unter einem Namen gespeichert";
      let changed = true;
      try {
        changed =
          L.signature(state[side], state.field.gameType) !== L.signature(record.team, record.mode);
      } catch {}
      return `${esc(record.name)} · ${changed ? "ungespeicherte Änderungen" : "gespeichert"}`;
    }
    function beginBuilder() {
      state.builderLibraryId = state.ownLibraryId;
      state.builderName = name("own");
    }
    function adoptBuilder() {
      state.ownLibraryId = state.builderLibraryId;
      state.ownName = name("builder");
    }
    function newDraft(label) {
      state.builderLibraryId = null;
      state.builderName = String(label).slice(0, 60);
    }
    // Der Dialog hält eine Kopie fest; gespeichert wird erst bei ausdrücklicher Bestätigung.
    function openSave(renameId, side = state.view === "library" ? state.librarySide : "own") {
      if (!refresh(side)) {
        toast(errors[side]);
        return;
      }
      const record = renameId ? find(renameId, side) : null,
        current = source(side);
      saveContext = record
        ? { renameId: record.id, side }
        : { ...current, team: structuredClone(current.team) };
      const label =
          record?.name ||
          find(current.id, side)?.name ||
          current.name ||
          (side === "foe" ? "Gegnerteam" : "Mein Team"),
        title = record
          ? "Team umbenennen"
          : side === "foe"
            ? "Gegnerteam speichern"
            : "Team speichern";
      dialog.setAttribute("aria-label", title);
      dialog.innerHTML = html`<form id="team-name-form">
        <div class="dialog-head">
          <h2>${title}</h2>
          <button
            class="icon-button"
            type="button"
            data-close-save
            aria-label="Speichern schließen"
          >
            ×
          </button>
        </div>
        <label class="team-name-label" for="team-name"
          >Teamname<input
            id="team-name"
            name="teamName"
            type="text"
            value="${esc(label)}"
            maxlength="60"
            required
            autocomplete="off"
            placeholder="${side === "foe" ? "z. B. Gegner – Regen-Team" : "z. B. Mein Regen-Team"}"
        /></label>
        <p class="panel-intro">
          ${record ? "Der neue Name erscheint in deiner Teamübersicht." : find(current.id, side) ? "Speichere deine Änderungen oder lege unter einem anderen Namen eine neue Variante an." : side === "foe" ? "Speichert die sechs Pokémon deiner gegnerischen Vorschau mit Items, Wesen, Punkten und Attacken. Du findest sie anschließend unter „Gegnerteams“." : "Du findest dieses Team anschließend unter „Meine Teams“. Keine Datei nötig."}
        </p>
        <p id="team-save-error" class="library-error" role="alert"></p>
        <div class="save-dialog-actions">
          <button class="secondary-btn" type="button" data-close-save>Abbrechen</button
          >${!record && find(current.id, side) ? '<button class="secondary-btn" type="submit" name="intent" value="copy">Als neues Team speichern</button>' : ""}<button
            class="primary-btn"
            type="submit"
            name="intent"
            value="save"
          >
            ${record ? "Namen speichern" : find(current.id, side) ? "Änderungen speichern" : title}
          </button>
        </div>
      </form>`;
      dialog.showModal();
      dialog.querySelector("#team-name").focus();
      dialog.querySelector("#team-name").select();
    }
    dialog.addEventListener("click", (e) => {
      if (e.target.closest("[data-close-save]")) dialog.close();
    });
    dialog.addEventListener("submit", (e) => {
      e.preventDefault();
      const label = dialog.querySelector("#team-name").value,
        side = saveContext.side;
      try {
        let record;
        if (saveContext.renameId) record = stores[side].rename(saveContext.renameId, label);
        else {
          record = stores[side].upsert({
            id: e.submitter?.value === "copy" ? null : saveContext.id,
            name: label,
            team: saveContext.team,
            mode: saveContext.mode,
          });
          const prefix = saveContext.builder ? "builder" : side;
          state[prefix + "LibraryId"] = record.id;
          state[prefix + "Name"] = record.name;
          if (prefix === "own") {
            state.example = false;
            save();
          }
        }
        refresh(side);
        dialog.close();
        render();
        toast(
          saveContext.renameId
            ? "Teamname geändert."
            : `„${record.name}“ ist in ${side === "foe" ? "Gegnerteams" : "Meine Teams"} gespeichert.`,
        );
      } catch (err) {
        dialog.querySelector("#team-save-error").textContent = err.message;
      }
    });
    function openLibrary(side = "own") {
      state.libraryReturn = state.view === "team" ? "team" : "calc";
      state.librarySide = side;
      state.view = "library";
      refresh(side);
      render();
      window.scrollTo(0, 0);
    }
    // Das gewählte Ziel bestimmt, ob ein eigener Entwurf oder die Gegner-Vorschau geladen wird.
    function useTeam(id, edit) {
      const side = state.librarySide;
      if (!refresh(side)) {
        toast(errors[side]);
        return;
      }
      const r = find(id, side);
      if (!r) {
        toast("Das Team wurde nicht gefunden.");
        return;
      }
      state.field.gameType = r.mode;
      savePreferences();
      if (side === "foe") {
        state.foe = L.cleanTeam(r.team);
        state.foeLibraryId = r.id;
        state.foeName = r.name;
        state.foeIndex = 0;
        state.foeMove = 0;
        state.hits = 0;
        state.view = "calc";
      } else if (edit) {
        state.builder = L.cleanTeam(r.team);
        state.builderLibraryId = r.id;
        state.builderName = r.name;
        state.builderIndex = 0;
        state.builderTab = "editor";
        state.view = "team";
      } else {
        state.own = L.cleanTeam(r.team);
        state.ownLibraryId = r.id;
        state.ownName = r.name;
        state.ownIndex = 0;
        state.ownMove = 0;
        state.hits = 0;
        state.example = false;
        state.view = "calc";
        save();
      }
      render();
      if (side === "foe" && edit)
        document.getElementById("editor-foe").scrollIntoView({ block: "start" });
      else window.scrollTo(0, 0);
      toast(
        side === "foe"
          ? `„${r.name}“ ist als Gegnerteam ausgewählt.`
          : edit
            ? `„${r.name}“ zum Bearbeiten geöffnet.`
            : `„${r.name}“ ist im Rechner ausgewählt.`,
      );
    }
    function foeControls() {
      return '<div class="opponent-team-actions"><button class="secondary-btn" data-action="save-foe-team">Gegnerteam speichern</button><button class="secondary-btn" data-action="foe-teams">Gegnerteams auswählen</button></div>';
    }
    function view() {
      const side = state.librarySide,
        foe = side === "foe",
        current = source(side),
        list = teams[side];
      return html`<div class="library-view">
        <div class="workspace-title">
          <div>
            <button class="text-button back-button" data-action="close-library">
              ← ${state.libraryReturn === "team" ? "Zurück zum Team" : "Zum Rechner"}
            </button>
            <h1>${foe ? "Gegnerteams" : "Meine Teams"}</h1>
            <p>
              ${foe ? "Gespeicherte Gegner für deine Vorschau – direkt auswählen und vergleichen." : "Deine gespeicherten Teams – auswählen, bearbeiten und wieder spielen."}
            </p>
          </div>
          <div class="toolbar">
            <button class="primary-btn" data-action="save-named-team">
              ${foe ? "Aktuelles Gegnerteam speichern" : current.builder ? "Aktuellen Entwurf speichern" : "Aktuelles Team speichern"}
            </button>
          </div>
        </div>
        <div class="library-tabs" role="group" aria-label="Team-Bibliothek">
          <button data-action="library-side" data-value="own" aria-pressed="${!foe}">
            Eigene Teams</button
          ><button data-action="library-side" data-value="foe" aria-pressed="${foe}">
            Gegnerteams
          </button>
        </div>
        ${errors[side] ? html`<p class="library-error" role="alert">${esc(errors[side])}</p>` : ""}
        <div class="library-heading">
          <strong
            >${list.length}
            ${list.length === 1 ? "gespeichertes Team" : "gespeicherte Teams"}</strong
          ><span>Einzel- und Doppelkampf werden zusammen mit dem Team gespeichert.</span>
        </div>
        <div class="library-grid">
          ${list
            .map(
              (r) =>
                html`<article class="card saved-team-card">
                  <div class="saved-team-head">
                    <span class="tag">${r.mode === "Singles" ? "Einzelkampf" : "Doppelkampf"}</span
                    ><button
                      class="text-button"
                      data-action="rename-team"
                      data-value="${esc(r.id)}"
                      aria-label="${esc(r.name)} umbenennen"
                    >
                      Umbenennen
                    </button>
                  </div>
                  <h2>${esc(r.name)}</h2>
                  <p class="saved-date">
                    Gespeichert am
                    ${esc(new Date(r.updatedAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" }))}
                  </p>
                  <div class="saved-team-roster">
                    ${r.team.map((s) => html`<span>${sprite(s.species)}<strong>${esc(tr("species", s.species))}</strong>${itemIcon(s.item)}</span>`).join("")}
                  </div>
                  <div class="saved-team-actions">
                    <button
                      class="primary-btn"
                      data-action="use-saved-team"
                      data-value="${esc(r.id)}"
                      aria-label="${esc(r.name)} ${foe ? "als Gegner auswählen" : "im Rechner öffnen"}"
                    >
                      ${foe ? "Als Gegner auswählen" : "Im Rechner öffnen"}</button
                    ><button
                      class="secondary-btn"
                      data-action="edit-saved-team"
                      data-value="${esc(r.id)}"
                      aria-label="${esc(r.name)} bearbeiten"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </article>`,
            )
            .join("")}
        </div>
        ${
          !list.length && !errors[side]
            ? html`<section class="card library-empty">
                <h2>${foe ? "Deine Gegner schneller parat." : "Dein erstes Team wartet."}</h2>
                <p>
                  ${foe ? "Trage die sechs gegnerischen Pokémon in der Vorschau ein und speichere sie unter einem Namen. Danach reicht hier ein Klick, um sie erneut auszuwählen." : "Speichere dein aktuelles Team unter einem Namen. Danach kannst du hier jederzeit darauf zugreifen."}
                </p>
                <button class="primary-btn" data-action="save-named-team">
                  ${foe ? "Gegnerteam speichern" : "Team speichern"}
                </button>
              </section>`
            : ""
        }
      </div>`;
    }
    function handle(action, value) {
      if (action === "my-teams" || action === "foe-teams") {
        openLibrary(action === "foe-teams" ? "foe" : "own");
        return true;
      }
      if (action === "library-side") {
        state.librarySide = value === "foe" ? "foe" : "own";
        refresh(state.librarySide);
        render();
        return true;
      }
      if (action === "save-foe-team") {
        openSave(null, "foe");
        return true;
      }
      if (action === "save-named-team") {
        openSave();
        return true;
      }
      if (action === "rename-team") {
        openSave(value);
        return true;
      }
      if (action === "use-saved-team" || action === "edit-saved-team") {
        useTeam(value, action === "edit-saved-team");
        return true;
      }
      if (action === "close-library") {
        state.view = state.libraryReturn === "team" ? "team" : "calc";
        render();
        return true;
      }
      return false;
    }
    return {
      view,
      handle,
      beginBuilder,
      adoptBuilder,
      newDraft,
      name,
      badge,
      foeControls,
    };
  };
})(window);

/**
 * Nutzungsstatistiken und daraus abgeleitete Team-Entwürfe für Einzel/Doppel.
 * PokéKit liefert monatliche Showdown-Daten. Der Abrufzeitpunkt checked ist
 * deshalb nicht mit dem Datenmonat month oder einem aktuellen Reglement gleichzusetzen.
 * Ein eingebundener Snapshot hält die Funktion auch ohne Netz nutzbar.
 */
(function (root) {
  "use strict";
  const K = root.KampfCore,
    G = K.G,
    C = root.calc;
  const urls = {
    Singles: "https://poke.itlibra.com/opendata/usage-championssingles.json",
    Doubles: "https://poke.itlibra.com/opendata/usage-champions.json",
  };
  const feeds = { ...root.KampfMetaSnapshot.formats },
    status = { Singles: "snapshot", Doubles: "snapshot" },
    checked = {};
  /** Prüft die grundlegende Feed-Struktur; die Auswahl prüft zusätzlich Engine/Legalität. */
  function valid(d, mode) {
    return (
      d &&
      d.gameType === mode.toLowerCase() &&
      typeof d.label === "string" &&
      d.label.length < 100 &&
      /^\d{4}-\d{2}$/.test(d.month) &&
      Array.isArray(d.pokemon) &&
      d.pokemon.length > 5 &&
      d.pokemon.length <= 1000 &&
      d.pokemon.every(
        (p) =>
          typeof p.name === "string" &&
          Number.isFinite(p.usage) &&
          p.usage >= 0 &&
          p.usage <= 100 &&
          Array.isArray(p.items) &&
          Array.isArray(p.moves) &&
          Array.isArray(p.teammates),
      )
    );
  }
  // Getrennte Caches pro Spielmodus. Ein älterer Datenmonat darf den mitgelieferten
  // Snapshot nicht verdrängen; unlesbarer/blockierter Speicher ist kein Startfehler.
  for (const mode of Object.keys(urls)) {
    try {
      const cached = JSON.parse(localStorage.getItem("kampfcheck-meta-" + mode) || "null");
      if (cached && valid(cached.data, mode) && cached.data.month >= feeds[mode].month) {
        feeds[mode] = cached.data;
        checked[mode] = cached.checkedAt;
        status[mode] = "cached";
      }
    } catch {}
  }
  // Mehrere gleichzeitige Aufrufer teilen sich den laufenden Abruf je Spielmodus.
  const pending = {};
  /**
   * Aktualisiert nach frühestens 24 Stunden seit dem letzten erfolgreichen Abruf.
   * force umgeht diese Frist. notify informiert die Oberfläche nach Abschluss.
   * Fehler behalten den bisherigen Feed; ein erfolgreicher Abruf bedeutet noch
   * nicht, dass der Anbieter bereits Daten für einen neuen Monat veröffentlicht hat.
   */
  async function refresh(mode, notify, force = false) {
    if (pending[mode]) return pending[mode];
    if (!force && checked[mode] && Date.now() - Date.parse(checked[mode]) < 86400000) {
      notify?.();
      return;
    }
    status[mode] = "loading";
    pending[mode] = (async () => {
      try {
        const response = await fetch(urls[mode], {
          signal: AbortSignal.timeout(12000),
          credentials: "omit",
        });
        if (!response.ok) throw new Error("HTTP");
        const data = await response.json();
        if (!valid(data, mode) || data.month < feeds[mode].month) throw new Error("Data");
        feeds[mode] = data;
        status[mode] = "live";
        checked[mode] = new Date().toISOString();
        try {
          localStorage.setItem(
            "kampfcheck-meta-" + mode,
            JSON.stringify({ data, checkedAt: checked[mode] }),
          );
        } catch {}
      } catch {
        status[mode] = "offline";
      } finally {
        delete pending[mode];
        notify?.();
      }
    })();
    return pending[mode];
  }
  /**
   * Ergänzt ein von makeSet erzeugtes Set mit häufigen, verwendbaren Optionen.
   * Der Feed nennt Statuspunkte weiterhin evs; in Champions werden diese Werte
   * direkt als SP übernommen (sechs Werte, maximal 32 je Wert und 66 insgesamt).
   * usedItems wird für den gemeinsamen Team-Entwurf fortgeschrieben. Die einzelnen
   * Häufigkeiten ergeben kein nachgewiesenes Originalset eines bestimmten Spielers.
   */
  function usageSet(p, makeSet, usedItems = new Set()) {
    const s = makeSet(p.name),
      spread = p.spreads?.find(
        (x) =>
          G.natures.get(C.toID(x.nature)) &&
          Array.isArray(x.evs) &&
          x.evs.length === 6 &&
          x.evs.every((v) => Number.isInteger(v) && v >= 0 && v <= 32) &&
          x.evs.reduce((a, b) => a + b, 0) <= 66,
      );
    if (spread) {
      s.nature = spread.nature;
      s.points = Object.fromEntries(K.STATS.map((k, i) => [k, spread.evs[i]]));
    }
    const ability = p.abilities
      ?.map((a) => G.abilities.get(C.toID(a.id)))
      .find((a) => a && (!root.KampfLegality || root.KampfLegality.canAbility(s.species, a.name)));
    if (ability) s.ability = ability.name;
    const megaItem = root.KampfTeam.megaItem(p.name);
    const item = p.items
      .map((i) => G.items.get(C.toID(i.id)))
      .find(
        (i) =>
          i &&
          !usedItems.has(i.name) &&
          (!root.KampfLegality || root.KampfLegality.canItem(i.name)),
      );
    s.item = megaItem || item?.name || "";
    if (s.item) usedItems.add(s.item);
    const moves = p.moves
      .map((m) => G.moves.get(C.toID(m.id)))
      .filter((m) => m && (!root.KampfLegality || root.KampfLegality.canMove(s.species, m.name)))
      .slice(0, 4)
      .map((m) => m.name);
    if (moves.length === 4) s.moves = moves;
    return root.KampfLegality ? root.KampfLegality.prepare(s) : s;
  }
  /**
   * Bis zu drei Entwürfe: je ein häufiges Pokémon plus bevorzugte Teamkollegen.
   * Vermeidet doppelte Ausgangsformen und mehrere Mega-Formen; diese Vorschläge
   * sind automatisch zusammengestellt und keine belegten Turnierteams.
   */
  function suggestions(mode) {
    const data = feeds[mode],
      known = data.pokemon.filter(
        (p) =>
          G.species.get(C.toID(p.name)) &&
          (!root.KampfLegality || root.KampfLegality.available(p.name)),
      );
    return known
      .slice(0, 3)
      .map((seed) => {
        const chosen = [seed],
          base = (n) => root.KampfTeam.forms(n)[0]?.name || n;
        for (const p of [
          ...seed.teammates.map((t) => known.find((p) => p.id === t.id)).filter(Boolean),
          ...known,
        ]) {
          if (chosen.length === 6) break;
          if (chosen.some((c) => base(c.name) === base(p.name))) continue;
          if (p.name.includes("-Mega") && chosen.some((c) => c.name.includes("-Mega"))) continue;
          chosen.push(p);
        }
        return { seed: seed.name, pokemon: chosen };
      })
      .filter((x) => x.pokemon.length === 6);
  }
  // Die Oberfläche liest diese Objekte erneut nach dem notify-Aufruf.
  root.KampfMeta = { feeds, status, checked, refresh, usageSet, suggestions, urls };
})(window);

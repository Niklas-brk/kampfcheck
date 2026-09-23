/**
 * Gemeinsame Hilfen für die HTML-Ansichten.
 *
 * Der html-Tag liefert normales HTML als Text. Er ermöglicht dem Formatter,
 * auch verschachtelte Vorlagen lesbar einzurücken. Benutzereingaben müssen
 * weiterhin vor dem Einsetzen mit escapeHtml/esc maskiert werden.
 */
(function (root) {
  "use strict";

  function html(parts, ...values) {
    return parts.reduce((output, part, index) => {
      const value = index < values.length ? String(values[index]) : "";
      return output + part + value;
    }, "");
  }

  root.KampfView = { html };
})(typeof window !== "undefined" ? window : globalThis);

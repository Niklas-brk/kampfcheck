/** Prüft die verteilbaren Dateien, ohne ein Benutzerprofil zu öffnen. Nach package:app ausführen. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { listPackage, extractFile } from "@electron/asar";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePackage = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
const payload = path.join(root, "release", `payload-${sourcePackage.version}`);
const archive = path.join(payload, "app.asar");
const manifest = JSON.parse(await fs.readFile(path.join(payload, "release.json"), "utf8"));
const files = listPackage(archive).map((name) => name.replaceAll("\\", "/"));
const forbidden =
  /(?:^|\/)(?:\.git|\.env|node_modules|scripts|tests|\.cache|profile|user-data|teams)(?:[/.]|$)|\.map$/i;
assert.ok(
  files.every((name) => !forbidden.test(name)),
  "Entwicklungs- oder Profildatei im Paket",
);
const read = (name) => extractFile(archive, name.replaceAll("/", path.sep)).toString("utf8");
const packageData = JSON.parse(read("package.json"));
assert.deepEqual(Object.keys(packageData).sort(), ["main", "name", "productName", "version"]);
assert.equal(packageData.version, sourcePackage.version);
assert.equal(
  manifest.appSha256,
  createHash("sha256")
    .update(await fs.readFile(archive))
    .digest("hex"),
);
const html = read("dist/index.html");
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const file = match[1];
  if (/^(?:https?:|#|\.\/)/.test(file)) continue;
  assert.ok(files.includes(`/dist/${file}`), `Fehlende Ressource: ${file}`);
}
for (const file of files.filter((name) => /\.(?:js|cjs|json|html|css|md|txt)$/.test(name))) {
  const text = read(file.slice(1));
  assert.ok(
    !/[A-Z]:[\\/]Users[\\/]|BEGIN (?:RSA |EC )?PRIVATE KEY|sourceMappingURL/.test(text),
    `Privater Pfad oder Quellkarte: ${file}`,
  );
}
console.log(
  `Paketprüfung bestanden: ${files.length} Pfade, vollständige Ressourcen, keine Projekt-/Profildateien oder Quellkarten.`,
);

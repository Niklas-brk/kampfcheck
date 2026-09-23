/** Erstellt die verteilbare App: nur benötigte Laufzeitdateien, minimiert und ohne Quellkarten. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";
import { transform } from "esbuild";
import { createPackage } from "@electron/asar";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error("Ungültige App-Version");
const stage = path.join(root, ".cache", `package-${pkg.version}-${randomUUID()}`);
const payload = path.join(root, "release", `payload-${pkg.version}`);
await fs.mkdir(path.join(stage, "dist", "vendor"), { recursive: true });
await fs.mkdir(path.join(stage, "desktop"), { recursive: true });
await fs.mkdir(payload, { recursive: true });

const html = await fs.readFile(path.join(root, "dist/index.html"), "utf8");
// index.html ist die einzige Liste der benötigten Skripte. Keine Profile, Tests oder Projektdateien kopieren.
const scripts = [...html.matchAll(/<script defer src="([^"]+)"/g)].map((match) => match[1]);
if (!scripts.length || scripts.some((name) => !/^(?:vendor\/)?[a-z0-9.-]+\.js$/.test(name))) {
  throw new Error("Unerwartete Skriptpfade in index.html");
}
for (const relative of scripts) {
  const source = await fs.readFile(path.join(root, "dist", relative), "utf8");
  const result = await transform(source, {
    minify: true,
    sourcemap: false,
    legalComments: "none",
    target: "chrome146",
  });
  await fs.writeFile(path.join(stage, "dist", relative), result.code);
}
const css = await fs.readFile(path.join(root, "dist/style.css"), "utf8");
await fs.writeFile(
  path.join(stage, "dist/style.css"),
  (await transform(css, { loader: "css", minify: true })).code,
);
await fs.writeFile(path.join(stage, "dist/index.html"), html);
for (const relative of [
  "brand-logo.svg",
  "brand-mark.svg",
  "vendor/itemicons.png",
  "vendor/LICENSE-calc.txt",
  "vendor/LICENSE-showdown.txt",
]) {
  await fs.copyFile(path.join(root, "dist", relative), path.join(stage, "dist", relative));
}
const main = await fs.readFile(path.join(root, "desktop/main.cjs"), "utf8");
await fs.writeFile(
  path.join(stage, "desktop/main.cjs"),
  (
    await transform(main, {
      platform: "node",
      format: "cjs",
      target: "node22",
      minify: true,
      legalComments: "none",
    })
  ).code,
);
for (const name of ["icon.ico", "icon.png"])
  await fs.copyFile(path.join(root, "desktop", name), path.join(stage, "desktop", name));
await fs.copyFile(path.join(root, "THIRD_PARTY.md"), path.join(stage, "THIRD_PARTY.md"));
await fs.writeFile(
  path.join(stage, "package.json"),
  JSON.stringify({
    name: pkg.name,
    productName: pkg.productName,
    version: pkg.version,
    main: pkg.main,
  }),
);

// ASAR bündelt Dateien, verschlüsselt sie aber nicht. Ausführbarer App-Code bleibt technisch auslesbar.
const archive = path.join(payload, "app.asar");
await createPackage(stage, archive);
const hash = createHash("sha256")
  .update(await fs.readFile(archive))
  .digest("hex");
await fs.copyFile(path.join(root, "desktop/icon.ico"), path.join(payload, "app.ico"));
const manifest = {
  version: pkg.version,
  appSha256: hash,
  electronVersion: "44.4.3",
  electronUrl:
    "https://github.com/electron/electron/releases/download/v44.4.3/electron-v44.4.3-win32-x64.zip",
  electronSha256: "790a355b684d5c7cc8dc3cdd8c4cca7c4b2d054685427c7554a956879a82e70b",
};
await fs.writeFile(path.join(payload, "release.json"), JSON.stringify(manifest, null, 2));
console.log(`App-Paket erstellt: ${payload}`);

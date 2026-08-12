import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, ".output", "public");

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled prerender rejection:", reason);
  process.exitCode = 1;
});

function loadDotEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadDotEnv();

const handler = (await import("../.output/server/index.mjs")).default;
const context = {
  waitUntil() {},
  passThroughOnException() {},
};

let url = "https://yomesolutions-cmd.github.io/";
let response;
for (let i = 0; i < 5; i += 1) {
  try {
    response = await handler.fetch(new Request(url), {}, context);
  } catch (error) {
    console.error("Prerender request failed:", error);
    throw error;
  }
  if (response.status < 300 || response.status >= 400) break;
  const location = response.headers.get("location");
  if (!location) break;
  url = new URL(location, url).toString();
}

if (!response.ok) {
  throw new Error(`Could not prerender GitHub Pages HTML: ${response.status} ${response.statusText}`);
}

const html = await response.text();
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "index.html"), html);
copyFileSync(join(outputDir, "index.html"), join(outputDir, "404.html"));
writeFileSync(join(outputDir, ".nojekyll"), "");

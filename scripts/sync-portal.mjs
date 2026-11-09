// Usage: node scripts/sync-portal.mjs [https://vegas0250.ru/api/projects]
import { writeFile } from "node:fs/promises";
const response = await fetch(
  process.argv[2] || "https://vegas0250.ru/api/projects",
);
if (!response.ok) throw Error(`Portal catalog HTTP ${response.status}`);
const value = await response.json();
if (
  value.schemaVersion !== 1 ||
  !Array.isArray(value.projects) ||
  value.projects.length > 50 ||
  !value.projects.some((p) => p.slug === "vui") ||
  !value.projects.every(
    (p) =>
      /^[a-z0-9-]+$/.test(p.slug) &&
      p.url === `https://${p.slug}.vegas0250.ru/` &&
      typeof p.title?.ru === "string" &&
      typeof p.title?.en === "string",
  )
)
  throw Error("Invalid portal catalog");
await writeFile(
  new URL("../src/showcase/portal-projects.json", import.meta.url),
  JSON.stringify(value, null, 2) + "\n",
);

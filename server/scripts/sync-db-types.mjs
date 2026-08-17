#!/usr/bin/env node
/**
 * `server/src/db/types.ts`-ийг frontend болон app руу хуулна.
 *
 * Metro (Expo) болон Next.js хоёулаа өөрсдийн хавтаснаас гадуурх файлыг
 * шууд import хийж чаддаггүй тул схемийн төрлүүдийг ингэж тараана.
 * Эх сурвалж нь үргэлж server/ дотор байна.
 *
 *   npm run sync:types
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, "..", "..")

const source = join(repo, "server", "src", "db", "types.ts")
const targets = [
  join(repo, "frontend", "src", "lib", "db-types.ts"),
  join(repo, "app", "src", "lib", "db-types.ts"),
]

const banner = `// АВТОМАТААР ҮҮССЭН — гараар засахгүй.
// Эх сурвалж: server/src/db/types.ts · шинэчлэх: cd server && npm run sync:types

`

const body = readFileSync(source, "utf8")

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, banner + body)
  console.log(`✓ ${target.replace(repo + "/", "")}`)
}

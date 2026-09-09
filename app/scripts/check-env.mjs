#!/usr/bin/env node
/**
 * `.env` тохиргоог шалгах доктор скрипт.
 *
 * Шинэ компьютер дээр `git clone` хийсний дараа `app/.env` байхгүй (gitignore-д
 * орсон) тул нэвтрэх үед Supabase "Invalid API key" гэж хаядаг. Энэ скрипт
 * тухайн машин дээр яг юу дутуу байгааг Metro асаахаас өмнө хэлж өгнө.
 *
 * Ажиллуулах:  npm run doctor
 */
import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..")
const envPath = join(appDir, ".env")

const ok = (m) => console.log(`  ✅ ${m}`)
const bad = (m) => console.log(`  ❌ ${m}`)
const warn = (m) => console.log(`  ⚠️  ${m}`)

let failed = false
const fail = (m) => {
  bad(m)
  failed = true
}

console.log(`\nLumina app — орчны шалгалт\n  ${envPath}\n`)

if (!existsSync(envPath)) {
  fail(".env файл алга.")
  console.log("\n  Засах:  cp .env.example .env  (дараа нь Supabase-ийн жинхэнэ утгуудаа тавина)\n")
  process.exit(1)
}
ok(".env файл байна")

/** KEY=VALUE мөрүүдийг энгийнээр задална (dotenv хэрэггүй). */
const env = {}
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}

const url = env.EXPO_PUBLIC_SUPABASE_URL
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!url) fail("EXPO_PUBLIC_SUPABASE_URL хоосон байна")
else if (url.includes("xxxxxxxx")) fail("EXPO_PUBLIC_SUPABASE_URL нь .env.example-ийн жишээ утга хэвээр байна")
else ok(`URL: ${url}`)

if (!key) fail("EXPO_PUBLIC_SUPABASE_ANON_KEY хоосон байна")
else if (key.length < 40 || key.endsWith("...")) fail("ANON_KEY нь .env.example-ийн жишээ утга хэвээр байна (бүтэн түлхүүрээ хуулна уу)")
else ok(`ANON_KEY: ${key.slice(0, 12)}…${key.slice(-6)} (${key.length} тэмдэгт)`)

// Түлхүүр доторх project ref нь URL-тэйгээ таарч байгаа эсэх — өөр project-ийн
// түлхүүр тавьчихвал яг адилхан "Invalid API key" гарна.
if (url && key?.startsWith("ey")) {
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString())
    const urlRef = new URL(url).hostname.split(".")[0]
    if (payload.ref !== urlRef) fail(`Түлхүүр өөр project-ийнх: key.ref=${payload.ref} ≠ url=${urlRef}`)
    else ok(`Project ref таарч байна: ${payload.ref}`)
    if (payload.role !== "anon") warn(`role=${payload.role} — anon (publishable) түлхүүр байх ёстой`)
  } catch {
    warn("Түлхүүрийг JWT болгож задлаж чадсангүй — шинэ хэлбэрийн түлхүүр бол зүгээр.")
  }
}

if (failed) {
  console.log("\n  Засах: Supabase → Project Settings → API дотроос Project URL болон")
  console.log("  anon/publishable түлхүүрээ хуулж .env дотор тавиад дахин ажиллуулна уу.\n")
  process.exit(1)
}

// Түлхүүр жинхэнэ ажиллаж байгаа эсэхийг сервер дээр батлана.
process.stdout.write("\n  … Supabase руу шалгах хүсэлт явуулж байна\n")
try {
  const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } })
  const body = await res.text()
  if (res.ok) {
    ok(`Supabase auth хариулж байна (HTTP ${res.status})`)
    console.log("\n  Бүх шалгалт өнгөрлөө. `npm run ios` ажиллуулж болно.\n")
  } else {
    fail(`Supabase татгалзлаа (HTTP ${res.status}): ${body.slice(0, 200)}`)
    console.log("\n  Түлхүүр буруу эсвэл цуцлагдсан байна. Supabase → Settings → API-аас шинээр хуулна уу.\n")
    process.exit(1)
  }
} catch (e) {
  warn(`Сүлжээгээр холбогдож чадсангүй: ${e.message}`)
  console.log("  (.env зөв байна — зөвхөн интернэт холболтоо шалгана уу.)\n")
}

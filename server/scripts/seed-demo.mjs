#!/usr/bin/env node
/**
 * Жишээ үзүүлэх бүртгэлүүд үүсгэнэ — салон, артист, хэрэглэгчийн
 * demo акаунтууд + бизнесийн бүртгэлүүд (янз бүрийн статустай).
 * RLS-ийг тойрох тул зөвхөн service role key ашиглана.
 *
 *   cd server && npm run seed:demo
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=")
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    })
)

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("server/.env дотор SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY тохируулна уу.")
  process.exit(1)
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const PASSWORD = "Demo1234!"

const USERS = [
  {
    email: "salon.bellastudio@lumina.demo",
    full_name: "Б. Билгүүн",
    phone: "99001122",
    role: "salon",
    business: {
      type: "salon",
      name: "Bella Studio",
      phone: "77001122",
      email: "info@bellastudio.demo",
      address: "Сүхбаатар дүүрэг, 8-р хороо, Пи Жи Пи цамхаг",
      about: "Гоо сайхны иж бүрэн үйлчилгээ үзүүлдэг студи.",
      staff_size: "6-15",
      status: "approved",
      current_step: 5,
      categories: ["Гоо сайхан", "Үсчин", "Спа, Массаж"],
    },
  },
  {
    email: "salon.goosalkhin@lumina.demo",
    full_name: "Н. Оюунчимэг",
    phone: "99112233",
    role: "salon",
    business: {
      type: "salon",
      name: "Гоо Салхин",
      phone: "77112233",
      email: "contact@goosalkhin.demo",
      address: "Хан-Уул дүүрэг, 3-р хороо, Зайсан",
      about: "Байгалийн гаралтай бүтээгдэхүүн ашигладаг гоо сайхны төв.",
      staff_size: "1-5",
      status: "submitted",
      current_step: 5,
      categories: ["Арьс арчилгаа", "Хумс"],
    },
  },
  {
    email: "artist.sarangoo@lumina.demo",
    full_name: "A. Sarangoo",
    phone: "99223344",
    role: "artist",
    business: {
      type: "artist",
      name: "A. Sarangoo Makeup",
      phone: "77223344",
      email: "sarangoo.artist@lumina.demo",
      address: "Баянгол дүүрэг, 5-р хороо",
      about: "Хувиараа ажилладаг гэрлэн болон өдөр тутмын нүүр будалтын мастер.",
      staff_size: "1-5",
      status: "under_review",
      current_step: 5,
      categories: ["Гоо сайхан"],
    },
  },
  {
    email: "artist.uyanga@lumina.demo",
    full_name: "M. Уянга",
    phone: "99334455",
    role: "artist",
    business: {
      type: "artist",
      name: "M. Уянга Nails",
      phone: "77334455",
      email: "uyanga.artist@lumina.demo",
      address: "Чингэлтэй дүүрэг, 1-р хороо",
      about: "Хумсны дизайны хувиараа мастер.",
      staff_size: "1-5",
      status: "draft",
      current_step: 2,
      categories: ["Хумс"],
    },
  },
  {
    email: "customer.temuulen@lumina.demo",
    full_name: "Т. Төмөөлэн",
    phone: "99445566",
    role: "customer",
    business: null,
  },
  {
    email: "customer.nomin@lumina.demo",
    full_name: "Ц. Номин",
    phone: "99556677",
    role: "customer",
    business: null,
  },
]

async function main() {
  console.log(`${USERS.length} demo хэрэглэгч үүсгэж эхэллээ...\n`)

  for (const u of USERS) {
    const { data: created, error: userError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, phone: u.phone, role: u.role },
    })

    if (userError) {
      console.error(`✗ ${u.email}: ${userError.message}`)
      continue
    }

    const userId = created.user.id
    console.log(`✓ ${u.role.padEnd(8)} ${u.email}`)

    if (!u.business) continue

    const b = u.business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        owner_id: userId,
        type: b.type,
        name: b.name,
        phone: b.phone,
        email: b.email,
        address: b.address,
        about: b.about,
        staff_size: b.staff_size,
        status: b.status,
        current_step: b.current_step,
        submitted_at: b.status === "draft" ? null : new Date().toISOString(),
      })
      .select("id")
      .single()

    if (bizError) {
      console.error(`  ✗ business: ${bizError.message}`)
      continue
    }

    if (b.categories?.length) {
      await supabase
        .from("business_categories")
        .insert(b.categories.map((category) => ({ business_id: business.id, category })))
    }

    if (b.status !== "draft") {
      await supabase.from("business_hours").insert(
        Array.from({ length: 7 }, (_, weekday) => ({
          business_id: business.id,
          weekday,
          open_time: "09:00",
          close_time: "20:00",
          is_closed: false,
        })),
      )
    }

    if (b.status === "approved") {
      await supabase.from("contracts").insert({
        business_id: business.id,
        version: "2024-10-01",
        signed_name: u.full_name,
      })
    }

    console.log(`  → business "${b.name}" (${b.status})`)
  }

  console.log(`\nБүх demo акаунтын нууц үг: ${PASSWORD}`)
}

main()

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
  // ---------------------------------------------------------------- салон ×5
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
      status: "approved",
      current_step: 5,
      categories: ["Арьс арчилгаа", "Хумс"],
    },
  },
  {
    email: "salon.mirage@lumina.demo",
    full_name: "Д. Батцэцэг",
    phone: "99223300",
    role: "salon",
    business: {
      type: "salon",
      name: "Mirage Spa",
      phone: "77223300",
      email: "info@miragespa.demo",
      address: "Баянзүрх дүүрэг, 4-р хороо, Мишээл town",
      about: "Тайвшрал, арьс арчилгаа, массажийн иж бүрэн спа төв.",
      staff_size: "6-15",
      status: "approved",
      current_step: 5,
      categories: ["Спа, Массаж", "Арьс арчилгаа"],
    },
  },
  {
    email: "salon.nomin@lumina.demo",
    full_name: "Г. Мөнхзул",
    phone: "99334400",
    role: "salon",
    business: {
      type: "salon",
      name: "Nomin Beauty Lounge",
      phone: "77334400",
      email: "hello@nominbeauty.demo",
      address: "Сүхбаатар дүүрэг, 1-р хороо, Их сургуулийн гудамж",
      about: "Орчин үеийн загварын үсчин, гоо сайхны lounge.",
      staff_size: "6-15",
      status: "approved",
      current_step: 5,
      categories: ["Үсчин", "Гоо сайхан"],
    },
  },
  {
    email: "salon.oyu@lumina.demo",
    full_name: "Б. Ариунзаяа",
    phone: "99445500",
    role: "salon",
    business: {
      type: "salon",
      name: "Оюу Гоо Сайхан",
      phone: "77445500",
      email: "oyu.beauty@lumina.demo",
      address: "Сонгинохайрхан дүүрэг, 20-р хороо",
      about: "Дүүргийн түвшний тав тухтай гоо сайхны төв.",
      staff_size: "1-5",
      status: "submitted",
      current_step: 5,
      categories: ["Үсчин", "Хумс"],
    },
  },
  {
    email: "salon.newstyle@lumina.demo",
    full_name: "Т. Пүрэвсүрэн",
    phone: "99556600",
    role: "salon",
    business: {
      type: "salon",
      name: "Нью Стайл Салон",
      phone: "77556600",
      email: "newstyle@lumina.demo",
      address: "Багануур дүүрэг, 2-р хороо",
      about: "Шинээр нээгдэж буй, залуучуудад чиглэсэн салон.",
      staff_size: "1-5",
      status: "draft",
      current_step: 2,
      categories: ["Үсчин"],
    },
  },

  // ---------------------------------------------------------------- артист ×5
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
      status: "approved",
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
      status: "approved",
      current_step: 5,
      categories: ["Хумс"],
    },
  },
  {
    email: "artist.otgonbayar@lumina.demo",
    full_name: "Б. Отгонбаяр",
    phone: "99445566",
    role: "artist",
    business: {
      type: "artist",
      name: "Б. Отгонбаяр Hair Studio",
      phone: "77445566",
      email: "otgonbayar.hair@lumina.demo",
      address: "Сүхбаатар дүүрэг, 6-р хороо",
      about: "10 гаруй жилийн туршлагатай үсчин мастер.",
      staff_size: "1-5",
      status: "approved",
      current_step: 5,
      categories: ["Үсчин"],
    },
  },
  {
    email: "artist.tsetsegmaa@lumina.demo",
    full_name: "Н. Цэцэгмаа",
    phone: "99556677",
    role: "artist",
    business: {
      type: "artist",
      name: "Н. Цэцэгмаа Lashes",
      phone: "77556677",
      email: "tsetsegmaa.lash@lumina.demo",
      address: "Хан-Уул дүүрэг, 2-р хороо",
      about: "Сормуусны extension, laminating мэргэшсэн мастер.",
      staff_size: "1-5",
      status: "under_review",
      current_step: 5,
      categories: ["Гоо сайхан"],
    },
  },
  {
    email: "artist.bolormaa@lumina.demo",
    full_name: "Э. Болормаа",
    phone: "99667788",
    role: "artist",
    business: {
      type: "artist",
      name: "Э. Болормаа Brows",
      phone: "77667788",
      email: "bolormaa.brows@lumina.demo",
      address: "Баянзүрх дүүрэг, 11-р хороо",
      about: "Хөмсөг татуулга, микроблэйдингийн мастер.",
      staff_size: "1-5",
      status: "draft",
      current_step: 2,
      categories: ["Гоо сайхан"],
    },
  },

  // ---------------------------------------------------------------- хэрэглэгч ×2
  {
    email: "customer.temuulen@lumina.demo",
    full_name: "Т. Төмөөлэн",
    phone: "99778899",
    role: "customer",
    business: null,
  },
  {
    email: "customer.nomin@lumina.demo",
    full_name: "Ц. Номин",
    phone: "99889900",
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

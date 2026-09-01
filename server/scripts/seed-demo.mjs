#!/usr/bin/env node
/**
 * Жишээ үзүүлэх бүртгэлүүд үүсгэнэ — салон, артист, хэрэглэгчийн
 * demo акаунтууд + бизнес, үйлчилгээ, мастер, галерей, сэтгэгдэл.
 * RLS-ийг тойрох тул зөвхөн service role key ашиглана.
 *
 * Дахин ажиллуулж болно: байгаа бүртгэлийг олж, хүүхэд хүснэгтүүдийг
 * дарж бичнэ. Тиймээс demo өгөгдлөө шинэчлэхэд дахин ажиллуулахад л хангалттай.
 *
 *   cd server && npm run seed:demo
 *
 * Координатууд нь хаягийн дүүрэг/хорооны ойролцоо төв цэг — үзүүлэх
 * зорилготой тул нарийвчилсан барилгын байрлал биш. Тавихгүй орхивол
 * бизнесүүд газрын зурагт огт гарахгүй, эсвэл өмнөх утгаа хадгалж
 * хоорондоо давхцана.
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import ws from "ws"

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
  // Node 20-д native WebSocket байхгүй тул supabase-js унадаг. Энэ скрипт
  // Realtime ашигладаггүй ч client үүсэхдээ шаарддаг — rt-check.mjs-тэй ижил.
  realtime: { transport: ws },
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
      lat: 47.8895,
      lng: 106.9145,
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
      lat: 47.9088,
      lng: 106.9635,
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
      lat: 47.9232,
      lng: 106.9195,
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
      lat: 47.9175,
      lng: 106.806,
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
      lat: 47.825,
      lng: 108.345,
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
      lat: 47.9145,
      lng: 106.862,
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
      lat: 47.928,
      lng: 106.9145,
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
      lat: 47.933,
      lng: 106.93,
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
      lat: 47.8985,
      lng: 106.889,
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
      lat: 47.9165,
      lng: 106.976,
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

  // ---------------------------------------------------------------- супер админ ×1
  {
    email: "admin@lumina.demo",
    full_name: "Б. Мөнхбат",
    phone: "88001122",
    role: "super_admin",
    business: null,
  },
]


// ---------------------------------------------------------------- pools
// Ангиллаар нь үйлчилгээ түүнэ. Үнэ нь төгрөгөөр, бүхэл тоо.
const SERVICE_POOL = {
  "Үсчин": [
    { name: "Эрэгтэй үс засалт", price: 35000, duration_min: 45, description: "Мэргэжлийн зөвлөгөө, угаалт, тайралт, хэлбэржүүлэлт." },
    { name: "Эмэгтэй үс засалт", price: 55000, duration_min: 60, description: "Хэлбэр засах, угаалт, сэнс тавих." },
    { name: "Үс будалт", price: 120000, duration_min: 150, description: "Үндэс болон бүтэн будалт, өнгө сонгох зөвлөгөөтэй." },
  ],
  "Хумс": [
    { name: "Сонгодог маникюр", price: 45000, duration_min: 60, description: "Хумсны хэлбэр засах, cuticule цэвэрлэх." },
    { name: "Гелэн будалт", price: 65000, duration_min: 90, description: "1-2 өнгийн гель будалт, бэхжүүлэлт." },
    { name: "Педикюр + Гель", price: 85000, duration_min: 120, description: "Хөлийн арчилгаа, гель будалт." },
  ],
  "Арьс арчилгаа": [
    { name: "Гүн цэвэрлэгээ", price: 75000, duration_min: 60, description: "Арьсны төрлөөс хамаарсан гүн цэвэрлэгээ." },
    { name: "Чийгшүүлэх маск", price: 55000, duration_min: 45, description: "Хатсан арьсанд зориулсан эрчимт чийгшүүлэлт." },
  ],
  "Спа, Массаж": [
    { name: "Бүтэн биеийн алжаал тайлах", price: 120000, duration_min: 90, description: "Халуун чулуу болон тосон иллэг хосолсон." },
    { name: "Нурууны иллэг", price: 70000, duration_min: 45, description: "Мөр, нурууны хэсэгчилсэн иллэг." },
  ],
  "Гоо сайхан": [
    { name: "Өдөр тутмын нүүр будалт", price: 60000, duration_min: 60, description: "Байгалийн, өдөржин тогтвортой будалт." },
    { name: "Гэрлэн чимэглэлийн будалт", price: 180000, duration_min: 120, description: "Туршилтын уулзалт багтсан бүрэн үйлчилгээ." },
  ],
}

// Салоны "Мастерууд". Артистууд ганцаараа ажилладаг тул ажилтангүй.
const STAFF_POOL = [
  { name: "Солонго", role: "Үсчин" },
  { name: "Төгөлдөр", role: "Нүүр будагч" },
  { name: "Ану", role: "Арьс гоо засалч" },
  { name: "Номи", role: "Хумс засалч" },
]

// Галерейн зураг. `storage_path` нь бүтэн URL-ыг ч хүлээж авдаг тул
// demo-д гадны зураг ашиглав — бодит дээр bucket доторх зам байна.
const GALLERY = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
  "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
]

// Захиалгын хүсэлт — үйлчилгээ сонгодоггүй тул чөлөөт тайлбар.
const BOOKING_POOL = [
  {
    status: "pending",
    inDays: 2,
    hour: 11,
    note: "Мөрний урттай үсээ 10 см тайруулж, доод талыг нь давхаргатай болгомоор байна. Өнгө өөрчлөхгүй.",
    withImage: true,
  },
  {
    status: "confirmed",
    inDays: 4,
    hour: 15,
    note: "Хумсаа богино байлгаад, тансаг цайвар ягаан гелэн будалт хиймээр байна. Гялтганахгүй, матт өнгө.",
    withImage: false,
  },
  {
    status: "completed",
    inDays: -6,
    hour: 13,
    note: "Хуримын өмнөх туршилтын будалт. Байгалийн, гэрэл зурагт сайн харагдах маягаар.",
    withImage: false,
  },
]

const REVIEW_POOL = [
  { rating: 5, body: "Маш цэвэрхэн, нямбай ажилладаг. Сонгосон загварыг яг л хүссэнээр гаргаж өгсөн. Баярлалаа!" },
  { rating: 5, body: "Орчин нь үнэхээр тухтай, ажилтнууд эелдэг. Дараа заавал дахин үйлчлүүлнэ." },
  { rating: 4, body: "Ажлын чанар сайн. Цаг товлосноосоо арай хожуу эхэлсэн нь л дутуу." },
  { rating: 5, body: "Үнийн хувьд бодитой, үр дүн нь хүлээлтээс давсан." },
]

/**
 * Бүх хэрэглэгчийг и-мэйлээр нь индекслэнэ. `createUser` нь давхардсан
 * и-мэйл дээр алдаа өгдөг тул скриптийг дахин ажиллуулахад одоо байгаа
 * бүртгэлийг олох хэрэгтэй болно.
 */
async function existingUsersByEmail() {
  const map = new Map()

  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error || !data?.users?.length) break
    for (const u of data.users) if (u.email) map.set(u.email, u.id)
    if (data.users.length < 200) break
  }

  return map
}

/**
 * Хүүхэд хүснэгтийн мөрүүдийг цэвэрлээд дахин бичнэ. Ингэснээр скриптийг
 * хэдэн ч удаа ажиллуулж болно — давхардал үүсэхгүй, шинэчилсэн demo
 * өгөгдөл нь өмнө үүссэн бүртгэлүүд дээр ч тусна.
 */
async function replaceRows(table, businessId, rows) {
  const { error: delError } = await supabase.from(table).delete().eq("business_id", businessId)
  if (delError) {
    console.error(`  ✗ ${table} цэвэрлэх: ${delError.message}`)
    return
  }
  if (!rows.length) return

  const { error } = await supabase.from(table).insert(rows)
  if (error) console.error(`  ✗ ${table}: ${error.message}`)
}

async function main() {
  console.log(`${USERS.length} demo хэрэглэгч бэлдэж эхэллээ...\n`)

  const existing = await existingUsersByEmail()

  // Сэтгэгдэл нь үйлчлүүлэгчийн id шаарддаг ч тэд жагсаалтын сүүлд
  // байдаг тул эхлээд цуглуулаад, дараа нь хоёр дахь ээлжид бичнэ.
  const createdBusinesses = []
  const createdCustomers = []

  for (const u of USERS) {
    let userId = existing.get(u.email) ?? null
    const isNew = !userId

    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, phone: u.phone, role: u.role },
      })

      if (error) {
        console.error(`✗ ${u.email}: ${error.message}`)
        continue
      }
      userId = data.user.id
    }

    console.log(`${isNew ? "✓ шинэ " : "· байсан"} ${u.role.padEnd(8)} ${u.email}`)

    if (!u.business) {
      if (u.role === "customer") createdCustomers.push({ id: userId, name: u.full_name })
      continue
    }

    const b = u.business
    const fields = {
      owner_id: userId,
      type: b.type,
      name: b.name,
      phone: b.phone,
      email: b.email,
      address: b.address,
      lat: b.lat,
      lng: b.lng,
      about: b.about,
      staff_size: b.staff_size,
      status: b.status,
      slot_minutes: 60,
      // Зэрэг үйлчилж чадах тоо нь мастеруудынхаа тоотой тэнцүү (0014).
      slot_capacity: b.type === "salon" ? (b.staff_size === "1-5" ? 2 : 4) : 1,
      current_step: b.current_step,
      submitted_at: b.status === "draft" ? null : new Date().toISOString(),
    }

    // Нэг эзэн нэг бизнестэй (businesses_owner_uniq) тул байгааг нь шинэчилнэ.
    const { data: found } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle()

    let businessId = found?.id

    if (businessId) {
      await supabase.from("businesses").update(fields).eq("id", businessId)
    } else {
      const { data, error } = await supabase
        .from("businesses")
        .insert(fields)
        .select("id")
        .single()

      if (error) {
        console.error(`  ✗ business: ${error.message}`)
        continue
      }
      businessId = data.id
    }

    await replaceRows(
      "business_categories",
      businessId,
      (b.categories ?? []).map((category) => ({ business_id: businessId, category })),
    )

    await replaceRows(
      "business_hours",
      businessId,
      b.status === "draft"
        ? []
        : Array.from({ length: 7 }, (_, weekday) => ({
            business_id: businessId,
            weekday,
            open_time: "09:00",
            close_time: "20:00",
            // 6 = Ням — амарна. Аппын "амарна" төлвийг бодитоор турших
            // боломж өгнө (бүх өдөр нээлттэй бол хэзээ ч харагдахгүй).
            is_closed: weekday === 6,
          })),
    )

    // Үйлчилгээ — бизнесийн ангиллуудаас түүнэ.
    const services = (b.categories ?? [])
      .flatMap((c) => SERVICE_POOL[c] ?? [])
      .map((s, i) => ({ ...s, business_id: businessId, category: null, sort_order: i }))

    await replaceRows("services", businessId, services)

    // Мастерууд — зөвхөн салон. Артист ганцаараа ажиллана.
    const staff =
      b.type === "salon"
        ? STAFF_POOL.slice(0, b.staff_size === "1-5" ? 2 : 4).map((m, i) => ({
            ...m,
            business_id: businessId,
            sort_order: i,
          }))
        : []

    await replaceRows("business_staff", businessId, staff)

    // Галерей — бизнес бүрт өөр эхлэлтэй 3 зураг.
    const offset = createdBusinesses.length * 2
    await replaceRows(
      "business_media",
      businessId,
      Array.from({ length: 3 }, (_, i) => ({
        business_id: businessId,
        storage_path: GALLERY[(offset + i) % GALLERY.length],
        sort_order: i,
      })),
    )

    // Гэрээ нь түүхэн бичлэг тул дарж бичихгүй — байхгүй үед л нэмнэ.
    if (b.status === "approved") {
      const { count } = await supabase
        .from("contracts")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)

      if (!count) {
        await supabase.from("contracts").insert({
          business_id: businessId,
          version: "2024-10-01",
          signed_name: u.full_name,
        })
      }
    }

    createdBusinesses.push({ id: businessId, name: b.name, status: b.status })

    console.log(
      `  → "${b.name}" (${b.status}) · ${services.length} үйлчилгээ · ${staff.length} мастер`,
    )
  }

  // Захиалга — зөвхөн зөвшөөрөгдсөн бизнест.
  //
  // Урьд нь захиалгатай бизнесийг БҮХЭЛД НЬ алгасдаг байсан. Тэгснээр эрт
  // үеийн ганц (тэр ч байтугай цуцлагдсан) захиалгатай үлдсэн бизнес
  // хэзээ ч дүүрдэггүй — артистын панелыг туршихад хоосон харагдана.
  // Одоо дутууг нь НӨХНӨ: одоо байгаа мөрийг хөндөхгүй, зөвхөн тухайн
  // цагт захиалга байхгүй бол л нэмнэ.
  const approved = createdBusinesses.filter((b) => b.status === "approved")
  let bookingCount = 0

  for (const [bi, business] of approved.entries()) {
    const { data: existing } = await supabase
      .from("bookings")
      .select("scheduled_at")
      .eq("business_id", business.id)

    const taken = new Set((existing ?? []).map((b) => new Date(b.scheduled_at).getTime()))

    for (const [pi, tpl] of BOOKING_POOL.entries()) {
      const customer = createdCustomers[(bi + pi) % createdCustomers.length]
      if (!customer) continue

      const when = new Date()
      when.setDate(when.getDate() + tpl.inDays)
      when.setHours(tpl.hour, 0, 0, 0)
      // Ням гараг амралт (дээрх business_hours) — 0014-ийн триггер тухайн
      // өдрийн захиалгыг татгалзана. Дараагийн өдөр рүү шилжүүлнэ.
      if (when.getDay() === 0) when.setDate(when.getDate() + 1)

      // Тухайн цагт аль хэдийн захиалга байвал (өмнөх ажиллуулалт эсвэл
      // гараар үүсгэсэн) давхардуулахгүй — 0014-ийн багтаамжийн триггер ч
      // татгалзана.
      if (taken.has(when.getTime())) continue

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          customer_id: customer.id,
          business_id: business.id,
          status: tpl.status,
          scheduled_at: when.toISOString(),
          note: tpl.note,
        })
        .select("id")
        .single()

      if (error) {
        console.error(`  ✗ booking: ${error.message}`)
        continue
      }
      bookingCount++

      if (!tpl.withImage) continue

      // Жишээ зураг — гадны зургийг татаж booking-refs руу хийнэ.
      // (Аппаас ирэхдээ base64-аар ирдэг; энд зүгээр байт хуулна.)
      try {
        const res = await fetch(GALLERY[(bi + 1) % GALLERY.length])
        const bytes = new Uint8Array(await res.arrayBuffer())
        const path = `${customer.id}/seed-${booking.id.slice(0, 8)}.jpg`

        const { error: upError } = await supabase.storage
          .from("booking-refs")
          .upload(path, bytes, { contentType: "image/jpeg", upsert: true })

        if (upError) throw new Error(upError.message)

        await supabase
          .from("booking_images")
          .insert({ booking_id: booking.id, storage_path: path, sort_order: 0 })
      } catch (e) {
        console.error(`  ✗ booking зураг: ${e.message}`)
      }
    }
  }

  console.log(`\n${bookingCount} захиалга нэмэгдлээ.`)

  // Дууссан захиалгад туршилтын нэхэмжлэх. Байгаа бол дарж бичихгүй.
  const { data: completed } = await supabase
    .from("bookings")
    .select("id, business_id")
    .eq("status", "completed")

  let invoiceCount = 0

  for (const b of completed ?? []) {
    const { count } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", b.id)

    if (count) continue

    const { error } = await supabase.from("invoices").insert({
      booking_id: b.id,
      business_id: b.business_id,
      // ⚠️ Туршилтын дүн — бодит төлбөр тооцоо хийгддэггүй.
      amount: 120000,
      note: "Хийгдсэн ажлын дүн (туршилтын)",
      status: "issued",
    })

    if (error) console.error(`  ✗ invoice: ${error.message}`)
    else invoiceCount++
  }

  console.log(`${invoiceCount} туршилтын нэхэмжлэх нэмэгдлээ.`)
  let reviewCount = 0

  for (const [bi, business] of approved.entries()) {
    const rows = createdCustomers.map((c, ci) => {
      const r = REVIEW_POOL[(bi + ci) % REVIEW_POOL.length]
      return {
        business_id: business.id,
        author_id: c.id,
        author_name: c.name,
        rating: r.rating,
        body: r.body,
      }
    })

    await replaceRows("reviews", business.id, rows)
    reviewCount += rows.length
  }

  console.log(`${approved.length} зөвшөөрөгдсөн бизнест нийт ${reviewCount} сэтгэгдэл.`)
  console.log(`Бүх demo акаунтын нууц үг: ${PASSWORD}`)
}

main()

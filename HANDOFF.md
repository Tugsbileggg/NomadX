> ⚠️ **2026-08-18-ны агшны байдал.** Түүнээс хойш 0007–0020 migration, админ
> панел, захиалгын цагийн логик, сэтгэгдэл, галерей, мэдэгдэл зэрэг
> нэмэгдсэн. Гаргах бэлтгэлийн эх сурвалж нь [DEPLOY.md](DEPLOY.md).

# LUMINA (NomadX) — Handoff (2026-08-18)

Энэ session-д хийсэн бүх ажил, гарсан шийдвэр, олдсон bug, үлдсэн даалгаврын жагсаалт. Context дүүрсэн тул шинэ session-д энэ файлыг эхлээд уншиж танилцаарай.

## Төслийн ерөнхий байдал

Monorepo: `frontend/` (Next.js 16 web, business/artist registration + admin), `app/` (Expo 54 mobile, customer app), `server/` (Hono + Supabase migrations). Бүгд нэг Supabase project (`neeosuuhhbcaillrptpa`) ашигладаг. Бизнес нэр = **Lumina**.

**Deploy хийгдсэн:**
- Web: https://frontend-pi-lyart-87.vercel.app (Vercel Root Directory = `frontend`, GitHub-с auto-deploy ажилладаг — баталгаажсан)
- Mobile web: https://nomad-x-theta.vercel.app (Vercel Root Directory = `app`, auto-deploy ажилладаг)
- GitHub: `Tugsbileggg/NomadX`, `main` branch, push бүрд хоёулаа автоматаар deploy хийгддэг

## 🔑 Чухал сурсан зүйлс / gotcha-нууд

1. **DB схем анх огт байгаагүй.** `server/supabase/migrations/0001_init.sql` хэзээ ч Supabase дээр ажиллуулагдаагүй байсан (зөвхөн `auth.users` ажилладаг байсан тул auth flow л "ажиллаж байгаа мэт" харагдаж байсан). Одоо 0001–0006 бүгд ажиллуулагдсан.
2. **Expo Router web нь SSR хийдэг** — `_layout.tsx`-аас хүрдэг ямар ч module-ийн top-level кодод `window`/`document` хүрвэл dev server унана. 2 удаа таарсан: Supabase client (AsyncStorage), Leaflet. Засвар: `typeof window === "undefined"` шалгах эсвэл dynamic `import()` ашиглах.
3. **`expo-router/ui`-ийн web Tabs navigator** нь зөвхөн `TabTrigger`-ээр бүртгэгдсэн route руу л шилждэг — бусад route (`share.tsx` шиг) руу `router.push` ажиллахгүй. Иймэрхүү route-уудыг root Stack-д (`(tabs)`-ээс гадна) байрлуулах хэрэгтэй.
4. **Supabase OTP код 8 оронтой** (6/4 биш) — энэ project дээр л ийм тохиргоотой. Хааяа өөр байж болзошгүй тул шалгаж баталгаажуулаарай.
5. **`toLocaleDateString("mn-MN", …)` энэ орчинд ажиллахгүй** — англи нэрээр (Thu, August) fallback хийдэг. `app/src/lib/mn-date.ts` гараар форматладаг helper бичсэн — ижил асуудал өөр газар гарвал үүнийг ашиглах.
6. **RLS-ийн 2 том цоорхой олж заслаа:**
   - `businesses_update_own` анх зөвхөн draft/needs_info/rejected үед л засах боломжтой байсан (approved бизнес өөрийгөө засаж чадахгүй байсан) → 0003-аар засав.
   - `businesses` дээр **ямар ч public select policy байгаагүй** (харилцагч өөр бизнес харах боломжгүй байсан, Home үргэлж хоосон гардаг байсан) → 0004-өөр зассан. **Анхаар: documents/payout_accounts/contracts-ийг нээгээгүй, зөвхөн businesses+business_categories.**
7. **Migration хэзээ ч AI (би) шууд ажиллуулж чадахгүй** — SQL Editor-т хэрэглэгч өөрөө copy-paste хийж ажиллуулдаг байсан (Supabase CLI login/DB password байхгүй тул). Migration бичих бүрдээ хэрэглэгчид SQL-ийг бүтнээр нь өгч, "ажиллалаа" гэсэн хариу хүлээх хэрэгтэй.
8. **Preexisting auth user-д profiles мөр байхгүй байсан** (`ganbat.tugsbileg@gmail.com`, trigger үүсэхээс өмнө бүртгүүлсэн) — FK constraint-ийн улмаас businesses үүсгэж чадахгүй байсныг гараар backfill хийсэн. Өөр ижил төстэй хуучин хэрэглэгч байвал мөн адил асуудал таарна.
9. **Real data-only зарчим тогтоосон:** хэрэглэгч тодорхой хэлсэн — DB-д байхгүй өгөгдөл (үнэлгээ, сэтгэгдэл, үйлчилгээний үнэ, "Шинэ" badge гэх мэт) хэзээ ч fabricate хийхгүй, зөвхөн жинхэнэ Supabase өгөгдлийг л харуулна. Байхгүй бол шударга хоосон төлөв ("Одоогоор... алга") харуулна.
10. **Geocoding**: OpenStreetMap Nominatim (үнэгүй, 1 хүсэлт/сек хязгаартай) ашигласан. `server/scripts/geocode-businesses.mjs` — одоо байгаа businesses-ийг geocode хийдэг, web save action-уудад (`saveBusinessInfo`, `updateBusinessProfile`) автоматаар холбогдсон (хаяг өөрчлөгдөх бүрд).
11. **Email/SMTP**: Resend ашигладаг, sender = `onboarding@resend.dev` (sandbox горим — зөвхөн Resend акаунтын өөрийн и-мэйл рүү л илгээдэг!). Бодит хэрэглэгчид и-мэйл хүргэхийн тулд өөрийн домэйнээ Resend дээр баталгаажуулах хэрэгтэй (DNS SPF/DKIM). Email template-үүд (`Reset Password`, `Confirm signup`) `{{ .Token }}` ашигладаг болгож тохируулсан.
12. **Секретийн зохицуулалт**: `server/.env` (service role key, gitignored) — зөвхөн би шууд ажиллуулдаг script-үүдэд ашигладаг. `frontend/.env.local`, `app/.env` — зөвхөн URL+anon key (mobile app URL хувьсагч ч frontend-д нэмэгдсэн). **Нэг удаа `server/.env.example`-д бодит key орох gэсэн — цаг тухайд нь олж засав, commit хийгдээгүй.** Секрет унших/бичихдээ болгоомжтой байгаарай.

## Хийгдсэн ажил (эрэмбээр)

### 1. Auth (web + mobile)
- Web: `forgot-password → verify (8 оронтой код) → reset-password → password-changed` бүрэн бодит Supabase-тай холбогдсон (`resetPasswordForEmail`/`verifyOtp`/`updateUser`). `frontend/src/lib/auth/actions.ts`, `(auth)/verify/*`, `(auth)/reset-password/*`.
- Mobile: `(auth)` route бүлэг бүхэлдээ шинээр (Welcome/Login/Signup/OTP verify/Forgot/Reset — 6 дэлгэц), `Stack.Protected`-ээр session хамгаалалт, `lib/auth-context.tsx`.
- Migration 0002: `user_role` enum-д `customer` нэмсэн.
- Brand tokens (`app/src/constants/theme.ts`-ийн `Brand`), Montserrat фонт, `@expo/vector-icons`.

### 2. Deploy + QR
- Web, mobile web хоёулаа Vercel дээр (дээрх URL-ууд), auto-deploy баталгаажсан.
- Нүүр хуудсанд "Апп татах" QR товч (`frontend/src/components/DownloadAppButton.tsx`, `lib/mobile-app-url.ts`) — `NEXT_PUBLIC_MOBILE_APP_URL` env var-аар зохицуулагдана.

### 3. DB схем бодитоор идэвхжүүлэх
- 0001 (анхны бүх схем), 0002 (customer role), 0003 (approved-эрхийн засвар) — гурвыг хэрэглэгч SQL Editor-т ажиллуулсан.

### 4. Business/Artist профайл (web)
- `business/settings`, `artist/settings`, `artist/profile` — бүгд 100% mock байснаас бодит Supabase-тай холбогдов. Лого/ковер upload, `updateBusinessProfile` action, `storeFile`/`publicAssetUrl` helper-үүдийг `lib/storage/store-file.ts` руу зөөв.
- `artist/profile`-с fabricate хийсэн үнэлгээ/үйлчилгээ-үнэ/portfolio зургийг устгаж шударга болгов.

### 5. Demo seed
- `server/scripts/seed-demo.mjs`: 5 салон + 5 артист + 2 хэрэглэгч, бодит DB дээр ажиллуулж баталгаажуулав (нийт 11 бизнес).

### 6. Mobile Home дахин зохион байгуулалт
- Header (Lumina лого+нэр+notif), banner, ангилалын chip, AI карт (placeholder), "Онцлох артистууд"/"Онцлох салонууд" (бодит DB-ээс), "Сэтгэгдлүүд" (шударга хоосон).
- Доод tab 4→5 болов: **Нүүр/Хайх/AI Зөвлөгөө/Захиалга/Профайл**. "Expo Starter" boilerplate branding, "Explore"/"Docs" арилгав.
- `share.tsx` (амьд байршил POC) `(tabs)`-ээс root руу зөөв (tab bar-т байхгүй route web дээр ажилладаггүй тул). Профайл дэх линкээр хүрнэ.
- `ai-advisor.tsx`, `bookings.tsx` (анх), `search.tsx` (анх) — `ComingSoon.tsx` placeholder-оор эхэлсэн, дараа нь search/bookings бодит болов.

### 7. Search + газрын зураг
- Migration 0004 (public businesses select policy), 0005 (lat/lng багана).
- `server/scripts/geocode-businesses.mjs`-ээр бодит координат (Nominatim).
- `app/src/components/BusinessMap.tsx` (native, react-native-maps — **симулятор дээр туршигдаагүй**) + `BusinessMap.web.tsx` (web, Leaflet, SSR-safe).
- Хайх дэлгэц: салон real pin-тэй газрын зурагт, артист **нууцлалын үүднээс газрын зурагт ороогүй**, харин `lib/distance.ts` (haversine)-аар тооцоолсон ойрхон 5-ыг жагсаалтаар. Нэрээр хайх талбар хоёуланд нь.

### 8. Захиалга + Профайл засах
- Migration 0006: `bookings` хүснэгт (customer_id, business_id, status enum, scheduled_at) RLS-тэй.
- `book/[id].tsx`: 7 хоногийн chip + цагийн slot (09:00–19:00) + тэмдэглэл → бодит booking.
- `bookings.tsx` (Захиалга tab): Идэвхтэй/Түүх, цуцлах боломжтой, `useFocusEffect`-ээр шинэчлэгддэг.
- `profile.tsx`: нэр/утас `profiles` хүснэгттэй бодитоор холбогдож засварлагдана.
- `lib/mn-date.ts`: locale bug-ийн засвар.

## ⚠️ Үлдсэн даалгаврууд (эрэмбэлэлгүй)

1. **Бизнесийн талын захиалга удирдлага байхгүй** — `business/bookings`, `artist/bookings`, `business/calendar`, `artist/calendar` (web) бүгд **одоо ч mock** — шинэ `bookings` хүснэгттэй холбогдоогүй. Бизнесийн эзэн ирсэн захиалгаа харах/баталгаажуулах UI байхгүй.
2. **Web admin панелууд бараг бүгд mock**: `business/employees`, `services`, `customers`, `reviews`, `analytics` (мөн artist-ийн ижил төстэй), **бүх Super Admin панел** (`/admin/*`) — анхны Figma-based scaffold-ынхаа mock өгөгдлөөр л байгаа, энэ session-д огт хөндөгдөөгүй.
3. **Mobile AI Зөвлөгөө tab** — зөвхөн "тун удахгүй" placeholder, AI feature (скан, зөвлөгөө) огт байхгүй.
4. **Native (iOS/Android) газрын зураг hеч туршигдаагүй** — `react-native-maps` кодыг зөвхөн бичсэн, симулятор/төхөөрөмж байхгүй орчинд туршиж чадаагүй. Зөвхөн web (Leaflet) хувилбар бодитоор туршигдсан.
5. **Production email**: одоогоор зөвхөн Resend sandbox (`onboarding@resend.dev`) — бодит хэрэглэгчдэд и-мэйл хүрэхгүй, зөвхөн Resend акаунт эзэмшигчийн и-мэйл рүү л. Өөрийн домэйн баталгаажуулах хэрэгтэй.
6. **Portfolio/gallery** (артистын зургийн цомог) — схемд байхгүй, `document_kind` enum-д "portfolio" төрөл алга, зориудаар хийгээгүй үлдээсэн.
7. **business/settings, artist/settings**-ийн бусад tab-ууд (Баталгаажуулалт/Банк-Төлбөр/Мэдэгдэл/Аюулгүй байдал/Гэрээ) — зөвхөн decorative, зөвхөн "Профайл" tab-ыг л бодитоор холбосон.
8. **Бүртгэлийн wizard-ын хуучин dead UI**: гэрээний PDF татах товч, хаягийн "map дээрээс сонгох" pin товч — хараахан ажиллахгүй (энэ session-с өмнөх, хөндөгдөөгүй).
9. **`server/src/db/types.ts`** (баримтжуулсан "эх сурвалж") — би зөвхөн `app/`, `frontend/`-ийн db-types.ts хуулбаруудыг шууд засварласан, жинхэнэ эх файл болон `npm run sync:types`-ийг ажиллуулаагүй. Хэрэв дараа нь `supabase gen types` ажиллуулбал энэ session-д нэмсэн `Booking`, `lat/lng`, `customer` зэрэг encoding-г алдаж магадгүй тул давхар шалгах хэрэгтэй.
10. Search tab-ыг зөвхөн нэг demo хэрэглэгчээр web дээр туршсан — олон concurrent хэрэглэгч/edge case (0 businesses, geocode failed, permission denied) бүрэн тест хийгээгүй.

## Хэрэгтэй мэдээлэл

- **Supabase**: URL `https://neeosuuhhbcaillrptpa.supabase.co`, anon key нь `frontend/.env.local` болон `app/.env`-д бий (gitignored, репод байхгүй). Service role key `server/.env`-д (gitignored).
- **Demo акаунтууд** (`npm run seed:demo`-ээр үүссэн): `salon.*@lumina.demo`, `artist.*@lumina.demo`, `customer.*@lumina.demo` — бүгд нууц үг `Demo1234!`.
- **Хувийн тест акаунт**: `ganbat.tugsbileg@gmail.com` (жинхэнэ, эзэмшигчийн өөрийн и-мэйл, зөвхөн энэ хаяг руу л Resend sandbox-аар и-мэйл хүрдэг), одоогийн нууц үг `TestPass123!` (session дундуур солигдсон).
- **Dev server ажиллуулах**: `.claude/launch.json`-д `lumina-frontend` (frontend, :3000), `lumina-app-web` (app, :8081) тохиргоо бэлэн.
- **Migration дараалал**: 0001→0006, бүгд `server/supabase/migrations/` дотор, SQL Editor-т дараалан ажиллуулсан (бүгд амжилттай).

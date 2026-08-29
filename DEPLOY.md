# LUMINA — Production бэлтгэл

Гурван зорилтот орчин: **Vercel × 2** (вэб панел, Expo web), **EAS** (iOS/Android),
**Supabase** (нэг project — `neeosuuhhbcaillrptpa`).

---

## 1. Орчны хувьсагчид

Хувьсагчийг эх сурвалж бүрт **гараар** тохируулна — `.env` файлууд gitignore-д тул
хаашаа ч автоматаар очихгүй.

### Vercel — вэб панел (root: `frontend`)

| Хувьсагч | Заавал | Тайлбар |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Мөн тэндээс |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Зөвхөн серверт.** Супер админ панел (auth.users унших, хориглох, эрх солих) үүнгүйгээр ажиллахгүй. `NEXT_PUBLIC_` угтвар ХЭЗЭЭ Ч тавихгүй |
| `NEXT_PUBLIC_CARTO_KEY` | — | Байхгүй бол газрын зураг OpenStreetMap руу унана |
| `NEXT_PUBLIC_MOBILE_APP_URL` | — | Нүүр хуудасны "Апп татах" QR |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | — | Тусламж хуудасны холбоо барих суваг |
| `NEXT_PUBLIC_SUPPORT_PHONE` | — | Мөн адил |

### Vercel — Expo web (root: `app`)

| Хувьсагч | Заавал |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `EXPO_PUBLIC_CARTO_KEY` | — |

### EAS (native build)

`.env` нь gitignore-д тул EAS сервер дээр **байхгүй**. `eas.json`-д түлхүүр
бичихгүй (git-д орно) — оронд нь EAS Environment Variables ашиглана:

```bash
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://….supabase.co"
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "…"
eas env:create --environment production --name EXPO_PUBLIC_CARTO_KEY --value "cb1_…"
```

`eas.json`-ы profile бүр `"environment"` талбараар эдгээрийг татна.

> ⚠️ `EXPO_PUBLIC_*` / `NEXT_PUBLIC_*` нь bundle дотор **ил** очно. Тэдгээрт
> зөвхөн нийтэд харагдаж болох түлхүүр (anon key, суурь зургийн key) тавина.

---

## 2. Supabase

### Migration

`server/supabase/migrations/` доторх файлуудыг **дугаарын дарааллаар** SQL Editor-т
ажиллуулна. Supabase CLI-гаар холбогдоогүй тул `db push` ажиллахгүй — гараар.
Одоогийн байдлаар 0001–0020 бүгд ажиллуулагдсан.

### И-мэйл (Auth SMTP) — ⚠️ production-д бэлэн БИШ

Кодод и-мэйл илгээх хэсэг байхгүй — бүгд Supabase Auth-аар явдаг
(баталгаажуулах код, нууц үг сэргээх). Одоо **Resend-ийн sandbox** горим:
илгээгч `onboarding@resend.dev`, зөвхөн Resend акаунт эзэмшигчийн и-мэйл рүү л
хүрдэг. Өөрөөр хэлбэл **бодит хэрэглэгч бүртгүүлж чадахгүй**.

Засах алхмууд:

1. Resend дээр өөрийн домэйнээ нэмж, DNS-д SPF болон DKIM бичлэг тавих
2. Домэйн баталгаажсаны дараа илгээгчийг `noreply@<домэйн>` болгох
3. Supabase → Authentication → SMTP Settings дээр Resend-ийн SMTP мэдээллийг оруулах
4. Email template-үүд (`Confirm signup`, `Reset password`) `{{ .Token }}` ашигладаг
   хэвээр эсэхийг шалгах — апп нь холбоос биш, **8 оронтой код** уншдаг

### Бусад

- **Rate limit** — Authentication → Rate Limits дээр бүртгэл/код дахин илгээхийг хязгаарлах
- **Backup** — Free tier дээр автомат backup байхгүй. Production-д Pro эсвэл
  тогтмол `pg_dump` төлөвлөх

---

## 3. Native build (EAS)

Урьдчилсан нөхцөл: Apple Developer ($99/жил), Google Play Console ($25 нэг удаа).

```bash
npm i -g eas-cli
eas login
eas init            # app.json-д extra.eas.projectId нэмнэ
```

Дараа нь:

```bash
npm --prefix app run build:preview     # дотоод турших (Android APK)
npm --prefix app run build:android     # Play Store-д
npm --prefix app run build:ios         # App Store-д
npm --prefix app run submit:android
npm --prefix app run submit:ios
```

`app.json`-д тохируулсан: `mn.lumina.app` (bundle id / package), хувилбар 1.0.0,
Lumina дүрс, брэндийн splash (гэрэл/бараан хоёуланд).

> ⚠️ **Android adaptive icon** — `lumina-mark.png` нь ирмэг хүртэл дүүрсэн тул
> дугуй хэлбэрт огтлогдоно. Дугуй дүрсийг сайжруулах бол ~33% зайтай
> 512×512 хувилбар бэлдэж `android.adaptiveIcon.foregroundImage`-д тавина.
> iOS дүрс нь бүтэн дүүрсэн байх нь зөв тул хөндөх шаардлагагүй.
>
> ⚠️ `lumina-mark.png` нь 512×512. iOS-ийн зөвлөмж 1024×1024 — томруулахад
> бага зэрэг зөөлөрнө. Боломжтой бол 1024 хувилбар экспортлох.

---

## 4. Тест

```bash
npm --prefix app run test
npm --prefix frontend run test
```

Хамрах хүрээ: захиалгын **цагийн бүсийн тооцоо** (`ub-time.ts` — хоёр багцад
тусад нь), монгол огнооны формат. Тестүүд зориудаар **UTC** бүсэд ажилладаг —
код нь төхөөрөмж/серверийн цагийн бүсээс хамаарвал шууд унана.

Хамрагдаагүй: DB-тэй харьцдаг query/action-ууд, UI компонент, e2e урсгал.

---

## 5. Production-д БЭЛЭН БИШ хэсгүүд

Эдгээрийг мэдсээр байж гаргах эсэхийг шийднэ:

| Хэсэг | Байдал |
|---|---|
| **И-мэйл** | Resend sandbox — бодит хэрэглэгчид хүрэхгүй (дээрх 2-р хэсэг) |
| **Төлбөр тооцоо** | `invoices` нь зөвхөн туршилтын бүртгэл. Мөнгө шилжихгүй, төлбөрийн хаалга, комисс, payout байхгүй |
| **AI Зөвлөгөө** | Аппын tab нь placeholder |
| **Чат** | Схем байхгүй; артистын Мессеж хуудас placeholder |
| **Гомдол / AI ашиглалт** | Супер админд цэс бий, DB хүснэгт байхгүй |
| **Push мэдэгдэл** | Апп доторх мэдэгдэл ажиллана (0020), утас руу түлхэх хэсэг байхгүй |
| **Dark mode** | Хайх, Захиалга хоёр дэлгэц дээр дутуу |

---

## 6. Гаргахын өмнөх шалгалт

- [ ] Бүх migration (0001–0020) ажиллуулагдсан
- [ ] Гурван эх сурвалжийн орчны хувьсагч бүрэн (дээрх хүснэгтүүд)
- [ ] `npm --prefix frontend run build` цэвэр
- [ ] `npm --prefix app run test` ба `npm --prefix frontend run test` ногоон
- [ ] Supabase SMTP өөрийн домэйн дээр, бодит и-мэйл хүрч байгааг шалгасан
- [ ] Demo өгөгдлийг production-оос цэвэрлэсэн эсвэл тусад нь project ашигласан
- [ ] Газрын зураг ус тэмдэггүй (CARTO түлхүүр `cb1_…` хэлбэртэй, ажиллаж байгааг нүдээр баталсан)

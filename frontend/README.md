# LUMINA — frontend

Figma дизайнаас буулгасан Next.js frontend. 43 route.

## Ажиллуулах

```bash
npm install
cp .env.local.example .env.local   # Supabase түлхүүрээ тавина
npm run dev
```

Supabase тохируулаагүй үед сайт нэвтрэлтгүйгээр ажиллана — `src/proxy.ts` нь
env хоосон бол эрхийн шалгалтыг алгасдаг.

## Өгөгдлийн сан

Схем, RLS, storage bucket бүгд **`server/supabase/migrations/`** дотор.
Тохируулах алхмуудыг [`server/supabase/README.md`](../server/supabase/README.md)
файлаас үзнэ үү.

`src/lib/db-types.ts` нь `server/src/db/types.ts`-ээс автоматаар хуулагддаг —
гараар засахгүй (`cd server && npm run sync:types`).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 — design token-ууд `src/app/globals.css` доторх `@theme` блокт
- Supabase (`@supabase/ssr`) — auth, DB, storage
- lucide-react — icon (brand icon-уудыг `src/components/icons/Brand.tsx` дотор гараар)
- Montserrat (next/font, latin + cyrillic, normal + italic)

Chart-уудыг гадны сан ашиглалгүй inline SVG / CSS-ээр зурсан
(`LineChart`, `BarChart`, `Donut`).

## Бүтэц

| Зам | Тайлбар |
| --- | --- |
| `src/app/(site)` | Нүүр хуудас, нийтийн layout (header/footer) |
| `src/app/(auth)` | Нэвтрэх, бүртгүүлэх, нууц үг сэргээх, OTP |
| `src/app/(register)` | Бизнес бүртгэлийн 5 алхамт wizard |
| `src/app/admin` | Super Admin console (11 хуудас) |
| `src/app/business` | Салоны админ (11 хуудас) |
| `src/app/artist` | Хувиараа артистын админ (10 хуудас) |
| `src/app/status` | Бүртгэл хянагдаж буй/татгалзсан үеийн дэлгэц |
| `src/components/admin/kit.tsx` | Panel, StatCard, Table, Badge, FilterTabs, chart-ууд |
| `src/lib/supabase` | Browser болон server client |
| `src/lib/auth`, `src/lib/registration`, `src/lib/admin` | Server action-ууд |
| `src/proxy.ts` | Сешн сэргээх + эрхийн шалгалт |
| `design/` | Figma-аас spec гаргах скриптүүд |

## Бүртгэлийн урсгал

```
бүртгүүлэх → businesses(draft) → алхам 1..4 хадгалагдана (current_step)
   → Илгээх → submitted → админ хянана → approved  → /business эсвэл /artist
                                       → rejected  → шалтгаантай /status
                                       → needs_info → засаад дахин илгээнэ
```

- Алхам бүр `current_step`-ийг ахиулна. Хэрэглэгч гараад буцаж ирвэл яг тэр
  алхмаас үргэлжилнэ; урагш үсрэхийг proxy хориглоно.
- Файл нь storage-д (`business-docs` хувийн, `business-public` нийтийн), DB-д
  зөвхөн зам хадгална.
- Төлөв солигдох бүрд `verification_events`-д мөр үлдэнэ.
- `approved` болтол панел руу орж чадахгүй.

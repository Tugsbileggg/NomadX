# LUMINA — өгөгдлийн сангийн тохиргоо

Платформын backend нь **Supabase** (Postgres + Auth + Storage). Схем, эрхийн
дүрэм (RLS), storage bucket бүгд энэ хавтас доторх migration-д байна.

`frontend` (Next.js), `app` (Expo) хоёул **энэ нэг л өгөгдлийн сан** руу
холбогдоно.

## Project

| | |
| --- | --- |
| Ref | `neeosuuhhbcaillrptpa` |
| URL | `https://neeosuuhhbcaillrptpa.supabase.co` |

## Схем ажиллуулах

### A хувилбар — SQL Editor (хамгийн хялбар)

Supabase dashboard → **SQL Editor** дотор `migrations/0001_init.sql`-ийг
бүхэлд нь хуулж ажиллуулна. Нэвтрэх шаардлагагүй, нэг удаа.

### B хувилбар — CLI

```bash
cd server
npx supabase login        # браузар нээж, таны бүртгэлээр баталгаажна
npm run db:link           # supabase link --project-ref neeosuuhhbcaillrptpa
npm run db:push           # migrations/-ийг remote руу түлхнэ
```

`db:link` нь өгөгдлийн сангийн нууц үг асууна (Project Settings → Database).

Аль ч замаар дараах зүйлс үүснэ:

| Бүлэг | Агуулга |
| --- | --- |
| Enum | `business_type`, `user_role`, `business_status`, `document_kind` |
| Хүснэгт | `profiles`, `businesses`, `business_hours`, `business_categories`, `documents`, `payout_accounts`, `contracts`, `verification_events` |
| Trigger | `on_auth_user_created` (профайл автоматаар үүсгэнэ), `businesses_touch` (`updated_at`) |
| Функц | `is_super_admin()`, `owns_business(bid)`, `can_read_business(bid)` |
| RLS | Хүснэгт бүр дээр идэвхжсэн — эзэн өөрийнхөө мөрийг, супер админ бүгдийг |
| Storage | `business-docs` (хувийн), `business-public` (нийтийн) + policy |

## Түлхүүрүүдийг тараах

`.env` файлууд аль хэдийн үүссэн, URL нь бөглөгдсөн — зөвхөн **key**-үүдийг
нэмнэ. Supabase dashboard → **Project Settings → API**:

| Хаана | Файл | Юу нэмэх |
| --- | --- | --- |
| frontend | `frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| app | `app/.env` | `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| server | `server/.env` | `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

`anon` key нь браузар руу явдаг, RLS хамгаална. `service_role` key нь
RLS-ийг тойрдог тул **зөвхөн server талд**, хэзээ ч клиент код руу оруулахгүй.

Гурван `.env` файл бүгд `.gitignore`-д орсон.

## Эхний супер админ

Өөрийн бүртгэлээр нэвтэрсний дараа SQL Editor дээр:

```sql
update profiles set role = 'super_admin' where id = (
  select id from auth.users where email = 'таны@имэйл.mn'
);
```

## Схем өөрчлөх

`migrations/` дотор дугаарлаж шинэ файл нэмнэ (`0002_...sql`). Байгаа
migration-ыг засахгүй. Дараа нь `src/db/types.ts`-ийг мөн шинэчилнэ.

## Бүртгэлийн урсгал

```
бүртгүүлэх → businesses(draft) → алхам 1..4 (current_step) → Илгээх
   → submitted → админ хянана → approved   → /business эсвэл /artist
                              → rejected   → шалтгаантай /status
                              → needs_info → засаад дахин илгээнэ
```

Төлөв солигдох бүрд `verification_events`-д мөр үлдэнэ. Файлыг storage-д
хадгалж, DB-д зөвхөн замыг нь бичнэ.

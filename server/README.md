# LUMINA — server

Өгөгдлийн сангийн схем болон серверийн талын код.

## Юу энд байдаг вэ

| Зам | Тайлбар |
| --- | --- |
| `supabase/migrations/` | DB схем, RLS policy, storage bucket — **эх сурвалж** |
| `supabase/README.md` | Supabase project тохируулах алхмууд |
| `src/db/types.ts` | Схемийн TypeScript тодорхойлолт (frontend, app хуваалцана) |
| `src/db/client.ts` | Supabase client — хэрэглэгчийн эрхээр / service_role-оор |
| `src/index.ts` | Hono API |

## Архитектур

Платформын backend нь Supabase өөрөө — Postgres, Auth, Storage, RLS.
`frontend` болон `app` хоёул түүн рүү **шууд** ханддаг бөгөөд эрхийн
хязгаарлалтыг RLS хангана.

```
frontend (Next.js) ─┐
app (Expo) ─────────┼──► Supabase (Postgres + Auth + Storage + RLS)
server (Hono) ──────┘         ▲
                              └── схем: server/supabase/migrations
```

Hono API нь RLS-ээр шийдэгдэхгүй ажлуудад зориулагдана — жишээ нь төлөвлөгөөт
ажил, гуравдагч талын webhook, `service_role` шаардсан тайлан.

## Ажиллуулах

```bash
npm install
cp .env.example .env
vc dev
```

## DB тохируулах

`supabase/README.md` файлыг үзнэ үү.

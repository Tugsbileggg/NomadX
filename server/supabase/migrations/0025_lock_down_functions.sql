-- LUMINA — функцийн EXECUTE эрхийг чангатгах.
-- Supabase SQL Editor дээр 0024_ai_skin_scans.sql-ийн дараа ажиллуулна.
--
-- Шалтгаан: Postgres-д шинэ функц үүсгэхэд EXECUTE эрх нь автоматаар
-- PUBLIC-т очдог. Өмнөх migration-ууд хаана ч revoke хийгээгүй тул
-- нэвтрээгүй хүн ч `supabase.rpc()`-ээр эдгээрийг дуудаж чаддаг байв
-- (Security Advisor-ын "Public Can Execute SECURITY DEFINER Function").
--
-- ⚠️ ЗАРЧИМ: `revoke ... from anon` дангаараа ЮУ Ч ХИЙХГҮЙ. anon нь
-- эрхээ PUBLIC-аас өвлөдөг тул эхлээд PUBLIC-аас татаж, дараа нь
-- хэрэгтэй роль руу нь нэрлэн олгох ёстой. Доор бүх газар тэр дараалал.
--
-- Бүх мэдэгдэл идемпотент (revoke/grant/replace) тул дахин ажиллуулж
-- болно. Аль нэг нь алдаа өгвөл гүйлгээ бүхэлдээ буцна.

begin;

-- ==================================================================
-- 1. touch_updated_at — search_path тогтоов
-- ==================================================================
-- Security Advisor-ын "Function Search Path Mutable" ганц анхааруулга.
-- Энэ функц security definer БИШ, зөвхөн `now()` дууддаг тул бодит
-- эрсдэл байгаагүй ч тогтоох нь үнэгүй.
--
-- `public` биш `''` (хоосон) сонгосон нь илүү чанга: бие нь public
-- schema-аас юу ч авдаггүй, `now()` нь `pg_catalog`-т байдаг бөгөөд
-- түүнийг search_path-аас хасах боломжгүй.
--
-- `create or replace` нь функцийн oid-ыг хадгалдаг тул үүн дээр
-- тулгуурласан 6 триггер хөндөгдөхгүй.
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ==================================================================
-- 2. notify() — ЖИНХЭНЭ НҮХ
-- ==================================================================
-- 0020 дээр "клиентээс өөртөө эсвэл бусдад мэдэгдэл зохиох боломжгүй"
-- гэж бичсэн нь ЗӨВХӨН `notifications`-ийн RLS-ийн хувьд үнэн байв.
-- `notify()` өөрөө security definer, `recipient`-ыг аргумент болгож
-- авдаг, ямар ч эрхийн шалгалтгүй — тиймээс нэвтрээгүй хүн ч profile
-- UUID-г нь мэдэж байвал дурын хүн рүү хуурамч мэдэгдэл илгээж чадна.
-- (anon key-ээр дуудахад HTTP 204 буцсанаар баталсан.)
--
-- Энэ нь ЗӨВХӨН notify_* триггер функцүүдийн дотоод туслах. Тэд бүгд
-- security definer бөгөөд ижил эзэнтэй тул эзний эрхээр дуудсаар байна
-- — мэдэгдлийн урсгал хэвийн үргэлжилнэ.
revoke execute on function public.notify(
  uuid, public.notification_kind, text, text, uuid, uuid
) from public, anon, authenticated;

-- ==================================================================
-- 3. Зөвхөн дотроос дуудагддаг туслах функцүүд
-- ==================================================================
-- booking_local_ts → validate_booking() дотор (0014:44)
-- mn_datetime      → notify_booking_* дотор (0020:104, :148)
-- Хоёулаа security definer функцийн биенээс дуудагддаг тул эзний
-- эрхээр ажиллана.
revoke execute on function
  public.booking_local_ts(timestamptz),
  public.mn_datetime(timestamptz)
from public, anon, authenticated;

-- ==================================================================
-- 4. Нэвтрэлт шаарддаг RPC-ууд — anon-оос хаав
-- ==================================================================
-- Эдгээр нь дотроо `auth.uid()`-ээр шалгадаг тул anon дуудсан ч юу ч
-- өөрчлөгдөхгүй байсан. Гэвч эрхийг нээлттэй үлдээх шалтгаан алга.
--
-- Клиент дуудлагууд бүгд нэвтэрсэн сешн дээр явдгийг шалгасан:
--   mark_invoice_paid     → app/src/lib/bookings.ts:189
--   reply_to_review       → app/src/lib/artist-catalog.ts:319,
--                           frontend/src/lib/reviews/actions.ts:27
--                           (хоёулаа хэрэглэгчийн client, service_role БИШ)
--   register_push_token   → auth-context.tsx:97, зөвхөн session байхад
--   unregister_push_token → signOut() дотор, signOut-ЫН ӨМНӨ
--
-- Сервер (`service_role`) ямар ч RPC дууддаггүй тул түүнд олгох
-- шаардлагагүй.
revoke execute on function
  public.mark_invoice_paid(uuid),
  public.reply_to_review(uuid, text),
  public.register_push_token(text, text),
  public.unregister_push_token(text)
from public, anon, authenticated;

grant execute on function
  public.mark_invoice_paid(uuid),
  public.reply_to_review(uuid, text),
  public.register_push_token(text, text),
  public.unregister_push_token(text)
to authenticated;

-- ==================================================================
-- 5. booking_slot_load — нэвтрээгүй хүнд ЗОРИУДААР нээлттэй
-- ==================================================================
-- Салоны сул цагийг бүртгэлгүй хүн ч харах ёстой (0014:203). PUBLIC-аас
-- татаад яг хоёр роль руу нь буцааж олгоно — эрх өөрчлөгдөхгүй, зөвхөн
-- хэнд өгснөө тодорхой болгож байна.
revoke execute on function
  public.booking_slot_load(uuid, timestamptz, timestamptz)
from public;

grant execute on function
  public.booking_slot_load(uuid, timestamptz, timestamptz)
to anon, authenticated;

commit;


-- ==================================================================
-- ЗОРИУДААР ХӨНДӨӨГҮЙ №1 — RLS policy дотор ашиглагддаг функцүүд
-- ==================================================================
-- can_read_booking(uuid), can_read_booking_ref(text), can_read_business(uuid),
-- is_my_booking_customer(uuid), is_super_admin(), owns_booking(uuid),
-- owns_business(uuid)
--
-- ⚠️ Эдгээрээс EXECUTE эрхийг ТАТАЖ БОЛОХГҮЙ. RLS-ийн policy илэрхийлэл
-- нь асуулга явуулж буй РОЛИЙН эрхээр тооцогддог тул эрхийг нь татвал
-- тэдгээр policy-той хүснэгт бүр "permission denied for function" гэж
-- унана — өөрөөр хэлбэл апп бүхэлдээ зогсоно.
--
-- Аюулгүй байдлын хувьд асуудалгүй: бүгд дотроо `auth.uid()`-ээр
-- шалгадаг тул нэвтрээгүй хүнд `false` буцаана (anon key-ээр туршсан:
-- is_super_admin → false, can_read_business → false).

-- ==================================================================
-- ЗОРИУДААР ХӨНДӨӨГҮЙ №2 — триггер функцүүд
-- ==================================================================
-- handle_new_user, touch_updated_at, validate_booking, enforce_booking_update,
-- enforce_profile_update, notify_booking_created, notify_booking_status,
-- notify_invoice, notify_review_reply, notify_business_status, push_notification
--
-- Эдгээрийг татах нь ЮУ Ч ӨГӨХГҮЙ мөртлөө эрсдэлтэй:
--
-- 1) PostgREST нь `returns trigger` функцийг schema cache-даа ОГТ
--    оруулдаггүй. Anon-оор дуудаж туршихад бүгд HTTP 404 (PGRST202,
--    "not found in schema cache") буцаасан — API-аар хүрэх зам байхгүй.
-- 2) Postgres өөрөө триггер функцийг триггерээс гадуур дуудахыг
--    хориглодог.
-- 3) Харин татвал: триггер асах үеийн эрхийн шалгалтын талаар алдаа
--    гаргавал БҮХ INSERT/UPDATE унана. Ашиг нь тэг, эрсдэл нь өндөр.
--
-- Security Advisor эдгээрийг цаашид ч жагсаана. Энэ бол хүлээн
-- зөвшөөрсөн (accepted) эрсдэл болохоос засагдаагүй алдаа биш.

-- ==================================================================
-- ЗОРИУДААР ХӨНДӨӨГҮЙ №3 — "Public Bucket Allows Listing"
-- ==================================================================
-- `business-public` bucket (0001:211) нь public, SELECT policy нь
-- `bucket_id = 'business-public'` (0001:232) — өөр хязгаарлалтгүй.
-- Тиймээс хүн зөвхөн URL-аа татаад зогсохгүй, доторх бүх файлыг
-- ЖАГСААЖ чадна.
--
-- Дотор нь лого, ковер зураг — аль хэдийн нийтэд зориулсан зүйлс.
-- Баримт бичиг тусдаа `business-docs` bucket-д, `can_read_business()`
-- -ээр зөв хамгаалагдсан. Жагсаалтыг хаах эсэх нь бүтээгдэхүүний
-- шийдвэр тул энд хөндөөгүй.

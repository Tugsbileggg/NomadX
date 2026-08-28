-- LUMINA — захиалгын нэхэмжлэх (ТУРШИЛТЫН).
-- Supabase SQL Editor дээр 0010-ийн дараа ажиллуулна.
--
-- ⚠️ Энэ нь ЗӨВХӨН ТУРШИЛТЫН бүртгэл. Бодит төлбөр тооцоо, банк, төлбөрийн
-- систем ЭНД ОРООГҮЙ — гүйлгээ хийгдэхгүй, мөнгө шилжихгүй. Зөвхөн
-- "бизнес дүнгээ бичиж үлдээх → үйлчлүүлэгч харах" гэсэн урсгалыг
-- туршихад зориулав. Жинхэнэ төлбөр тооцоо нэмэхдээ энэ хүснэгтийг
-- дахин зохиох шаардлагатай болно (валют, НӨАТ, гүйлгээний түүх г.м.).
--
-- Үйлчилгээ нь урьдчилан сонгогддоггүй (үйлчлүүлэгч хүслээ бичдэг) тул
-- дүнг зөвхөн ажил дууссаны дараа бизнес өөрөө тооцож оруулна.

create type invoice_status as enum ('issued', 'paid', 'cancelled');

create table invoices (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings on delete cascade,
  business_id uuid not null references businesses on delete cascade,
  -- Төгрөгөөр, бүхэл тоо — MNT-д бутархай хэрэглэдэггүй.
  amount      integer not null check (amount >= 0),
  note        text,
  status      invoice_status not null default 'issued',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Нэг захиалгад нэг нэхэмжлэх — дүн буруу бол засна.
create unique index invoices_booking_uniq on invoices (booking_id);
create index invoices_business_idx on invoices (business_id, created_at desc);

create trigger invoices_touch
  before update on invoices
  for each row execute function touch_updated_at();

-- -------------------------------------------------------------------- RLS
alter table invoices enable row level security;

-- Захиалгын эзэн (үйлчлүүлэгч) болон бизнес хоёулаа харна — 0009-ийн
-- can_read_booking() нь яг энэ хоёрыг зөвшөөрдөг.
create policy invoices_read on invoices
  for select using (can_read_booking(booking_id) or is_super_admin());

-- Бичих нь зөвхөн бизнесийн эзэн. Үйлчлүүлэгч дүн өөрчилж болохгүй.
create policy invoices_write on invoices
  for all using (owns_business(business_id)) with check (owns_business(business_id));

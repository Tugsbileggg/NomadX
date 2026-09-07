-- LUMINA — AI арьс шинжилгээний түүх.
-- Supabase SQL Editor дээр 0023_invoice_mark_paid.sql-ийн дараа ажиллуулна.
--
-- Зөвхөн Gemini-ийн ТЕКСТ хариуг хадгална — зураг өөрийг нь хэзээ ч бичихгүй
-- (сервер боловсруулаад санах ойгоос шууд хаяна). Мөрийг:
--   1) "Хуучин юу гарсан бэ" гэдгийг хэрэглэгчид харуулах,
--   2) минутанд нэг хүсэлт гэсэн хязгаарлалтыг (serverless тул in-memory биш,
--      cold start болгонд алддаг) шалгахад ашиглана.

create table ai_skin_scans (
  id                      uuid primary key default gen_random_uuid(),
  customer_id             uuid not null references profiles on delete cascade,
  skin_type               text not null,
  concerns                jsonb not null default '[]',
  confidence              text not null,
  summary                 text not null default '',
  recommended_categories  jsonb not null default '[]',
  created_at              timestamptz not null default now()
);

-- Хэрэглэгчийн түүх (шинээс хуучин руу) болон rate-limit шалгалт хоёуланд.
create index ai_skin_scans_customer_idx on ai_skin_scans (customer_id, created_at desc);

alter table ai_skin_scans enable row level security;

-- Хэрэглэгч зөвхөн өөрийн түүхээ харна.
create policy ai_skin_scans_select_own on ai_skin_scans
  for select using (auth.uid() = customer_id);

-- Бичихийг сервер service_role-оор хийдэг (Gemini-ийн хариуг баталгаажуулсны
-- дараа) тул RLS-ийг тойрно, гэхдээ policy-г ирээдүйд клиент шууд бичих
-- тохиолдолд бэлэн байлгав.
create policy ai_skin_scans_insert_own on ai_skin_scans
  for insert with check (auth.uid() = customer_id);

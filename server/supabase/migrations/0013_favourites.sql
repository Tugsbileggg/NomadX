-- LUMINA — дуртай (favourite) бизнесүүд.
-- Supabase SQL Editor дээр 0012-ийн дараа ажиллуулна.
--
-- Хайх дэлгэц дээрх зүрхэн товч. Зөвхөн тухайн хэрэглэгчийнх — бизнес
-- өөрийг нь хэдэн хүн дуртай гэж тэмдэглэснийг харахгүй (хожим тоолуур
-- хэрэгтэй бол count-ийг тусад нь view болгоно).

create table favourites (
  customer_id uuid not null references profiles on delete cascade,
  business_id uuid not null references businesses on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (customer_id, business_id)
);

create index favourites_customer_idx on favourites (customer_id, created_at desc);

alter table favourites enable row level security;

-- Хэрэглэгч зөвхөн өөрийнхөө мөрийг харна, нэмнэ, хасна.
create policy favourites_own on favourites
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

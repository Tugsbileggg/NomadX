-- LUMINA — үйлчилгээ, ажилтан, галерей, сэтгэгдэл.
-- Supabase SQL Editor дээр 0006_bookings.sql-ийн дараа ажиллуулна.
--
-- Одоог хүртэл бизнесийн профайлд зөвхөн нэр, хаяг, танилцуулга л
-- хадгалагддаг байсан. Гар утасны аппын профайл дэлгэц болон салоны
-- панелийн "Үйлчилгээ", "Ажилтнууд" хуудсууд нь дизайнаас буусан
-- хэвээрээ, ард нь хадгалах газаргүй байв — энэ migration түүнийг нөхнө.

-- --------------------------------------------------------------- services
create table services (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses on delete cascade,
  name         text not null,
  description  text,
  -- Төгрөгөөр, бүхэл тоо — MNT-д бутархай хэрэглэдэггүй.
  price        integer not null default 0 check (price >= 0),
  duration_min integer not null default 60 check (duration_min > 0),
  -- Салоны панел дээрх шүүлтүүрт ашиглана ("Үсчин", "Маникюр"…).
  category     text,
  -- Устгахын оронд унтраавал хуучин захиалгын түүх эвдрэхгүй.
  is_active    boolean not null default true,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index services_business_idx on services (business_id, sort_order);

create trigger services_touch
  before update on services
  for each row execute function touch_updated_at();

-- --------------------------------------------------------- business_staff
-- Салоны "Мастерууд". Эдгээр нь нэвтэрдэг хэрэглэгч биш, зөвхөн профайл
-- дээр харагдах бичлэг тул `profiles`-той холбоогүй.
create table business_staff (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses on delete cascade,
  name        text not null,
  -- "Ахлах үсчин", "Маникюрч" гэх мэт.
  role        text,
  -- business-public bucket доторх зам.
  photo_path  text,
  bio         text,
  is_active   boolean not null default true,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index business_staff_business_idx on business_staff (business_id, sort_order);

create trigger business_staff_touch
  before update on business_staff
  for each row execute function touch_updated_at();

-- --------------------------------------------------------- business_media
-- Галерей / бүтээлүүд.
create table business_media (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses on delete cascade,
  -- business-public bucket доторх зам, эсвэл бүтэн http(s) URL.
  storage_path text not null,
  caption      text,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index business_media_business_idx on business_media (business_id, sort_order);

-- ---------------------------------------------------------------- reviews
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses on delete cascade,
  author_id   uuid not null references profiles on delete cascade,
  -- Нэрийг хуулж хадгална: `profiles`-ийн RLS нь өөр хэрэглэгчийн мөрийг
  -- уншуулдаггүй тул join-оор нэр авах боломжгүй. Сэтгэгдэл нь бичигдсэн
  -- үеийн агшны хуулбар байх нь ч зөв.
  author_name text not null default '',
  booking_id  uuid references bookings on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Нэг хэрэглэгч нэг бизнест нэг л сэтгэгдэл үлдээнэ (засаж болно).
create unique index reviews_author_business_uniq on reviews (business_id, author_id);
create index reviews_business_idx on reviews (business_id, created_at desc);

create trigger reviews_touch
  before update on reviews
  for each row execute function touch_updated_at();

-- Профайлын толгой дээрх "4.9 (84)" — сэтгэгдэл бүрийг татахгүйгээр.
-- security_invoker: доорх reviews хүснэгтийн RLS дуудагчийн эрхээр үйлчилнэ,
-- эс тэгвэл view нь RLS-ийг тойрч болзошгүй.
create view business_ratings with (security_invoker = on) as
  select business_id,
         round(avg(rating)::numeric, 1)::float8 as rating,
         count(*)::int                          as review_count
  from reviews
  group by business_id;

grant select on business_ratings to anon, authenticated;

-- -------------------------------------------------------------------- RLS
alter table services       enable row level security;
alter table business_staff enable row level security;
alter table business_media enable row level security;
alter table reviews        enable row level security;

-- Эзэн/админ харна, эзэн бичнэ — 0001-ийн хүүхэд хүснэгтүүдтэй ижил.
-- Нэмээд үйлчлүүлэгч зөвшөөрөгдсөн бизнесийнхийг харна — 0004-ийн адил,
-- эс тэгвэл гар утасны аппад профайл хоосон гарна.
do $$
declare t text;
begin
  foreach t in array array['services', 'business_staff', 'business_media']
  loop
    execute format(
      'create policy %1$s_read on %1$s for select using (can_read_business(business_id));', t);
    execute format(
      'create policy %1$s_write on %1$s for all using (owns_business(business_id)) with check (owns_business(business_id));', t);
    execute format(
      'create policy %1$s_select_public on %1$s for select using ('
      || 'exists (select 1 from businesses where id = business_id and status = ''approved''));', t);
  end loop;
end $$;

-- reviews: уншихад нээлттэй, бичихэд зөвхөн өөрийн нэрээр.
create policy reviews_select_public on reviews
  for select using (
    is_super_admin()
    or exists (select 1 from businesses where id = business_id and status = 'approved')
  );

create policy reviews_insert_own on reviews
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from businesses where id = business_id and status = 'approved')
  );

create policy reviews_update_own on reviews
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy reviews_delete_own on reviews
  for delete using (author_id = auth.uid() or is_super_admin());

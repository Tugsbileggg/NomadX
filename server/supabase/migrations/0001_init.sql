-- LUMINA — бүртгэлийн схем
-- Supabase SQL Editor дээр бүхэлд нь ажиллуулна.

-- ---------------------------------------------------------------- enums
create type business_type   as enum ('salon', 'artist');
create type user_role       as enum ('salon', 'artist', 'super_admin');
create type business_status as enum ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_info');
create type document_kind   as enum ('id_front', 'id_back', 'license', 'certificate', 'logo', 'cover');

-- ---------------------------------------------------------------- profiles
-- auth.users дээр багана нэмж болохгүй тул профайлыг тусад нь барина.
create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text not null default '',
  phone      text,
  role       user_role not null default 'salon',
  created_at timestamptz not null default now()
);

-- Шинэ хэрэглэгч бүртгүүлмэгц профайл автоматаар үүснэ.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'salon')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS доторх дахин дуудлагаас зайлсхийхийн тулд security definer.
create function is_super_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'super_admin');
$$;

-- ---------------------------------------------------------------- businesses
create table businesses (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references profiles on delete cascade,
  type          business_type not null,
  name          text,
  reg_number    text,
  phone         text,
  email         text,
  address       text,
  about         text,
  staff_size    text,
  logo_path     text,
  cover_path    text,
  status        business_status not null default 'draft',
  current_step  smallint not null default 1 check (current_step between 1 and 5),
  submitted_at  timestamptz,
  reviewed_by   uuid references profiles,
  reviewed_at   timestamptz,
  reject_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Нэг эзэн нэг л бүртгэлтэй (татгалзсаныг нь засаад дахин илгээнэ).
create unique index businesses_owner_uniq on businesses (owner_id);
create index businesses_status_idx on businesses (status);

create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_touch
  before update on businesses
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------- child tables
create table business_hours (
  business_id uuid not null references businesses on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6), -- 0 = Даваа
  open_time   time,
  close_time  time,
  is_closed   boolean not null default false,
  primary key (business_id, weekday)
);

create table business_categories (
  business_id uuid not null references businesses on delete cascade,
  category    text not null,
  primary key (business_id, category)
);

create table documents (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses on delete cascade,
  kind         document_kind not null,
  storage_path text not null,
  mime         text,
  size_bytes   bigint,
  uploaded_at  timestamptz not null default now()
);

create index documents_business_idx on documents (business_id);

create table payout_accounts (
  business_id    uuid primary key references businesses on delete cascade,
  bank_name      text,
  holder_name    text,
  account_number text,
  updated_at     timestamptz not null default now()
);

create table contracts (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses on delete cascade,
  version     text not null,
  signed_name text not null,
  signed_at   timestamptz not null default now(),
  ip_address  inet
);

create index contracts_business_idx on contracts (business_id);

-- Төлөв солигдох бүрийн бүртгэл — маргаан гарахад лавлана.
create table verification_events (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses on delete cascade,
  actor_id    uuid references profiles,
  from_status business_status,
  to_status   business_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index verification_events_business_idx on verification_events (business_id, created_at desc);

-- ---------------------------------------------------------------- RLS
alter table profiles            enable row level security;
alter table businesses          enable row level security;
alter table business_hours      enable row level security;
alter table business_categories enable row level security;
alter table documents           enable row level security;
alter table payout_accounts     enable row level security;
alter table contracts           enable row level security;
alter table verification_events enable row level security;

-- profiles
create policy profiles_select_own on profiles
  for select using (id = auth.uid() or is_super_admin());
create policy profiles_update_own on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- businesses: эзэн өөрийнхөө бүртгэлийг харна; засварыг зөвхөн бөглөж байх үед.
create policy businesses_select_own on businesses
  for select using (owner_id = auth.uid() or is_super_admin());
create policy businesses_insert_own on businesses
  for insert with check (owner_id = auth.uid());
create policy businesses_update_own on businesses
  for update using (owner_id = auth.uid() and status in ('draft', 'needs_info', 'rejected'))
  with check (owner_id = auth.uid());
create policy businesses_admin_all on businesses
  for all using (is_super_admin()) with check (is_super_admin());

-- Хүүхэд хүснэгтүүд эзэмшлээ businesses-ээс өвлөнө.
create function owns_business(bid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from businesses
    where id = bid
      and owner_id = auth.uid()
      and status in ('draft', 'needs_info', 'rejected')
  );
$$;

create function can_read_business(bid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select is_super_admin()
      or exists (select 1 from businesses where id = bid and owner_id = auth.uid());
$$;

do $$
declare t text;
begin
  foreach t in array array['business_hours', 'business_categories', 'documents', 'payout_accounts', 'contracts']
  loop
    execute format(
      'create policy %1$s_read on %1$s for select using (can_read_business(business_id));', t);
    execute format(
      'create policy %1$s_write on %1$s for all using (owns_business(business_id)) with check (owns_business(business_id));', t);
  end loop;
end $$;

-- verification_events: харах нь эзэн/админ, бичих нь зөвхөн админ.
create policy verification_events_read on verification_events
  for select using (can_read_business(business_id));
create policy verification_events_insert_admin on verification_events
  for insert with check (is_super_admin());

-- ---------------------------------------------------------------- storage
-- Баримт бичиг хувийн, лого/ковер нийтийн.
insert into storage.buckets (id, name, public) values
  ('business-docs',   'business-docs',   false),
  ('business-public', 'business-public', true)
on conflict (id) do nothing;

-- Замын эхний хэсэг нь business id: "<business_id>/<kind>-<uuid>.<ext>"
create policy docs_owner_read on storage.objects
  for select using (
    bucket_id = 'business-docs'
    and can_read_business((storage.foldername(name))[1]::uuid)
  );
create policy docs_owner_write on storage.objects
  for insert with check (
    bucket_id = 'business-docs'
    and owns_business((storage.foldername(name))[1]::uuid)
  );
create policy docs_owner_delete on storage.objects
  for delete using (
    bucket_id = 'business-docs'
    and owns_business((storage.foldername(name))[1]::uuid)
  );

create policy public_assets_read on storage.objects
  for select using (bucket_id = 'business-public');
create policy public_assets_write on storage.objects
  for insert with check (
    bucket_id = 'business-public'
    and owns_business((storage.foldername(name))[1]::uuid)
  );

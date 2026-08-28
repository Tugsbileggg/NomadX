-- LUMINA — захиалгад жишээ зураг хавсаргах.
-- Supabase SQL Editor дээр 0008-ийн дараа ажиллуулна.
--
-- Захиалгын урсгал өөрчлөгдөв: үйлчлүүлэгч бэлэн үйлчилгээ сонгохын
-- оронд юу хийлгэхээ өөрөө бичиж, жишээ зураг хавсаргана. Үйлчилгээний
-- жагсаалт нь зөвхөн үнийн цэс болж үлдэнэ.
--
-- Зургууд нь хувийн: зөвхөн захиалагч өөрөө болон захиалга хүлээн авсан
-- бизнесийн эзэн харна. Тиймээс bucket нь нийтийн биш, унших эрхийг
-- доорх функцээр шалгана.

-- ------------------------------------------------------------- helpers
create function owns_booking(bid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from bookings where id = bid and customer_id = auth.uid());
$$;

create function can_read_booking(bid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from bookings b
    where b.id = bid
      and (
        b.customer_id = auth.uid()
        or exists (select 1 from businesses where id = b.business_id and owner_id = auth.uid())
      )
  );
$$;

-- -------------------------------------------------------- booking_images
create table booking_images (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references bookings on delete cascade,
  -- booking-refs bucket доторх зам: "<customer_id>/<uuid>.<ext>"
  storage_path text not null,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index booking_images_booking_idx on booking_images (booking_id, sort_order);

alter table booking_images enable row level security;

create policy booking_images_read on booking_images
  for select using (can_read_booking(booking_id) or is_super_admin());

-- Зөвхөн захиалагч өөрөө хавсаргаж, хасна.
create policy booking_images_insert on booking_images
  for insert with check (owns_booking(booking_id));

create policy booking_images_delete on booking_images
  for delete using (owns_booking(booking_id));

-- ------------------------------------------------------------- storage
insert into storage.buckets (id, name, public) values
  ('booking-refs', 'booking-refs', false)
on conflict (id) do nothing;

-- Замын эхний хэсэг нь захиалагчийн id. Бизнесийн эзэн замаараа
-- танигдахгүй тул booking_images-ээр дамжуулан шалгана.
create function can_read_booking_ref(object_name text) returns boolean
language sql security definer stable set search_path = public as $$
  select
    (storage.foldername(object_name))[1] = auth.uid()::text
    or exists (
      select 1
      from booking_images bi
      join bookings b   on b.id = bi.booking_id
      join businesses z on z.id = b.business_id
      where bi.storage_path = object_name
        and z.owner_id = auth.uid()
    );
$$;

create policy booking_refs_read on storage.objects
  for select using (bucket_id = 'booking-refs' and can_read_booking_ref(name));

create policy booking_refs_write on storage.objects
  for insert with check (
    bucket_id = 'booking-refs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy booking_refs_delete on storage.objects
  for delete using (
    bucket_id = 'booking-refs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

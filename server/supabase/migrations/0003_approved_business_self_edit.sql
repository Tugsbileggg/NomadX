-- LUMINA — зөвшөөрөгдсөн (approved) бизнес өөрийн профайлаа засах боломжтой болгоно.
-- Supabase SQL Editor дээр 0002_customer_role.sql-ийн дараа ажиллуулна.
--
-- Өмнө нь зөвхөн draft/needs_info/rejected үед л засах боломжтой байсан тул
-- баталгаажсан бизнес логоо, ажлын цагаа ч солиход хориотой байсан.
-- submitted/under_review үед л засварыг түгжинэ (хяналт хийж байх үед
-- мэдээлэл өөрчлөгдөхгүй байх ёстой тул).

drop policy if exists businesses_update_own on businesses;
create policy businesses_update_own on businesses
  for update using (owner_id = auth.uid() and status in ('draft', 'needs_info', 'rejected', 'approved'))
  with check (owner_id = auth.uid());

create or replace function owns_business(bid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from businesses
    where id = bid
      and owner_id = auth.uid()
      and status in ('draft', 'needs_info', 'rejected', 'approved')
  );
$$;

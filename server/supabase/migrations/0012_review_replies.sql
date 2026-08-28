-- LUMINA — сэтгэгдэлд бизнесийн хариу.
-- Supabase SQL Editor дээр 0011-ийн дараа ажиллуулна.
--
-- Салон/артистын панел дээр сэтгэгдэлд хариу бичих боломж нэмнэ. Хариу нь
-- үйлчлүүлэгчийн аппын профайл дээр сэтгэгдлийн доор харагдана.

alter table reviews
  add column reply      text,
  add column replied_at timestamptz;

-- RLS нь баганаар хязгаарлаж чаддаггүй тул "эзэн бүх мөрөө засаж болно"
-- гэсэн policy нэмбэл тэр эзэн оноогоо ч өөрчилж чадах болно. Иймд
-- хариуг зөвхөн энэ функцээр бичнэ — эзний эрхийг шалгаад, зөвхөн
-- reply/replied_at хоёрыг хөндөнө.
create function reply_to_review(rid uuid, body text) returns void
language plpgsql security definer set search_path = public as $$
declare
  owner_id uuid;
  clean    text := nullif(btrim(body), '');
begin
  select z.owner_id into owner_id
  from reviews r
  join businesses z on z.id = r.business_id
  where r.id = rid;

  if owner_id is null or owner_id <> auth.uid() then
    raise exception 'Энэ сэтгэгдэлд хариулах эрхгүй байна.';
  end if;

  update reviews
     set reply       = clean,
         -- Хоосон илгээвэл хариуг бүрмөсөн устгана.
         replied_at  = case when clean is null then null else now() end
   where id = rid;
end;
$$;

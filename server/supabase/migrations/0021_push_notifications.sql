-- LUMINA — утас руу түлхэх (push) мэдэгдэл.
-- Supabase SQL Editor дээр 0020-ийн дараа ажиллуулна.
--
-- 0020 нь апп ДОТОРХ мэдэгдлийг зохицуулсан: `notifications` хүснэгт,
-- хонхны тоолуур. Гэвч апп хаалттай байхад хэрэглэгч юу ч мэдэхгүй —
-- ганцаараа ажилладаг артист шинэ захиалга ирснийг өөрөө орж шалгаж
-- байж мэддэг байв.
--
-- Энэ migration нь тэр цоорхойг хаана. САНААНЫ ГОЛ ЦЭГ: push-ыг шинээр
-- зохион байгуулахгүй, 0020-д аль хэдийн байгаа `notifications` мөр
-- үүсэх агшинг л сонсоно. Тиймээс мэдэгдлийн ТӨРӨЛ БҮР (шинэ захиалга,
-- баталгаажсан, цуцлагдсан, нэхэмжлэх, сэтгэгдлийн хариу, бүртгэлийн
-- шийдвэр) нэмэлт код бичихгүйгээр push болно. Шинэ төрөл нэмэхэд ч мөн
-- адил — 0020-ийн `notify()`-г дуудсан бүхэн автоматаар түлхэгдэнэ.

-- ---------------------------------------------------------- төхөөрөмжүүд
-- Нэг хүн олон төхөөрөмжтэй байж болно (утас + таблет), нэг төхөөрөмжийг
-- олон хүн ээлжлэн ашиглаж бас болно. Тиймээс түлхүүр нь token өөрөө.
create table push_tokens (
  -- Expo-гийн "ExponentPushToken[...]" хэлбэрийн мөр.
  token      text primary key,
  profile_id uuid not null references profiles on delete cascade,
  -- 'ios' | 'android' — оношлоход л хэрэгтэй.
  platform   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_tokens_profile_idx on push_tokens (profile_id);

alter table push_tokens enable row level security;

-- Клиент өөрийн төхөөрөмжүүдээ л харна, устгана. INSERT/UPDATE policy
-- ЗОРИУДААР байхгүй — бүртгэлийг доорх функцээр л хийнэ (шалтгааныг
-- функцийн тайлбараас үзнэ үү).
create policy push_tokens_select_own on push_tokens
  for select using (profile_id = auth.uid());

create policy push_tokens_delete_own on push_tokens
  for delete using (profile_id = auth.uid());

/**
 * Төхөөрөмжийн token-ыг нэвтэрсэн хэрэглэгчид бүртгэнэ.
 *
 * Энгийн upsert-ээр хийвэл нэг асуудал үлддэг: төхөөрөмжөө өөр хүнд
 * өгсөн, эсвэл нэг утсан дээр өөр бүртгэлээр нэвтэрсэн үед тэр token
 * ӨМНӨХ эзэндээ бүртгэлтэй хэвээр үлдэнэ. RLS нь бусдын мөрийг засахыг
 * зөвшөөрдөггүй тул клиент өөрөө засаж ч чадахгүй — үр дүнд нь өмнөх
 * хэрэглэгчийн мэдэгдэл шинэ хэрэглэгчийн утсан дээр очно. Тиймээс
 * эзэмшил солих эрхийг security definer функцэд төвлөрүүлэв.
 */
create function register_push_token(p_token text, p_platform text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or btrim(coalesce(p_token, '')) = '' then
    return;
  end if;

  insert into push_tokens (token, profile_id, platform)
  values (p_token, auth.uid(), p_platform)
  on conflict (token) do update
    set profile_id = excluded.profile_id,
        platform   = excluded.platform,
        updated_at = now();
end;
$$;

/** Гарахад тухайн төхөөрөмжийг салгана — үгүй бол дараагийн хэрэглэгч
    өмнөхийнх нь мэдэгдлийг хүлээж авна. */
create function unregister_push_token(p_token text)
returns void
language sql security definer set search_path = public as $$
  delete from push_tokens where token = p_token and profile_id = auth.uid();
$$;

-- ------------------------------------------------------------- илгээгч
-- HTTP хүсэлтийг Postgres-ээс шууд явуулна. Supabase дээр `pg_net` нь
-- `extensions` схемд суудаг.
create extension if not exists pg_net with schema extensions;

/**
 * `notifications`-д мөр орох бүрд тухайн хүний бүх төхөөрөмж рүү түлхэнэ.
 *
 * ⚠️ `pg_net` нь ИЛГЭЭГЭЭД МАРТДАГ (fire-and-forget): хариу нь
 * `net._http_response`-д унах ба энэ функц түүнийг уншдаггүй. Өөрөөр
 * хэлбэл Expo-гийн ticket/receipt шалгагдахгүй, хүчингүй болсон token
 * (DeviceNotRegistered) автоматаар цэвэрлэгдэхгүй. Илгээлт бүтэхгүй ч
 * мэдэгдэл үүсэх үндсэн үйлдэл саатахгүй — энэ нь зориудын буулт:
 * апп доторх мэдэгдэл нь найдвартай суваг, push нь түүний нэмэлт.
 */
create function push_notification()
returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare
  device record;
begin
  for device in
    select token from push_tokens where profile_id = new.profile_id
  loop
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Accept', 'application/json'
      ),
      body := jsonb_build_object(
        'to', device.token,
        'title', new.title,
        'body', coalesce(new.body, ''),
        'sound', 'default',
        'priority', 'high',
        -- Дарахад аль дэлгэц рүү очихыг клиент эндээс уншина.
        'data', jsonb_build_object(
          'notificationId', new.id,
          'kind', new.kind,
          'bookingId', new.booking_id,
          'businessId', new.business_id
        )
      )
    );
  end loop;

  return new;
end;
$$;

create trigger notifications_push
  after insert on notifications
  for each row execute function push_notification();

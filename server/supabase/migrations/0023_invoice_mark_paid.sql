-- LUMINA — үйлчлүүлэгч нэхэмжлэхээ төлсөн гэж тэмдэглэх.
-- Supabase SQL Editor дээр 0022-ийн дараа ажиллуулна.
--
-- ⚠️ 0011-ийн анхааруулга ХЭВЭЭРЭЭ: энэ систем БОДИТ ТӨЛБӨР ТООЦОО
-- хийдэггүй. Банк, төлбөрийн систем, гүйлгээ — юу ч холбогдоогүй.
-- Энэ функц нь мөнгө шилжүүлэхгүй, зөвхөн "төлөгдсөн" гэсэн ТЭМДЭГЛЭЛ
-- үлдээнэ. Жинхэнэ төлбөр нэмэхэд гүйлгээний баталгаа нь төлбөрийн
-- системээс ирэх ёстой болохоос клиентийн дуудлагаас ирж болохгүй —
-- тэр үед энэ функцийг устгаж, webhook-оор солино.
--
-- Яагаад RLS биш, функц вэ: 0011-ийн `invoices_write` нь бичих эрхийг
-- зөвхөн бизнесийн эзэнд өгдөг. Үйлчлүүлэгчид UPDATE эрх нээвэл тэр
-- дүнгээ ч өөрчилж чадах болно. Тиймээс эрхийг өргөтгөхийн оронд
-- ЯГ НЭГ шилжилтийг (issued → paid) зөвшөөрсөн функц гаргав.

create function mark_invoice_paid(p_invoice_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  target_booking uuid;
begin
  -- Зөвхөн `issued` төлөвтэйг л авна: цуцлагдсаныг сэргээх, төлөгдсөнийг
  -- дахин тэмдэглэх аль аль нь утгагүй.
  select booking_id into target_booking
  from invoices
  where id = p_invoice_id and status = 'issued';

  if target_booking is null then
    return;
  end if;

  -- `owns_booking()` (0009) нь захиалгын эзэн эсэхийг auth.uid()-ээр
  -- шалгана. Өөр хүний нэхэмжлэхийг тэмдэглэх боломжгүй.
  if not owns_booking(target_booking) then
    return;
  end if;

  update invoices set status = 'paid' where id = p_invoice_id;
end;
$$;

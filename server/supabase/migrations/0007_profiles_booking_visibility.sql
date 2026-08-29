-- LUMINA — profiles-ийн нэмэлт харагдах эрх.
-- Одоогийн profiles_select_own нь зөвхөн өөрийн мөрийг харуулдаг тул
-- бизнесийн эзэн өөрт нь захиалга өгсөн харилцагчийн нэр/утсыг уншиж
-- чадахгүй байсан (business/bookings, artist/bookings хуудсан дээр
-- "Харилцагч" гэсэн нэргүй fallback гардаг байсан шалтгаан).

create policy profiles_select_booking_counterpart on profiles
  for select using (
    exists (
      select 1
      from bookings
      join businesses on businesses.id = bookings.business_id
      where bookings.customer_id = profiles.id
        and businesses.owner_id = auth.uid()
    )
  );

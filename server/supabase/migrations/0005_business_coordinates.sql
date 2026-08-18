-- LUMINA — газрын зурагтай хайлт хийхэд зориулж businesses хүснэгтэд
-- байршлын координат (lat/lng) нэмнэ. Хаягийг geocode хийж дүүргэнэ.

alter table businesses
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create index if not exists businesses_coords_idx on businesses (lat, lng);

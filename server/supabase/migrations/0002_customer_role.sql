-- LUMINA — гар утасны хэрэглэгчийн (customer) эрх нэмэх
-- Supabase SQL Editor дээр 0001_init.sql-ийн дараа ажиллуулна.

alter type user_role add value if not exists 'customer';

/**
 * Гар утасны апп (Expo web export)-ийн нийтэд нээлттэй URL.
 * Тусдаа Vercel project болгож deploy хийгээд энд тохируулна:
 *   NEXT_PUBLIC_MOBILE_APP_URL=https://xxxxx.vercel.app
 */
export const MOBILE_APP_URL = process.env.NEXT_PUBLIC_MOBILE_APP_URL ?? "";

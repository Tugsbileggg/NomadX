import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Supabase Storage-ийн public bucket-аас ирдэг тогтмол (expire-гүй)
    // URL-ууд (лого, ажилтны зураг г.м) — `next/image`-ээр оптимизаци хийж
    // болно. Signed URL ашигладаг газруудад (жишээ нь захиалгын жишээ
    // зураг) кэш хугацаа зөрдөг тул тэнд `unoptimized` хэвээрээ үлдэнэ.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

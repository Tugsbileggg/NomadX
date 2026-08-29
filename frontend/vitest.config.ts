import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Зөвхөн цэвэр логикийн тест — React компонент рендерлэхгүй.
 *
 * `@/` alias нь tsconfig-тэй ижил байхын тулд энд давхар тодорхойлов.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Vercel нь UTC дээр ажилладаг — тестийг ч тэр бүсэд ажиллуулна.
    env: { TZ: "UTC" },
  },
});

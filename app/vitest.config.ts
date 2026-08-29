import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Зөвхөн цэвэр логикийн тест — React Native компонент рендерлэхгүй.
 *
 * `@/` alias нь tsconfig-тэй ижил байхын тулд энд давхар тодорхойлов
 * (vitest tsconfig-ийн paths-ыг өөрөө уншдаггүй). `new URL(...)`-ийн
 * оронд path — RN болон Node-ийн URL төрөл зөрдөг тул tsc унадаг.
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Цагийн бүсээс хамаарсан алдааг барихын тулд тестийг УБ-ээс ӨӨР
    // бүсэд ажиллуулна — код нь тогтмол офсет ашиглах ёстой.
    env: { TZ: "UTC" },
  },
});

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Figma-аас spec гаргах бие даасан Node скриптүүд — Next-ийн код биш.
    "design/**",
    // server/src/db/types.ts-ээс автоматаар хуулагддаг.
    "src/lib/db-types.ts",
  ]),
]);

export default eslintConfig;

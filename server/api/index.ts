// Vercel serverless entry цэг — Root Directory = `server` гэж тохируулсан
// Vercel project-д зориулав (`vercel.json` бүх замыг эндрүү rewrite хийнэ).
// Локал дээр `vc dev` (README-г үзнэ) энэ файлыг олж, зөв route-дуулна.
import { handle } from "hono/vercel"

import app from "../src/index.js"

export const config = { runtime: "nodejs" }

export default handle(app)

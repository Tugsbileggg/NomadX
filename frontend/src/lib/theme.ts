/**
 * Цайвар/бараан горимын сонголт.
 *
 * Сонголтыг СЕРВЕР мэдэхгүй (localStorage нь зөвхөн хөтөч дээр) тул
 * серверийн HTML-д ямар өнгө байхыг шийдэж болохгүй. Иймд урсгалыг
 * ингэж хуваав:
 *
 *   1. `THEME_SCRIPT` нь `<body>`-ийн ХАМГИЙН ЭХНИЙ элемент болж, DOM
 *      зурагдахаас өмнө `<html data-theme>`-ийг тавина.
 *   2. CSS нь зөвхөн `[data-theme="dark"]`-ыг мэднэ (globals.css).
 *   3. `ThemeToggle` нь дараа нь hydrate болж, товчны төлвийг уншина.
 *
 * Ингэснээр цайвар өнгө анивчаад бараан болох (FOUC) явдал гарахгүй.
 */
export const THEME_STORAGE_KEY = "lumina-theme";

export type Theme = "light" | "dark";

/**
 * Хадгалсан сонголтыг, байхгүй бол системийн тохиргоог уншиж
 * `<html data-theme>`-ийг тавих скрипт.
 *
 * `try/catch` нь зайлшгүй: cookie/site data хаасан хөтөч дээр
 * `localStorage`-д хандахад л алдаа шиднэ. Тэр үед хуудас цайвараар
 * ажиллана — товч ажиллах ч сонголт нь хадгалагдахгүй.
 */
export const THEME_SCRIPT = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
var t=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

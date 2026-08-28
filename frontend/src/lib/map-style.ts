/**
 * Газрын зургийн нэгдсэн загвар.
 *
 * `app/src/lib/map-style.ts`-ийн хос. Аппын салонуудын зураг болон
 * вэбийн амьд байршлын зураг хоёр ижил суурь, ижил marker ашиглана —
 * хоёр файлын утгыг хамт өөрчилнө.
 *
 * ⚠️ CARTO нь 2026 оноос суурь зурагтаа API түлхүүр шаарддаг болсон —
 * түлхүүргүй үед tile дээр "API KEY REQUIRED" гэсэн ус тэмдэг гарна.
 * Үнэгүй tier нь сард 5 сая tile, арилжааны бус хэрэглээнд зориулагдсан:
 *   https://carto.com/basemaps/apikey
 *
 * Түлхүүрээ `frontend/.env.local` дотор `NEXT_PUBLIC_CARTO_KEY=...` гэж тавина.
 * Түлхүүргүй үед OpenStreetMap-ийн энгийн зураг руу автоматаар унана —
 * ус тэмдэггүй ажиллана, зөвхөн харагдац нь илүү өнгөлөг, ачаалалтай.
 */
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY

/**
 * `light_all` (Positron) нь бараг өнгөгүй, саарал суурьтай тул брэндийн
 * улбар ягаан marker тодроод харагдана. Өнгөлөг суурь хүсвэл `voyager`
 * (`dark_all` нь харанхуй хувилбар).
 */
const BASEMAP = "light_all"

/** Retina (`@2x`) tile нь зөвхөн CARTO дээр — OSM нь 256px өгдөг. */
export const TILE_URL = CARTO_KEY
  ? `https://basemaps.cartocdn.com/rastertiles/${BASEMAP}/{z}/{x}/{y}@2x.png?key=${CARTO_KEY}`
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

/** Leaflet-ийн `tileSize` нь CSS пиксел тул анхдагч 256-г нь хэвээр
 *  үлдээнэ — 512px зургийг өөрөө 2x нягтралаар буулгана. */

export const TILE_MAX_ZOOM = CARTO_KEY ? 20 : 19

/** Хоёулаа эх сурвалжаа заахыг шаарддаг. */
export const TILE_ATTRIBUTION = CARTO_KEY ? "© OpenStreetMap, © CARTO" : "© OpenStreetMap"

/** Marker-ийн голын диаметр (цагаан хүрээг оруулаагүй). */
export const MARKER_SIZE = 18

/** Marker-ийн цагаан хүрээний зузаан. */
export const MARKER_RING = 3

/** `--color-primary` (globals.css). Leaflet-д CSS хувьсагч дамжуулах
 *  боломжгүй тул утгыг нь шууд бичив. */
export const PIN_COLOR = "#8a4853"

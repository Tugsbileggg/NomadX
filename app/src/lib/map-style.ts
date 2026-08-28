/**
 * Газрын зургийн нэгдсэн загвар.
 *
 * Native (`react-native-maps`) болон web (Leaflet) хоёр ижил суурь зураг,
 * ижил marker ашиглана — ингэснээр утас, хөтөч дээр ялгаагүй харагдана.
 *
 * ⚠️ CARTO нь 2026 оноос суурь зурагтаа API түлхүүр шаарддаг болсон —
 * түлхүүргүй үед tile дээр "API KEY REQUIRED" гэсэн ус тэмдэг гарна.
 * Үнэгүй tier нь сард 5 сая tile, арилжааны бус хэрэглээнд зориулагдсан:
 *   https://carto.com/basemaps/apikey
 *
 * Түлхүүрээ `app/.env` дотор `EXPO_PUBLIC_CARTO_KEY=...` гэж тавина.
 * Түлхүүргүй үед OpenStreetMap-ийн энгийн зураг руу автоматаар унана —
 * ус тэмдэггүй ажиллана, зөвхөн харагдац нь илүү өнгөлөг, ачаалалтай.
 */
const CARTO_KEY = process.env.EXPO_PUBLIC_CARTO_KEY

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

/**
 * `react-native-maps`-ийн `tileSize` нь зургийн **пикселийн** хэмжээ.
 * Leaflet-ийн `tileSize` нь харин CSS пиксел тул түүнд анхдагч 256-г нь
 * хэвээр үлдээнэ — өөрөө 2x болгож буулгана.
 */
export const TILE_SIZE_PX = CARTO_KEY ? 512 : 256

export const TILE_MAX_ZOOM = CARTO_KEY ? 20 : 19

/** Хоёулаа эх сурвалжаа заахыг шаарддаг. */
export const TILE_ATTRIBUTION = CARTO_KEY ? "© OpenStreetMap, © CARTO" : "© OpenStreetMap"

/** Marker-ийн голын диаметр (цагаан хүрээг оруулаагүй). */
export const MARKER_SIZE = 18

/** Marker-ийн цагаан хүрээний зузаан. */
export const MARKER_RING = 3

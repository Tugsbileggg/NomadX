/**
 * Газрын зургийн нэгдсэн загвар.
 *
 * Native (`react-native-maps`) болон web (Leaflet) хоёр ижил суурь зураг,
 * ижил marker ашиглана — ингэснээр утас, хөтөч дээр ялгаагүй харагдана.
 * Платформын өөрийн зураг (iOS дээр Apple Maps, Android дээр Google Maps)
 * нь брэндийн өнгөтэй огт зохицдоггүй тул CARTO-гийн tile-аар сольсон.
 *
 * `light_all` (Positron) нь бараг өнгөгүй, саарал суурьтай тул улбар ягаан
 * marker-ууд тодроод харагдана. Өнгөлөг суурь хүсвэл `voyager` болгоно
 * (`dark_all` нь харанхуй хувилбар).
 */
const BASEMAP = "light_all"

/**
 * Retina (`@2x`) tile — 512×512 пиксел. Хэрэв зураг хэт томорч эсвэл бүдэг
 * харагдвал `@2x`-ыг хасаад `TILE_SIZE_PX`-ийг 256 болгоно.
 */
export const TILE_URL = `https://basemaps.cartocdn.com/rastertiles/${BASEMAP}/{z}/{x}/{y}@2x.png`

/**
 * `react-native-maps`-ийн `tileSize` нь зургийн **пикселийн** хэмжээ тул
 * `@2x` tile-д 512 байна. Leaflet-ийн `tileSize` нь харин CSS пиксел тул
 * түүнд анхдагч 256-г нь хэвээр үлдээнэ — өөрөө 2x болгож буулгана.
 */
export const TILE_SIZE_PX = 512

export const TILE_MAX_ZOOM = 20

/** CARTO болон OpenStreetMap хоёулаа эх сурвалжаа заахыг шаарддаг. */
export const TILE_ATTRIBUTION = "© OpenStreetMap, © CARTO"

/** Marker-ийн голын диаметр (цагаан хүрээг оруулаагүй). */
export const MARKER_SIZE = 18

/** Marker-ийн цагаан хүрээний зузаан. */
export const MARKER_RING = 3

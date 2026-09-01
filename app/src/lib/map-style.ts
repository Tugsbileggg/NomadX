/**
 * Газрын зургийн нэгдсэн загвар.
 *
 * Native (`react-native-maps`) болон web (Leaflet) хоёр ижил суурь зураг,
 * ижил marker ашиглана — ингэснээр утас, хөтөч дээр ялгаагүй харагдана.
 *
 * ⚠️ CARTO нь 2026 оноос суурь зурагтаа API түлхүүр шаарддаг болсон —
 * түлхүүргүй үед tile дээр "API KEY REQUIRED" гэсэн ус тэмдэг гарна.
 *
 * АНХААР — хоёр урхи:
 *
 * 1. Түлхүүр нь `cb1_…` хэлбэртэй СУУРЬ ЗУРГИЙН түлхүүр байх ёстой
 *    (carto.com/basemaps/apikey дээрх маягтаас). CARTO Platform-ийн
 *    `eyJ…` хэлбэрийн access token (SQL/Maps API-д хүчинтэй) ЭНД
 *    АЖИЛЛАХГҮЙ — эдгээр нь өөр хоёр бүтээгдэхүүн. Ижил токеноор
 *    api.carto.com 200 буцаасан ч tile нь ус тэмдэгтэй ирнэ.
 *
 * 2. БУРУУ түлхүүр нь түлхүүргүйгээс ДОР. Хүчингүй үед ч CARTO нь ус
 *    тэмдэгтэй ЗУРАГ (алдаа биш) буцаадаг тул код нь ялгааг мэдэхгүй,
 *    OSM руу ч унахгүй. Баталгаажуулаагүй бол хувьсагчийг ХООСОН үлдээ.
 *
 * Шалгах — t.png дээр "API KEY REQUIRED" бичиг байгаа эсэхийг нүдээр хар:
 *   curl -o t.png "https://a.basemaps.cartocdn.com/rastertiles/light_all/16/52231/22803@2x.png?key=ТҮЛХҮҮР"
 * Үнэгүй tier нь сард 5 сая tile, арилжааны бус хэрэглээнд зориулагдсан:
 *   https://carto.com/basemaps/apikey
 *
 * Түлхүүрээ `app/.env` дотор `EXPO_PUBLIC_CARTO_KEY=...` гэж тавина.
 * Түлхүүргүй үед OpenStreetMap-ийн энгийн зураг руу автоматаар унана —
 * ус тэмдэггүй ажиллана, зөвхөн харагдац нь илүү өнгөлөг, ачаалалтай.
 */
const CARTO_KEY = process.env.EXPO_PUBLIC_CARTO_KEY

export type MapScheme = "light" | "dark"

/**
 * `light_all` (Positron) нь бараг өнгөгүй, саарал суурьтай тул брэндийн
 * улбар ягаан marker тодроод харагдана. `dark_all` нь түүний харанхуй хос.
 */
const BASEMAP: Record<MapScheme, string> = {
  light: "light_all",
  dark: "dark_all",
}

/**
 * Тухайн горимд тохирох tile хаяг. Retina (`@2x`) нь зөвхөн CARTO дээр —
 * OSM нь 256px өгдөг.
 *
 * ⚠️ OSM-д харанхуй хувилбар байхгүй тул түлхүүргүй үед бараан горимд ч
 * цайвар зураг гарна. Энэ нь ус тэмдэгтэй зургаас дээр.
 */
export function tileUrlFor(scheme: MapScheme): string {
  return CARTO_KEY
    ? `https://basemaps.cartocdn.com/rastertiles/${BASEMAP[scheme]}/{z}/{x}/{y}@2x.png?key=${CARTO_KEY}`
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
}

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

/** Улаанбаатарын төв — байршил мэдэгдэхгүй үеийн эхлэх цэг. */
export const UB_CENTER = { lat: 47.9184, lng: 106.9177 }

/** Хот бүхэлдээ багтах ерөнхий харагдац — байршил төвтэй үед. */
export const MAP_ZOOM_OVERVIEW = 12

/**
 * Байршлаа гараар тэмдэглэх зураг. Гудамж танигдахуйц ойр байх ёстой —
 * эс тэгвэл эзэн нь өөрийн байрлалыг нарийн заах боломжгүй.
 */
export const MAP_ZOOM_PIN = 15

/**
 * Leaflet-ийн zoom түвшнийг `react-native-maps`-ийн region delta болгоно.
 *
 * Zoom 0 дээр дэлхий 360° өргөрөгт багтдаг бөгөөд түвшин нэг нэмэгдэх
 * бүрд хагаслана. Хоёр талд нэг тоог хуваалцсанаар утас, хөтөч дээр ижил
 * хэмжээгээр ойртоно.
 */
export function deltaForZoom(zoom: number): number {
  return 360 / 2 ** zoom
}

/** Хэрэглэгчийн байршлын цэгийн диаметр. */
export const ME_DOT_SIZE = 14

/**
 * Байршлын цэгийн өнгө. Брэндийн палитр бүхэлдээ ягаан тул `primary`-г
 * ашиглавал салонуудын marker-тай хутгалдана — газрын зурагт нийтлэг цэнхэр
 * нь хоёр горимд ч ялгарна.
 */
export const ME_DOT_COLOR = "#1a73e8"

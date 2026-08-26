/**
 * Газрын зургийн нэгдсэн загвар — `app/src/lib/map-style.ts`-ийн хос.
 *
 * Аппын салонуудын зураг болон вэбийн амьд байршлын зураг хоёр ижил CARTO
 * суурь, ижил marker ашиглана. Хоёр файлын утгыг хамт өөрчилнө.
 *
 * `light_all` (Positron) нь бараг өнгөгүй, саарал суурьтай тул брэндийн
 * улбар ягаан marker тодроод харагдана. Өнгөлөг суурь хүсвэл `voyager`
 * (`dark_all` нь харанхуй хувилбар).
 */
const BASEMAP = "light_all";

/**
 * Retina (`@2x`) tile. Leaflet-ийн `tileSize` нь CSS пиксел тул анхдагч
 * 256-г нь хэвээр үлдээнэ — 512px зургийг өөрөө 2x нягтралаар буулгана.
 */
export const TILE_URL = `https://basemaps.cartocdn.com/rastertiles/${BASEMAP}/{z}/{x}/{y}@2x.png`;

export const TILE_MAX_ZOOM = 20;

/** CARTO болон OpenStreetMap хоёулаа эх сурвалжаа заахыг шаарддаг. */
export const TILE_ATTRIBUTION = "© OpenStreetMap, © CARTO";

/** `--color-primary` (globals.css). Leaflet-д CSS хувьсагч дамжуулах
 *  боломжгүй тул утгыг нь шууд бичив. */
export const PIN_COLOR = "#8a4853";

/** Marker-ийн голын диаметр (цагаан хүрээг оруулаагүй). */
export const MARKER_SIZE = 18;

/** Marker-ийн цагаан хүрээний зузаан. */
export const MARKER_RING = 3;

import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { BusinessMap } from "@/components/BusinessMap"
import { Brand } from "@/constants/theme"
import {
  fetchBusinessProfile,
  formatDuration,
  formatPrice,
  type BusinessProfile,
  type ProfileMedia,
  type ProfileReview,
  type ProfileService,
  type ProfileStaff,
} from "@/lib/business-profile"
import { ReviewComposer } from "@/components/ReviewComposer"
import { mnTimeAgo } from "@/lib/mn-date"
import { fetchReviewEligibility, type ReviewEligibility } from "@/lib/reviews"
import { fetchFavouriteIds, toggleFavourite } from "@/lib/search"
import { publicAssetUrl } from "@/lib/storage"

const GALLERY_TILE = (Dimensions.get("window").width - 40 - 12) / 2

export default function BusinessDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  // Галерейн бүтэн дэлгэцийн үзүүлэгч — null бол хаалттай.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null)
  const [favourite, setFavourite] = useState(false)

  // Сэтгэгдэл хадгалсны дараа профайл (дундаж оноо ороод) болон эрхийн
  // төлөвийг хамт дахин татна.
  const load = useCallback(async () => {
    const [p, e, favourites] = await Promise.all([
      fetchBusinessProfile(id),
      fetchReviewEligibility(id),
      fetchFavouriteIds(),
    ])
    setProfile(p)
    setEligibility(e)
    setFavourite(favourites.has(id))
    setLoading(false)
  }, [id])

  /** Хариу ирэхээс өмнө зүрхийг сольж, амжилтгүй бол буцаана. */
  async function onToggleFavourite() {
    const next = !favourite
    setFavourite(next)
    const failed = await toggleFavourite(id, next)
    if (failed) setFavourite(!next)
  }

  useEffect(() => {
    let active = true
    load().catch(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [load])

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    )
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackButton onPress={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Бизнес олдсонгүй.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const { business, services, staff, gallery, reviews, rating, todayHours } = profile
  const isSalon = business.type === "salon"
  const hasLocation = business.lat != null && business.lng != null

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        {isSalon ? (
          <SalonHeader profile={profile} />
        ) : (
          <ArtistHeader profile={profile} />
        )}

        {/* Мастерууд — салон дээр л утга учиртай; артист ганцаараа ажиллана. */}
        {isSalon && staff.length > 0 && (
          <Section title="Мастерууд">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.staffRow}
            >
              {staff.map((m) => (
                <StaffCard key={m.id} member={m} />
              ))}
            </ScrollView>
          </Section>
        )}

        {services.length > 0 && (
          <Section title={isSalon ? "Үйлчилгээний цэс" : "Үйлчилгээ & Үнэ"}>
            <Text style={styles.menuHint}>
              Жишиг үнэ. Захиалга өгөхдөө юу хийлгэхээ өөрөө бичиж, жишээ зураг хавсаргана —
              эцсийн дүнг үйлчилгээ дууссаны дараа тооцно.
            </Text>
            <View style={styles.card}>
              {services.map((s, i) => (
                <ServiceRow key={s.id} service={s} divider={i > 0} />
              ))}
            </View>
          </Section>
        )}

        {gallery.length > 0 && (
          <Section title={isSalon ? "Галерей" : "Бүтээлүүд"}>
            <View style={styles.gallery}>
              {gallery.map((g, i) => (
                <GalleryTile key={g.id} item={g} onPress={() => setViewerIndex(i)} />
              ))}
            </View>
          </Section>
        )}

        {business.about ? (
          <Section title="Танилцуулга">
            <View style={styles.card}>
              <Text style={styles.about}>{business.about}</Text>
            </View>
          </Section>
        ) : null}

        {hasLocation && (
          <Section title="Байршил">
            <Pressable
              style={styles.card}
              onPress={() =>
                openInMaps(business.lat as number, business.lng as number, business.name ?? "")
              }
            >
              {/* Зураг зөвхөн харуулах зорилготой — pointerEvents-гүй бол
                  ScrollView-гийн гүйлгэлт болон дарахыг өөр дээрээ авчихна. */}
              <View style={styles.mapWrap} pointerEvents="none">
                <BusinessMap
                  center={{ lat: business.lat as number, lng: business.lng as number }}
                  markers={[
                    {
                      id: business.id,
                      lat: business.lat as number,
                      lng: business.lng as number,
                      title: business.name ?? "",
                    },
                  ]}
                  onMarkerPress={() => {}}
                />
                <View style={styles.mapBadge}>
                  <Ionicons name="navigate" size={11} color={Brand.primary} />
                  <Text style={styles.mapBadgeText}>Замын заавар</Text>
                </View>
              </View>
              {business.address && (
                <View style={styles.mapAddress}>
                  <Ionicons name="location" size={14} color={Brand.primary} />
                  <Text style={styles.mapAddressText}>{business.address}</Text>
                  <Ionicons name="open-outline" size={13} color={Brand.muted} />
                </View>
              )}
            </Pressable>
          </Section>
        )}

        {(reviews.length > 0 || eligibility?.canReview) && (
          <Section
            title="Сэтгэгдэл"
            trailing={rating ? <RatingPill rating={rating} /> : undefined}
          >
            <View style={{ gap: 10 }}>
              {eligibility && (
                <ReviewComposer
                  businessId={business.id}
                  eligibility={eligibility}
                  onSaved={() => void load()}
                />
              )}
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </View>
          </Section>
        )}

        {todayHours && (
          <Text style={styles.hoursNote}>
            Өнөөдөр {todayHours.open}–{todayHours.close} цагийн хооронд ажиллана.
          </Text>
        )}
      </ScrollView>

      <BackButton onPress={() => router.back()} />

      <Pressable onPress={onToggleFavourite} hitSlop={8} style={styles.favourite}>
        <Ionicons
          name={favourite ? "heart" : "heart-outline"}
          size={20}
          color={favourite ? Brand.primary : Brand.primaryLight}
        />
      </Pressable>

      <GalleryViewer items={gallery} index={viewerIndex} onClose={() => setViewerIndex(null)} />

      <SafeAreaView edges={["bottom"]} style={styles.bookBar}>
        <Pressable
          style={styles.bookButton}
          onPress={() => router.push({ pathname: "/book/[id]", params: { id: business.id } })}
        >
          <Text style={styles.bookButtonText}>Цаг захиалах</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </Pressable>
      </SafeAreaView>
    </View>
  )
}

/* ------------------------------------------------------------- headers */

/** Салон — өргөн ковер зураг, доор нь лого, оноо, ажлын цаг. */
function SalonHeader({ profile }: { profile: BusinessProfile }) {
  const { business, rating, todayHours } = profile
  const coverUrl = publicAssetUrl(business.coverPath)
  const logoUrl = publicAssetUrl(business.logoPath)

  return (
    <>
      <View style={styles.cover}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
      </View>

      <View style={styles.salonCard}>
        <View style={styles.salonTopRow}>
          <Avatar url={logoUrl} name={business.name} size={64} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.salonName} numberOfLines={2}>
                {business.name}
              </Text>
              {rating && <RatingPill rating={rating} compact />}
            </View>
            {business.categories.length > 0 && (
              <Text style={styles.categories}>{business.categories.join(" · ")}</Text>
            )}
          </View>
        </View>

        {business.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={Brand.primary} />
            <Text style={styles.address}>{business.address}</Text>
          </View>
        )}

        <View style={styles.hoursPill}>
          <Ionicons
            name="time-outline"
            size={13}
            color={todayHours ? Brand.success : Brand.muted}
          />
          <Text style={[styles.hoursText, !todayHours && { color: Brand.muted }]}>
            {todayHours ? `Нээлттэй · ${todayHours.close} хүртэл` : "Өнөөдөр амарна"}
          </Text>
        </View>
      </View>
    </>
  )
}

/** Хувиараа артист — төвлөрсөн хөрөг, туршлага, баталгаажсан тэмдэг. */
function ArtistHeader({ profile }: { profile: BusinessProfile }) {
  const { business, rating } = profile
  const logoUrl = publicAssetUrl(business.logoPath)

  return (
    <View style={styles.artistCard}>
      <Avatar url={logoUrl} name={business.name} size={88} />

      <Text style={styles.artistName}>{business.name}</Text>
      {business.categories.length > 0 && (
        <Text style={styles.categories}>{business.categories.join(" · ")}</Text>
      )}

      <View style={styles.artistMetaRow}>
        {rating && <RatingPill rating={rating} />}
        {/* Зөвшөөрөгдсөн бизнес л энэ дэлгэц хүртэл ирдэг тул үргэлж үнэн. */}
        <View style={styles.verified}>
          <Ionicons name="checkmark-circle" size={13} color={Brand.success} />
          <Text style={styles.verifiedText}>БАТАЛГААЖСАН</Text>
        </View>
      </View>

      {business.address && (
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color={Brand.primary} />
          <Text style={styles.address}>{business.address}</Text>
        </View>
      )}
    </View>
  )
}

/* -------------------------------------------------------------- pieces */

function Section({
  title,
  trailing,
  children,
}: {
  title: string
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  )
}

/** Зөвхөн харуулах мөр — үйлчилгээг захиалгын үед сонгодоггүй. */
function ServiceRow({ service, divider }: { service: ProfileService; divider: boolean }) {
  return (
    <View style={[styles.serviceRow, divider && styles.divider]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceName}>{service.name}</Text>
        {service.description && (
          <Text style={styles.serviceDesc} numberOfLines={2}>
            {service.description}
          </Text>
        )}
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={12} color={Brand.muted} />
          <Text style={styles.duration}>{formatDuration(service.durationMin)}</Text>
        </View>
      </View>
      <Text style={styles.price}>{formatPrice(service.price)}</Text>
    </View>
  )
}

function StaffCard({ member }: { member: ProfileStaff }) {
  return (
    <View style={styles.staffCard}>
      <Avatar url={publicAssetUrl(member.photoPath)} name={member.name} size={60} />
      <Text style={styles.staffName} numberOfLines={1}>
        {member.name}
      </Text>
      {member.role && (
        <Text style={styles.staffRole} numberOfLines={1}>
          {member.role}
        </Text>
      )}
    </View>
  )
}

function GalleryTile({ item, onPress }: { item: ProfileMedia; onPress: () => void }) {
  const url = publicAssetUrl(item.path)
  return (
    <Pressable onPress={onPress} style={styles.galleryTile}>
      {url ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
    </Pressable>
  )
}

/**
 * Галерейн бүтэн дэлгэцийн үзүүлэгч. Хэвтээ хуудаслалтаар зураг хооронд
 * шудрана; зураг эсвэл × дээр дарвал хаагдана.
 */
function GalleryViewer({
  items,
  index,
  onClose,
}: {
  items: ProfileMedia[]
  index: number | null
  onClose: () => void
}) {
  const { width, height } = useWindowDimensions()
  const scroller = useRef<ScrollView>(null)

  // `contentOffset` нь Android дээр үл хэрэгсэгддэг тул нээгдэх бүрд
  // сонгосон зураг руу нь гараар үсэргэнэ.
  useEffect(() => {
    if (index == null) return
    // Modal-ын агуулга гарч ирсний дараа хэмжээ нь тогтдог тул нэг frame хүлээнэ.
    const id = setTimeout(() => {
      scroller.current?.scrollTo({ x: index * width, animated: false })
    }, 0)
    return () => clearTimeout(id)
  }, [index, width])

  return (
    <Modal visible={index != null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewerBackdrop}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {items.map((item) => {
            const url = publicAssetUrl(item.path)
            return (
              <Pressable key={item.id} onPress={onClose} style={{ width, height }}>
                {url ? (
                  <Image
                    source={{ uri: url }}
                    style={StyleSheet.absoluteFill}
                    contentFit="contain"
                  />
                ) : null}
              </Pressable>
            )
          })}
        </ScrollView>

        <Pressable onPress={onClose} hitSlop={10} style={styles.viewerClose}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  )
}

/**
 * Байршлыг утасны газрын зургийн апп руу дамжуулна. Google Maps суулгасан
 * бол түүнийг эрхэмлэнэ (iOS дээр танихын тулд app.json-д
 * LSApplicationQueriesSchemes бүртгэсэн); үгүй бол платформынхаа өөрийн
 * аппыг нээнэ.
 */
async function openInMaps(lat: number, lng: number, label: string) {
  const google = `comgooglemaps://?q=${lat},${lng}&center=${lat},${lng}&zoom=16`

  if (Platform.OS !== "web") {
    const hasGoogle = await Linking.canOpenURL(google).catch(() => false)
    if (hasGoogle) return Linking.openURL(google)
  }

  const q = encodeURIComponent(label)
  const url =
    Platform.select({
      ios: `maps://?q=${q}&ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${q})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }) ?? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return Linking.openURL(url)
}

function ReviewCard({ review }: { review: ProfileReview }) {
  return (
    <View style={styles.card}>
      <View style={styles.reviewHead}>
        <Avatar url={null} name={review.authorName} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewAuthor}>{review.authorName || "Хэрэглэгч"}</Text>
          <Stars value={review.rating} />
        </View>
        <Text style={styles.reviewAge}>{mnTimeAgo(review.createdAt)}</Text>
      </View>
      {review.body && <Text style={styles.reviewBody}>{review.body}</Text>}

      {review.reply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Бизнесийн хариу</Text>
          <Text style={styles.replyBody}>{review.reply}</Text>
        </View>
      )}
    </View>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < value ? "star" : "star-outline"}
          size={11}
          color={Brand.gold}
        />
      ))}
    </View>
  )
}

function RatingPill({
  rating,
  compact,
}: {
  rating: { average: number; count: number }
  compact?: boolean
}) {
  return (
    <View style={styles.ratingPill}>
      <Ionicons name="star" size={12} color={Brand.gold} />
      <Text style={styles.ratingValue}>{rating.average.toFixed(1)}</Text>
      {!compact && <Text style={styles.ratingCount}>({rating.count})</Text>}
    </View>
  )
}

function Avatar({
  url,
  name,
  size,
}: {
  url: string | null
  name: string | null
  size: number
}) {
  const initial = (name ?? "L").trim().charAt(0).toUpperCase()
  const box = { width: size, height: size, borderRadius: size / 2 }

  return (
    <View style={[styles.avatar, box]}>
      {url ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text style={[styles.avatarInitial, { fontSize: size * 0.36 }]}>{initial}</Text>
      )}
    </View>
  )
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.back}>
      <Ionicons name="chevron-back" size={22} color={Brand.primary} />
    </Pressable>
  )
}

/* -------------------------------------------------------------- styles */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surfaceTint },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, color: Brand.muted },
  // Доод талын тогтмол товчийг тойрч гарах зай.
  page: { paddingBottom: 120 },

  favourite: {
    position: "absolute",
    top: 52,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // Гүйлгэх үед агуулгын дээгүүр хөвдөг тул тусгаарлаж харагдана.
    ...Platform.select({
      ios: {
        shadowColor: Brand.ink,
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
      default: { boxShadow: "0 2px 8px rgba(33,26,27,0.18)" },
    }),
  },

  /* header — салон */
  cover: { height: 190, backgroundColor: Brand.primaryContainer },
  salonCard: {
    marginTop: -28,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 16,
    gap: 10,
  },
  salonTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  salonName: { flex: 1, fontSize: 19, fontWeight: "700", color: Brand.ink },
  hoursPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: Brand.surfaceTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hoursText: { fontSize: 11, fontWeight: "600", color: Brand.success },

  /* header — артист */
  artistCard: {
    marginTop: 88,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  artistName: { fontSize: 21, fontWeight: "700", color: Brand.ink, textAlign: "center" },
  artistMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: "#e9f7ee",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: { fontSize: 10, fontWeight: "700", color: Brand.success },

  categories: { fontSize: 13, color: Brand.body },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  address: { flex: 1, fontSize: 12, color: Brand.body },

  /* section */
  section: { marginTop: 18, marginHorizontal: 20, gap: 10 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Brand.ink },
  card: { borderRadius: 18, backgroundColor: "#fff", padding: 16 },
  menuHint: { fontSize: 11, color: Brand.muted, lineHeight: 16, marginTop: -2 },
  about: { fontSize: 13, lineHeight: 20, color: Brand.body },

  /* үйлчилгээ */
  serviceRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: Brand.outlineSoft },
  serviceName: { fontSize: 14, fontWeight: "600", color: Brand.ink },
  serviceDesc: { fontSize: 12, color: Brand.body, marginTop: 2, lineHeight: 17 },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  duration: { fontSize: 11, color: Brand.muted },
  price: { fontSize: 14, fontWeight: "700", color: Brand.primary },

  /* мастерууд */
  staffRow: { gap: 14, paddingRight: 8 },
  staffCard: { width: 72, alignItems: "center", gap: 5 },
  staffName: { fontSize: 12, fontWeight: "600", color: Brand.ink },
  staffRole: { fontSize: 10, color: Brand.muted, textAlign: "center" },

  /* галерей */
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  galleryTile: {
    width: GALLERY_TILE,
    height: GALLERY_TILE,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Brand.surfaceTint2,
  },

  /* байршил */
  mapWrap: { height: 150, borderRadius: 14, overflow: "hidden" },
  mapBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    // Leaflet-ийн pane-ууд 400-800 z-index-тэй тул түүнээс дээгүүр гаргана.
    zIndex: 900,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mapBadgeText: { fontSize: 10, fontWeight: "700", color: Brand.primary },
  mapAddress: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  mapAddressText: { flex: 1, fontSize: 12, color: Brand.body },

  /* сэтгэгдэл */
  reviewHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAuthor: { fontSize: 13, fontWeight: "700", color: Brand.ink },
  starsRow: { flexDirection: "row", gap: 1, marginTop: 2 },
  reviewAge: { fontSize: 10, color: Brand.muted },
  reviewBody: { fontSize: 12, lineHeight: 19, color: Brand.body, marginTop: 10 },
  replyBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: Brand.surfaceTint,
    padding: 10,
    // Зүүн талын зураас нь хариуг сэтгэгдлээс тусгаарлана.
    borderLeftWidth: 2,
    borderLeftColor: Brand.primaryContainer,
  },
  replyLabel: { fontSize: 10, fontWeight: "700", color: Brand.primary },
  replyBody: { fontSize: 12, lineHeight: 18, color: Brand.body, marginTop: 3 },

  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    backgroundColor: Brand.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingValue: { fontSize: 12, fontWeight: "700", color: Brand.ink },
  ratingCount: { fontSize: 11, color: Brand.muted },

  viewerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)" },
  viewerClose: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    backgroundColor: Brand.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitial: { fontWeight: "700", color: Brand.primaryDark },

  hoursNote: {
    marginTop: 18,
    marginHorizontal: 20,
    fontSize: 11,
    color: Brand.muted,
    textAlign: "center",
  },

  /* доод талын товч */
  bookBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 999,
    backgroundColor: Brand.primary,
    marginBottom: 10,
  },
  bookButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
})

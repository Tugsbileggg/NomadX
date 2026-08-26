import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { mnTimeAgo } from "@/lib/mn-date"
import { publicAssetUrl } from "@/lib/storage"

const GALLERY_TILE = (Dimensions.get("window").width - 40 - 12) / 2

export default function BusinessDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchBusinessProfile(id).then((p) => {
      if (active) {
        setProfile(p)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [id])

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
          <Section title={isSalon ? "Үйлчилгээ" : "Үйлчилгээ & Үнэ"}>
            <View style={styles.card}>
              {services.map((s, i) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  divider={i > 0}
                  onPress={() =>
                    router.push({ pathname: "/book/[id]", params: { id: business.id } })
                  }
                />
              ))}
            </View>
          </Section>
        )}

        {gallery.length > 0 && (
          <Section title={isSalon ? "Галерей" : "Бүтээлүүд"}>
            <View style={styles.gallery}>
              {gallery.map((g) => (
                <GalleryTile key={g.id} item={g} />
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
            <View style={styles.card}>
              {/* Зураг зөвхөн харуулах зорилготой — pointerEvents-гүй бол
                  ScrollView-гийн гүйлгэлтийг өөр дээрээ авчихна. */}
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
              </View>
              {business.address && (
                <View style={styles.mapAddress}>
                  <Ionicons name="location" size={14} color={Brand.primary} />
                  <Text style={styles.mapAddressText}>{business.address}</Text>
                </View>
              )}
            </View>
          </Section>
        )}

        {reviews.length > 0 && (
          <Section
            title="Сэтгэгдэл"
            trailing={rating ? <RatingPill rating={rating} /> : undefined}
          >
            <View style={{ gap: 10 }}>
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

function ServiceRow({
  service,
  divider,
  onPress,
}: {
  service: ProfileService
  divider: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={[styles.serviceRow, divider && styles.divider]}>
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
    </Pressable>
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

function GalleryTile({ item }: { item: ProfileMedia }) {
  const url = publicAssetUrl(item.path)
  return (
    <View style={styles.galleryTile}>
      {url ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
    </View>
  )
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
  mapAddress: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  mapAddressText: { flex: 1, fontSize: 12, color: Brand.body },

  /* сэтгэгдэл */
  reviewHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAuthor: { fontSize: 13, fontWeight: "700", color: Brand.ink },
  starsRow: { flexDirection: "row", gap: 1, marginTop: 2 },
  reviewAge: { fontSize: 10, color: Brand.muted },
  reviewBody: { fontSize: 12, lineHeight: 19, color: Brand.body, marginTop: 10 },

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

import { Stack } from "expo-router";

/**
 * Артистын бүлэг.
 *
 * Эхний ээлжид ганц дэлгэцтэй. Бүртгэлийн урсгал (2-р шат), панел
 * (3-р шат) энд нэмэгдэнэ.
 */
export default function ArtistLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

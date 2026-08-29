import { Stack } from "expo-router";

import { useAuth } from "@/lib/auth-context";

/**
 * Артистын бүлэг.
 *
 * Батлагдсан артист ажлын самбар `(panel)` руу, батлагдаагүй нь
 * бүртгэлийн урсгал руу орно. Хоёрыг `Stack.Protected`-ээр салгаснаар
 * батлагдаагүй хүн панел руу гар аргаар үсэрч чадахгүй.
 */
export default function ArtistLayout() {
  const { account } = useAuth();
  const approved = account?.business?.status === "approved";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={approved}>
        <Stack.Screen name="(panel)" />
      </Stack.Protected>
      <Stack.Protected guard={!approved}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register/info" />
        <Stack.Screen name="register/documents" />
        <Stack.Screen name="register/contract" />
      </Stack.Protected>
    </Stack>
  );
}

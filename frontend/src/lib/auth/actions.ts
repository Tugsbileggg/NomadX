"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | null;

/** Бүртгүүлэх — role нь салон эсвэл хувиараа артист. */
export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const role = formData.get("role") === "artist" ? "artist" : "salon";

  if (!fullName || !email || !password) {
    return { error: "Овог нэр, и-мэйл, нууц үгээ бөглөнө үү." };
  }
  if (password.length < 8) {
    return { error: "Нууц үг доод тал нь 8 тэмдэгт байх ёстой." };
  }
  if (password !== confirm) {
    return { error: "Нууц үг таарахгүй байна." };
  }
  if (!formData.get("terms")) {
    return { error: "Үйлчилгээний нөхцөлийг зөвшөөрнө үү." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone, role } },
  });

  if (error) return { error: translate(error.message) };

  revalidatePath("/", "layout");
  redirect("/business/register");
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "И-мэйл, нууц үгээ оруулна уу." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: translate(error.message) };

  revalidatePath("/", "layout");
  redirect("/business/register");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Нууц үг сэргээх урсгал: forgot-password (и-мэйл) → verify (6 оронтой код) →
 * reset-password (шинэ нууц үг) → password-changed.
 */
export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "И-мэйл хаягаа оруулна уу." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: translate(error.message) };

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function resendResetOtp(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "И-мэйл хаяг олдсонгүй." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: translate(error.message) };
  return null;
}

export async function verifyResetOtp(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = Array.from({ length: 8 }, (_, i) => formData.get(`digit-${i}`) ?? "").join("");

  if (!email) return { error: "И-мэйл хаяг олдсонгүй." };
  if (token.length < 8) return { error: "8 оронтой кодоо бүрэн оруулна уу." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (error) return { error: translate(error.message) };

  redirect("/reset-password");
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Нууц үг доод тал нь 8 тэмдэгт байх ёстой." };
  if (password !== confirm) return { error: "Нууц үг таарахгүй байна." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Сессийн хугацаа дууссан байна. Дахин код авна уу." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translate(error.message) };

  redirect("/password-changed");
}

/** Supabase-ийн англи алдааг харагдах монгол болгоно. */
function translate(message: string) {
  const map: Record<string, string> = {
    "Invalid login credentials": "И-мэйл эсвэл нууц үг буруу байна.",
    "User already registered": "Энэ и-мэйл аль хэдийн бүртгэлтэй байна.",
    "Email not confirmed": "И-мэйлээ баталгаажуулна уу.",
    "Token has expired or is invalid": "Код буруу эсвэл хугацаа нь дууссан байна.",
    "Auth session missing!": "Сессийн хугацаа дууссан байна. Дахин код авна уу.",
  };
  return map[message] ?? message;
}

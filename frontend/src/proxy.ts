import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Бүртгэлийн алхам бүрийн зам — current_step-ээр индекслэнэ. */
const WIZARD_STEPS = [
  "/business/register",
  "/business/register/info",
  "/business/register/documents",
  "/business/register/contract",
  "/business/register/review",
];

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/password-changed",
  // POC — үйлчлүүлэгч захиалгынхаа кодоор артистын байршлыг хардаг,
  // артист утасны хөтчөөс байршлаа илгээдэг.
  // Production дээр захиалгын токеноор хамгаална.
  "/track",
  "/share",
];

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Supabase тохируулаагүй үед сайт нэвтрэлтгүйгээр ажиллаж байг.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() сешнийг сэргээж, cookie-г шинэчилнэ. Заавал дуудна.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!user) {
    return isPublic ? response : redirect(request, "/login");
  }

  // Нэвтэрсэн хүн login/register дээр очих шаардлагагүй.
  if (pathname === "/login" || pathname === "/register") {
    return redirect(request, "/business/register");
  }

  if (isPublic) return response;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "salon";

  if (pathname.startsWith("/admin")) {
    return role === "super_admin" ? response : redirect(request, "/business/register");
  }

  // Супер админ бүртгэлийн урсгалд хамаарахгүй.
  if (role === "super_admin") return redirect(request, "/admin");

  const { data: business } = await supabase
    .from("businesses")
    .select("status, current_step")
    .eq("owner_id", user.id)
    .maybeSingle();

  const status = business?.status ?? null;
  const step = business?.current_step ?? 1;

  if (pathname.startsWith("/business/register")) {
    // Илгээчихсэн бол дахин бөглөх ёсгүй.
    if (status && ["submitted", "under_review", "approved"].includes(status)) {
      return redirect(request, status === "approved" ? panelFor(role) : "/status");
    }
    // Дараагийн алхам руу үсрэхийг хориглоно — өмнөхийг эхлээд бөглөнө.
    const requested = WIZARD_STEPS.indexOf(pathname) + 1;
    if (requested > step) return redirect(request, WIZARD_STEPS[step - 1]);
    return response;
  }

  if (pathname === "/status") {
    return status === "approved" ? redirect(request, panelFor(role)) : response;
  }

  if (pathname.startsWith("/business") || pathname.startsWith("/artist")) {
    if (status !== "approved") {
      return redirect(request, status ? "/status" : "/business/register");
    }
    // Салон артистын панел руу, артист салоны панел руу орохгүй.
    const panel = panelFor(role);
    if (!pathname.startsWith(panel)) return redirect(request, panel);
  }

  return response;
}

function panelFor(role: string) {
  return role === "artist" ? "/artist" : "/business";
}

function redirect(request: NextRequest, to: string) {
  const url = request.nextUrl.clone();
  url.pathname = to;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Статик файл, зураг, favicon-оос бусад бүх зам.
    "/((?!_next/static|_next/image|img/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

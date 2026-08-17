import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Clock, RefreshCw, XCircle } from "lucide-react";
import { RegisterTopBar } from "@/components/register/shell";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Бүртгэлийн төлөв — LUMINA" };

const VIEW = {
  submitted: {
    icon: Clock,
    tone: "bg-surface-tint text-primary",
    title: "Бүртгэл хянагдахыг хүлээж байна",
    body: "Таны бүртгэлийг хүлээн авлаа. Манай баг баримт бичгийг шалгаад ажлын 1-2 өдөрт хариу мэдэгдэнэ.",
  },
  under_review: {
    icon: RefreshCw,
    tone: "bg-surface-tint text-primary",
    title: "Бүртгэл хянагдаж байна",
    body: "Манай баг таны материалтай танилцаж байна. Удахгүй хариу өгөх болно.",
  },
  needs_info: {
    icon: AlertTriangle,
    tone: "bg-[#fef3c7] text-warning-darker",
    title: "Нэмэлт мэдээлэл шаардлагатай",
    body: "Дараах зүйлийг нөхөж илгээнэ үү:",
  },
  rejected: {
    icon: XCircle,
    tone: "bg-[#fee2e2] text-danger-dark",
    title: "Бүртгэл татгалзагдсан",
    body: "Шалтгаан:",
  },
} as const;

export default async function StatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("status, name, submitted_at, reject_reason")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  if (!business) redirect("/business/register");
  if (business.status === "draft") redirect("/business/register");

  const view = VIEW[business.status as keyof typeof VIEW] ?? VIEW.submitted;
  const Icon = view.icon;
  const canEdit = business.status === "needs_info" || business.status === "rejected";

  return (
    <div className="bg-aurora min-h-screen">
      <RegisterTopBar exit={false} />

      <main className="mx-auto flex max-w-[560px] flex-col items-center gap-6 px-6 py-24 text-center">
        <span className={`flex size-20 items-center justify-center rounded-full ${view.tone}`}>
          <Icon className="size-9" strokeWidth={1.6} />
        </span>

        <h1 className="text-[28px] leading-9 font-semibold text-ink">{view.title}</h1>

        <p className="text-base leading-6 text-body">{view.body}</p>

        {business.reject_reason && (
          <p className="w-full rounded-xl bg-white px-6 py-4 text-left text-sm leading-6 text-body shadow-hairline">
            {business.reject_reason}
          </p>
        )}

        <dl className="mt-2 flex w-full flex-col gap-2 rounded-2xl bg-white/70 px-6 py-5 text-left text-sm shadow-soft backdrop-blur-xl">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Байгууллага</dt>
            <dd className="font-medium text-ink">{business.name ?? "—"}</dd>
          </div>
          {business.submitted_at && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Илгээсэн</dt>
              <dd className="font-medium text-ink">
                {new Date(business.submitted_at).toLocaleDateString("mn-MN")}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {canEdit && (
            <Link
              href="/business/register/info"
              className="flex h-12 items-center rounded-full bg-primary px-8 text-base font-medium text-white hover:bg-primary-dark"
            >
              Мэдээллээ засах
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex h-12 items-center rounded-full border border-outline bg-white px-8 text-base font-medium text-body hover:bg-surface-tint"
            >
              Гарах
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

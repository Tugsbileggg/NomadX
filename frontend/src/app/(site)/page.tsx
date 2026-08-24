import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { DownloadAppButton } from "@/components/DownloadAppButton";
import { ButtonLink } from "@/components/ui/Button";
import { CATEGORIES, FEATURES, PROVIDERS, STEPS } from "@/lib/home-data";
import { MOBILE_APP_URL } from "@/lib/mobile-app-url";

const STEP_ICONS = [Search, Sparkles, CalendarCheck];

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyUs />
      <HowItWorks />
      <PopularCategories />
      <FeaturedProviders />
      <BusinessBanner />
    </>
  );
}

async function Hero() {
  const qrSvg = MOBILE_APP_URL
    ? await QRCode.toString(MOBILE_APP_URL, { type: "svg", margin: 1 })
    : null;

  return (
    <section className="px-4 py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 py-20 lg:flex-row">
        <div className="flex flex-1 flex-col gap-8 lg:max-w-[564px]">
          <h1 className="text-[40px] leading-[1.14] font-bold text-ink sm:text-[56px]">
            Монголын
            <br />
            хамгийн <em className="font-bold text-primary italic">ухаалаг</em>
            <br />
            гоо сайхны
            <br />
            платформ
          </h1>

          <p className="text-lg leading-7 text-body">
            Шилдэг гоо сайхны мэргэжилтнүүдийг олж, хиймэл оюун ухааны
            тусламжтайгаар өөрт тохирох үйлчилгээг сонгон, цагаа хялбархан
            захиалаарай.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <DownloadAppButton qrSvg={qrSvg} url={MOBILE_APP_URL} />
            <ButtonLink href="/business/register" variant="white" size="lg">
              Салон/Артист болох
            </ButtonLink>
          </div>

          <div className="flex items-center gap-4 pt-8">
            <div className="flex">
              {["/img/user-1.jpg", "/img/user-2.jpg", "/img/user-3.jpg"].map(
                (src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    className={cnAvatar(i)}
                  />
                ),
              )}
            </div>
            <p className="text-sm leading-5 font-bold text-primary">
              10,00+ хэрэглэгчид нэгдсэн
            </p>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <Image
            src="/img/hero-phone.png"
            alt="LUMINA аппликейшны дэлгэц"
            width={746}
            height={746}
            priority
            className="w-full max-w-[746px]"
          />

          <FloatingCard
            className="top-[13%] right-0"
            icon={<BadgeCheck className="size-5 text-success-dark" />}
            iconBg="bg-[#dcfce7]"
            title="Баталгаажсан"
            subtitle="Топ Артист"
          />
          <FloatingCard
            className="bottom-[10%] left-0"
            icon={<Sparkles className="size-[22px] text-primary" />}
            iconBg="bg-primary-container"
            title="AI Зөвлөх"
            subtitle="Таны арьсанд тохирно"
          />
        </div>
      </div>
    </section>
  );
}

function cnAvatar(i: number) {
  return `size-12 rounded-full border-2 border-white object-cover ${i > 0 ? "-ml-4" : ""}`;
}

function FloatingCard({
  className,
  icon,
  iconBg,
  title,
  subtitle,
}: {
  className: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={`glass absolute hidden items-center gap-3 rounded-4xl p-4 shadow-soft sm:flex ${className}`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm leading-5 font-bold text-ink">{title}</p>
        <p className="text-xs leading-4 text-body">{subtitle}</p>
      </div>
    </div>
  );
}

function WhyUs() {
  return (
    <section className="mx-auto max-w-[1200px] px-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-[28px] leading-9 font-semibold text-ink">
          Яагаад бид?
        </h2>
        <p className="max-w-[672px] text-base text-body">
          Таны гоо сайхны хэрэгцээг нэг дор, хамгийн хялбар бөгөөд
          найдвартайгаар шийдэх цогц платформ.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <article key={f.title} className="soft-card flex flex-col gap-3 p-8">
            <div
              className="size-16 shrink-0 bg-[url('/img/feature-sprite.jpg')] bg-[length:128px_128px]"
              style={{ backgroundPosition: f.sprite }}
              role="presentation"
            />
            <h3 className="pt-3 text-lg leading-6 font-medium text-ink">
              {f.title}
            </h3>
            <p className="text-sm leading-5 text-body">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="px-10 py-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-20 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-[28px] leading-9 font-semibold text-ink">
            Хэрхэн ажилладаг вэ?
          </h2>
          <p className="text-base text-body">
            Ердөө 3 энгийн алхмаар гоо сайхны үйлчилгээгээ авна.
          </p>
        </div>

        <div className="relative grid w-full gap-12 md:grid-cols-3">
          {/* connector line behind the three step badges */}
          <div
            aria-hidden
            className="absolute top-12 right-[16.6%] left-[16.6%] hidden h-px bg-outline/50 md:block"
          />
          {STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            const isLast = i === STEPS.length - 1;
            return (
              <div
                key={s.n}
                className="relative flex flex-col items-center gap-4 text-center"
              >
                <div className="relative">
                  <div
                    className={`flex size-24 items-center justify-center rounded-full shadow-card ${
                      isLast ? "bg-primary" : "bg-white"
                    }`}
                  >
                    <Icon
                      className={`size-8 ${isLast ? "text-white" : "text-primary"}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-lg leading-6 font-medium text-ink">
                  {s.title}
                </h3>
                <p className="max-w-[240px] text-sm leading-5 text-body">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PopularCategories() {
  return (
    <section className="glass px-10 py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg leading-6 font-semibold text-ink">
            Түгээмэл ангилал
          </h2>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
          >
            Бүгдийг үзэх
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-4 gap-x-4 gap-y-6 md:grid-cols-8">
          {CATEGORIES.map((c) => (
            <li key={c.label}>
              <Link
                href="/search"
                className="group flex flex-col items-center gap-3"
              >
                <Image
                  src={c.img}
                  alt={c.label}
                  width={110}
                  height={110}
                  className="size-[110px] rounded-4xl border border-white/60 object-cover shadow-hairline transition-transform group-hover:-translate-y-1"
                />
                <span className="text-sm text-body group-hover:text-primary">
                  {c.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturedProviders() {
  return (
    <section className="mx-auto max-w-[1200px] px-10 py-16">
      <div className="flex flex-col gap-10 px-6">
        <div className="flex items-end justify-between gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-[28px] leading-9 font-semibold text-ink">
              Онцлох Салон &amp; Артистууд
            </h2>
            <p className="text-base text-body">
              Хамгийн өндөр үнэлгээтэй, чадварлаг мэргэжилтнүүд.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            {[ChevronLeft, ChevronRight].map((Icon, i) => (
              <button
                key={i}
                type="button"
                aria-label={i === 0 ? "Өмнөх" : "Дараах"}
                className="flex size-10 items-center justify-center rounded-full bg-white shadow-[4px_4px_12px_rgba(140,75,85,0.15)] hover:bg-surface-tint"
              >
                <Icon className="size-4 text-ink" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PROVIDERS.map((p) => (
            <article key={p.name} className="soft-card overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={p.cover}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 361px, 100vw"
                  className="object-cover"
                />
                <div className="glass absolute top-4 right-4 flex items-center gap-1 rounded-full px-3 py-1 shadow-soft">
                  <Star className="size-3 fill-primary text-primary" />
                  <span className="text-sm leading-5 font-medium text-ink">
                    {p.rating}
                  </span>
                </div>
              </div>

              <div className="relative px-6 pt-14 pb-6">
                <Image
                  src={p.avatar}
                  alt=""
                  width={64}
                  height={64}
                  className="absolute -top-8 left-6 size-16 rounded-full border-4 border-white object-cover shadow-hairline"
                />
                <div className="flex items-center gap-1">
                  <h3 className="text-lg leading-6 font-medium text-ink">
                    {p.name}
                  </h3>
                  <BadgeCheck className="size-4 shrink-0 text-primary" />
                </div>
                <p className="mt-1 text-sm leading-5 text-body">{p.tags}</p>

                <div className="mt-4 flex items-center justify-between border-t border-surface-tint pt-4">
                  <span className="text-sm leading-5 text-body">
                    Эхлэх үнэ:
                  </span>
                  <span className="text-base leading-6 font-semibold text-primary">
                    {p.price}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <ButtonLink href="/search" variant="white">
            Цааш үзэх
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function BusinessBanner() {
  return (
    <section className="mx-auto max-w-[1200px] px-10 pb-20">
      <div className="glass relative overflow-hidden rounded-5xl shadow-soft">
        <Image
          src="/img/banner-bg.jpg"
          alt=""
          fill
          sizes="1200px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-[rgba(140,75,85,0.9)] to-[rgba(166,96,107,0.8)]"
        />

        <div className="relative flex flex-col items-center gap-16 p-16 lg:flex-row lg:justify-between">
          <div className="max-w-[551px] text-white">
            <h2 className="text-[28px] leading-9 font-semibold drop-shadow-sm">
              Салон эсвэл хувиараа мэргэжилтэн үү? Бидэнтэй нэгдээрэй.
            </h2>
            <p className="mt-4 text-base leading-6 font-medium text-white/90">
              Орлогоо нэмэгдүүлж, шинэ харилцагчдад хүрч, цагийн хуваариа
              ухаалгаар удирдах боломж.
            </p>

            <div className="mt-4 flex items-center gap-6 py-4">
              <div>
                <p className="text-[30px] leading-9 font-bold drop-shadow-sm">
                  10,000+
                </p>
                <p className="text-sm leading-5 font-medium text-white/80">
                  Сарын захиалга
                </p>
              </div>
              <div className="h-14 w-px bg-white/30" />
              <div>
                <p className="text-[30px] leading-9 font-bold drop-shadow-sm">
                  500+
                </p>
                <p className="text-sm leading-5 font-medium text-white/80">
                  Мастерууд
                </p>
              </div>
            </div>

            <ButtonLink href="/business/register" variant="white" size="lg">
              Бүртгүүлэх
              <ArrowRight className="size-[13px]" />
            </ButtonLink>
          </div>

          <BookingPreviewCard />
        </div>
      </div>
    </section>
  );
}

function BookingPreviewCard() {
  return (
    <div className="soft-card relative w-full max-w-[370px] overflow-hidden rounded-4xl p-6">
      {/* blurred colour blooms tucked behind the card content */}
      <div
        aria-hidden
        className="absolute -top-2 -right-2 size-21 rounded-full bg-[rgba(255,217,221,0.5)] blur-xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-2 -left-2 size-21 rounded-full bg-[rgba(255,178,188,0.5)] blur-xl"
      />

      <div className="relative">
        <div className="flex items-center gap-4 border-b border-surface-tint pb-4">
          <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-primary-container">
            <CalendarCheck className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-base leading-6 font-bold text-ink">
              Шинэ захиалга
            </p>
            <p className="text-xs leading-4 text-body">Яг одоо</p>
          </div>
        </div>

        <dl className="flex flex-col gap-2 pt-4 text-sm leading-5 font-medium text-ink">
          <div>Үйлчлүүлэгч: Сарнай</div>
          <div>Үйлчилгээ: Үс будалт &amp; Тайралт</div>
          <div>Цаг: Өнөөдөр, 14:30</div>
        </dl>

        <button
          type="button"
          className="mt-4 h-[60px] w-full rounded-xl bg-primary text-sm leading-5 font-bold text-white shadow-[4px_4px_12px_rgba(140,75,85,0.15)] hover:bg-primary-dark"
        >
          Баталгаажуулах
        </button>
      </div>
    </div>
  );
}

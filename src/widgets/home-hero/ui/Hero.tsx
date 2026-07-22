import Image from "next/image";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";
import {
  FRAME_SHADOWS,
  type FrameStyle,
} from "@/entities/product/lib/frameStyle";
import { CanvasEdgeOverlay } from "@/entities/product/ui/CanvasEdgeOverlay";

const SOCIAL_PROOF_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6DgqXswmvwDWNDv1q2X7m7lAnB34Z1hb2f9ISZJO8IQr2GyPfrff5dyLR4UyCo8jM9sOgRUVjreHp_91Zc233yM9MSdg1SLkSEWt5eJffB4Ns5dPj2IxcVZoA8jdN82nqKgc__ag8xMOiHult_2ciiQqIGnrlVmmdk1PbSfAmK4UhCZBQxfo532cbUb96JNWqcFmnxHRnFHueGM0rNM4ZJeY7dq5IxF3Cnny0SkiCZ-tSrKFrgg9jfAo8UB1m8OZ_hb5CknVIQYsg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTWHCYfQET_qj7P9AVFTmaEHpDfPp6QWspagVxJqDGw1FvprnYi37nZK-k8RLcJrtSo3KjwPPixPCnphXLpKl-ERDXfD-yekwstIrNwNyo0jxMbpO6taPmWSZoVHAr6tshCVuh1UiSA1F-gFG9T07CW3a49NGIuhj3DF9jYypG0AqiYOpjqA-ThkFYGVES2YD9WIl47vV6qYQ7tLWFd9iZKwDlk_pc9v6lSsm5JqoMn_aTNK98X4V1RjmXjy4Vlb98DOu7dmQka7TK",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxwdrz9AP1t68eOQ76ZYjIe-hXC0i7BP_vLztVyDF4H8oGHZoZasluOpA0W-J777f3eebeCdYQzvnwMYeA9-d8KWudRdMWLxVpT7oTzbjXFR7cs-FYfriYx0PH6uXZdSbXxN1RVVL-ovqH2INyB75O9kpWj3N1GYgb1XNCXJpjR_uX5WfhsxBOKFC-yRl3qNKCU0k4OmH1LZejG7cTzfLHeb4WGsJ0Q5h5hTGWz94jKbXpFnl5IiEYT4kTFMVS9jwyGlVTTUyVvSW1",
];

type HeroCta = {
  href: string;
  label: string;
  /** Material Symbols icon name shown before the label */
  icon?: string;
};

type HeroMedia = {
  src: string;
  alt: string;
  /** Intrinsic size of the asset; drives the frame's aspect ratio */
  width: number;
  height: number;
} & ({ kind: "video"; poster?: string } | { kind: "image" });

type HeroBadge = {
  icon: string;
  title: string;
  subtitle: string;
  /** Tailwind classes for the icon bubble */
  iconClassName?: string;
};

export type HeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  /** Small reassurance line below the CTAs */
  note?: string;
  media: HeroMedia;
  /**
   * Product-like presentation for the media frame: brings its own shadow, plus
   * the wrap darkening when it's "canvas". Left out, the frame stays flat and
   * only `mediaClassName` styles it.
   */
  frameStyle?: FrameStyle;
  /**
   * Extra classes for the media frame (rounding, a custom shadow). The aspect
   * ratio comes from the media size, so this only carries looks.
   */
  mediaClassName?: string;
  badge: HeroBadge;
  /** Fade the text column in on mount */
  animateText?: boolean;
};

export default function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  note,
  media,
  frameStyle,
  mediaClassName = "",
  badge,
  animateText = false,
}: HeroProps) {
  const fade = animateText ? "animate-fade-in-up" : "";

  return (
    <section className="w-full bg-cream py-12 md:py-20 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <div className="flex flex-col gap-4">
              <span
                className={`text-primary font-bold tracking-wider uppercase text-sm ${fade}`}
              >
                {eyebrow}
              </span>
              <h1
                className={`font-display text-slate-dark text-4xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl ${fade}`}
              >
                {title}
              </h1>
              <p
                className={`text-slate-dark/80 text-lg font-normal leading-relaxed max-w-md ${fade}`}
              >
                {description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={primaryCta.href}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:bg-primary-dark"
              >
                {primaryCta.icon && (
                  <span className="material-symbols-outlined text-[20px]">
                    {primaryCta.icon}
                  </span>
                )}
                {primaryCta.label}
              </Link>
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-dark border border-slate-dark/10 transition-colors hover:bg-slate-50"
                >
                  {secondaryCta.icon && (
                    <span className="material-symbols-outlined text-[20px]">
                      {secondaryCta.icon}
                    </span>
                  )}
                  {secondaryCta.label}
                </Link>
              )}
            </div>
            {note && (
              <p className="text-xs font-medium text-slate-dark/60">{note}</p>
            )}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {SOCIAL_PROOF_AVATARS.map((src, i) => (
                  <div
                    key={i}
                    className="size-10 rounded-full border-2 border-cream bg-gray-200 bg-cover bg-center"
                    style={{ backgroundImage: `url('${src}')` }}
                  ></div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-500 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[16px] fill-current"
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-dark/70">
                  Loved by 10,000+ pet parents
                </span>
              </div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div
              className={`relative w-full overflow-hidden bg-white rotate-2 hover:rotate-0 transition-all duration-500 ${
                frameStyle ? FRAME_SHADOWS[frameStyle] : ""
              } ${mediaClassName}`}
              style={{ aspectRatio: `${media.width} / ${media.height}` }}
            >
              {media.kind === "video" ? (
                <video
                  className="h-full w-full object-cover"
                  src={media.src}
                  poster={media.poster}
                  width={media.width}
                  height={media.height}
                  autoPlay
                  muted
                  playsInline
                  aria-label={media.alt}
                />
              ) : (
                <Image
                  src={media.src}
                  alt={media.alt}
                  width={media.width}
                  height={media.height}
                  priority
                  className="h-full w-full object-cover"
                />
              )}
              {frameStyle === "canvas" && <CanvasEdgeOverlay />}
            </div>
            <div className="absolute -bottom-6 -left-6 hidden lg:block">
              <div className="rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center rounded-full p-2 ${
                      badge.iconClassName ?? "bg-primary/10 text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {badge.icon}
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-dark">
                      {badge.title}
                    </p>
                    <p className="text-xs text-slate-dark/60">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

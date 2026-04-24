import { APP_OWNER_PROFILE } from "@/lib/app-owner";

export function BrandLogoMark({
  sizeClassName = "h-10 w-10",
  className = "",
  imageClassName = "",
}: {
  sizeClassName?: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-[18px] bg-white/8 ${sizeClassName} ${className}`.trim()}
    >
      <img
        src={APP_OWNER_PROFILE.logoUrl}
        alt={APP_OWNER_PROFILE.logoAlt}
        className={`h-full w-full object-contain ${imageClassName}`.trim()}
        loading="eager"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export function BrandLockup({
  titleClassName = "font-headline text-lg font-black tracking-[-0.04em] text-on-surface",
  subtitleClassName = "max-w-[180px] text-[11px] leading-4 text-on-surface-variant",
  markClassName = "",
  markSizeClassName = "h-10 w-10",
  showSubtitle = true,
  subtitle = "Retail cockpit for modern branches",
  light = false,
}: {
  titleClassName?: string;
  subtitleClassName?: string;
  markClassName?: string;
  markSizeClassName?: string;
  showSubtitle?: boolean;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <BrandLogoMark
        sizeClassName={markSizeClassName}
        className={markClassName}
        imageClassName={light ? "brightness-110" : ""}
      />
      <div className="min-w-0">
        <div className={titleClassName}>{APP_OWNER_PROFILE.appName}</div>
        {showSubtitle ? <div className={subtitleClassName}>{subtitle}</div> : null}
      </div>
    </div>
  );
}

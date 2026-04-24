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
      className={`flex items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#2C21A0] to-[#8B5CF6] shadow-[0_14px_28px_-20px_rgba(139,92,246,0.72)] ${sizeClassName} ${className}`.trim()}
      role="img"
      aria-label={`Logo ${APP_OWNER_PROFILE.appName}`}
    >
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className={`h-[58%] w-[58%] text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)] ${imageClassName}`.trim()}
      >
        <path
          fill="currentColor"
          d="M13 14.5A3.5 3.5 0 0 1 16.5 11h15A3.5 3.5 0 0 1 35 14.5V28a3 3 0 0 1-3 3h-4.5v3H31a1.75 1.75 0 1 1 0 3.5H17A1.75 1.75 0 1 1 17 34h3.5v-3H16a3 3 0 0 1-3-3V14.5Z"
        />
        <rect x="16.5" y="15" width="15" height="4" rx="2" fill="currentColor" opacity="0.34" />
        <rect x="16.5" y="21" width="5" height="3" rx="1.5" fill="currentColor" opacity="0.72" />
        <rect x="23.5" y="21" width="8" height="3" rx="1.5" fill="currentColor" opacity="0.72" />
        <rect x="22.5" y="31" width="3" height="3" rx="1.5" fill="currentColor" />
      </svg>
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

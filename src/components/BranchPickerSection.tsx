"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { Building2, MapPin, Phone, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranch } from "@/contexts/branch-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Branch } from "@/lib/branch";

type BranchPickerLabels = {
  title: string;
  description: string;
  viewing: string;
};

const labels: Record<string, BranchPickerLabels> = {
  vi: {
    title: "Chọn chi nhánh",
    description: "Chọn chi nhánh để xem phòng và đặt phòng",
    viewing: "Đang xem",
  },
  en: {
    title: "Select a branch",
    description: "Choose a branch to browse and book rooms",
    viewing: "Viewing",
  },
  zh: {
    title: "选择分店",
    description: "选择分店以查看和预订客房",
    viewing: "正在查看",
  },
};

type BranchPickerSectionProps = {
  className?: string;
  compact?: boolean;
};

function getLayout(branchCount: number) {
  if (branchCount <= 1) {
    return {
      className: "grid grid-cols-1 max-w-md mx-auto",
      cardWidth: "w-full",
    };
  }
  if (branchCount === 2) {
    return {
      className: "grid grid-cols-2 gap-2 sm:gap-3",
      cardWidth: "w-full",
    };
  }
  if (branchCount <= 4) {
    return {
      className: "grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3",
      cardWidth: "w-full",
    };
  }
  return {
    className:
      "flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-1 px-1 pb-0.5",
    cardWidth: "w-[min(70vw,220px)] sm:w-[200px] shrink-0 snap-center",
  };
}

type BranchOptionProps = {
  branch: Branch;
  showSelected: boolean;
  cardWidth: string;
  viewingLabel: string;
  onSelect: (id: string) => void;
};

const BranchOption = memo(function BranchOption({
  branch,
  showSelected,
  cardWidth,
  viewingLabel,
  onSelect,
}: BranchOptionProps) {
  return (
    <div
      className={cn(
        "relative min-w-0 transform-gpu transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none",
        cardWidth,
        showSelected ? "z-20 -translate-y-3 scale-100" : "z-0 translate-y-1.5 scale-[0.94] opacity-75"
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(branch.id)}
        aria-pressed={showSelected}
        aria-label={branch.name}
        className={cn(
          "group relative block w-full overflow-hidden text-left",
          "rounded-[1.25rem] sm:rounded-[1.4rem]",
          "aspect-[5/6] sm:aspect-[4/5] max-h-[300px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "active:scale-[0.98] motion-reduce:active:scale-100",
          "transition-[box-shadow,opacity] duration-200 ease-out",
          showSelected
            ? "opacity-100 shadow-lg shadow-primary/20 ring-[2.5px] ring-primary"
            : "opacity-90 hover:opacity-95"
        )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          {branch.image_url ? (
            <Image
              src={branch.image_url}
              alt={branch.name}
              fill
              loading="lazy"
              className={cn(
                "object-cover transition-[transform,filter] duration-200 ease-out motion-reduce:transition-none transform-gpu",
                showSelected
                  ? "scale-105"
                  : "scale-100 brightness-90 saturate-[0.85] group-hover:saturate-100"
              )}
              sizes="(max-width: 640px) 45vw, 280px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-primary/5">
              <Building2
                className={cn(
                  "h-10 w-10 transition-colors duration-200",
                  showSelected ? "text-primary" : "text-primary/35"
                )}
              />
            </div>
          )}

          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent",
              !showSelected && "from-black/70 via-black/15"
            )}
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-3 sm:p-4">
          {showSelected ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-primary-foreground shadow-md">
              <Check className="h-3 w-3" />
              {viewingLabel}
            </span>
          ) : (
            <span className="ml-auto h-6" aria-hidden />
          )}

          <div className="space-y-1 sm:space-y-1.5">
            <p
              className={cn(
                "font-display font-bold leading-tight line-clamp-2 drop-shadow-md",
                showSelected
                  ? "text-sm sm:text-base md:text-lg text-white"
                  : "text-xs sm:text-sm text-white/90"
              )}
            >
              {branch.name}
            </p>

            {branch.phone ? (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-white/85" />
                <span className="text-[10px] sm:text-xs text-white/90 font-medium">
                  {branch.phone}
                </span>
              </div>
            ) : null}

            {branch.address ? (
              <div className="hidden sm:flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-white/80" />
                <span className="text-[11px] text-white/80 line-clamp-1 leading-snug">
                  {branch.address}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </button>
    </div>
  );
});

export function BranchPickerSection({
  className,
  compact = false,
}: BranchPickerSectionProps) {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranch();
  const { language } = useLanguage();

  const t = labels[language] ?? labels.vi;
  const layout = useMemo(() => getLayout(branches.length), [branches.length]);

  if (branches.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "container px-3 sm:px-6 md:px-[15px] max-w-[1270px] mx-auto",
        compact ? "mt-6 mb-6" : "mt-12 md:mt-8 mb-8",
        className
      )}
    >
      <div className={cn("text-center", compact ? "mb-4" : "mb-5 md:mb-6")}>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium mb-1.5">
          Y Hotel
        </p>
        <h2
          className={cn(
            "font-display font-bold text-foreground",
            compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
          )}
        >
          {t.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-lg mx-auto">
          {t.description}
        </p>
      </div>

      <div className={cn("items-end pt-3 sm:pt-4", layout.className)}>
        {branches.map((branch) => (
          <BranchOption
            key={branch.id}
            branch={branch}
            showSelected={branch.id === selectedBranchId}
            cardWidth={layout.cardWidth}
            viewingLabel={t.viewing}
            onSelect={setSelectedBranchId}
          />
        ))}
      </div>
    </section>
  );
}

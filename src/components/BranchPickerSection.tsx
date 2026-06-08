"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Building2, MapPin, Phone, Check } from "lucide-react";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
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

const spring = { type: "spring" as const, stiffness: 380, damping: 32 };

type BranchPickerSectionProps = {
  className?: string;
  compact?: boolean;
};

function getLayout(branchCount: number) {
  if (branchCount <= 1) {
    return {
      mode: "grid" as const,
      className: "grid grid-cols-1 max-w-md mx-auto",
      cardWidth: "w-full",
    };
  }
  if (branchCount === 2) {
    return {
      mode: "grid" as const,
      className: "grid grid-cols-2 gap-2 sm:gap-3",
      cardWidth: "w-full",
    };
  }
  if (branchCount <= 4) {
    return {
      mode: "grid" as const,
      className: "grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3",
      cardWidth: "w-full",
    };
  }
  return {
    mode: "scroll" as const,
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

function BranchOption({
  branch,
  showSelected,
  cardWidth,
  viewingLabel,
  onSelect,
}: BranchOptionProps) {
  return (
    <motion.div
      layout
      className={cn("relative min-w-0", cardWidth, showSelected ? "z-20" : "z-0")}
      animate={{
        y: showSelected ? -12 : 6,
        scale: showSelected ? 1 : 0.94,
      }}
      transition={spring}
    >
      <motion.button
        type="button"
        layout
        onClick={() => onSelect(branch.id)}
        whileTap={{ scale: showSelected ? 0.98 : 0.92 }}
        aria-pressed={showSelected}
        aria-label={branch.name}
        className={cn(
          "group relative block w-full overflow-hidden text-left",
          "rounded-[1.25rem] sm:rounded-[1.4rem]",
          "aspect-[5/6] sm:aspect-[4/5] max-h-[300px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[1.25rem] sm:rounded-[1.4rem]">
          {branch.image_url ? (
            <Image
              src={branch.image_url}
              alt={branch.name}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                showSelected ? "scale-105" : "scale-100"
              )}
              sizes="(max-width: 640px) 45vw, 280px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-primary/5">
              <Building2
                className={cn(
                  "h-10 w-10 transition-colors",
                  showSelected ? "text-primary" : "text-primary/35"
                )}
              />
            </div>
          )}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-3 sm:p-4">
          <AnimatePresence>
            {showSelected ? (
              <motion.span
                initial={{ opacity: 0, y: -8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-primary-foreground shadow-md"
              >
                <Check className="h-3 w-3" />
                {viewingLabel}
              </motion.span>
            ) : (
              <span className="ml-auto h-6" aria-hidden />
            )}
          </AnimatePresence>

          <div className="space-y-1 sm:space-y-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_0_12px_rgba(0,0,0,0.45)]">
            <p
              className={cn(
                "font-display font-bold leading-tight line-clamp-2 text-white",
                showSelected ? "text-sm sm:text-base md:text-lg" : "text-xs sm:text-sm"
              )}
            >
              {branch.name}
            </p>

            {branch.phone ? (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-white" />
                <span className="text-[10px] sm:text-xs text-white font-medium">
                  {branch.phone}
                </span>
              </div>
            ) : null}

            {branch.address ? (
              <div className="hidden sm:flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-white" />
                <span className="text-[11px] text-white line-clamp-1 leading-snug">
                  {branch.address}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

export function BranchPickerSection({
  className,
  compact = false,
}: BranchPickerSectionProps) {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranch();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={cn("text-center", compact ? "mb-4" : "mb-5 md:mb-6")}
      >
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
      </motion.div>

      <LayoutGroup id="branch-picker">
        <div className={cn("items-end pt-3 sm:pt-4", layout.className)}>
          {branches.map((branch) => (
            <BranchOption
              key={branch.id}
              branch={branch}
              showSelected={mounted && branch.id === selectedBranchId}
              cardWidth={layout.cardWidth}
              viewingLabel={t.viewing}
              onSelect={setSelectedBranchId}
            />
          ))}
        </div>
      </LayoutGroup>
    </section>
  );
}

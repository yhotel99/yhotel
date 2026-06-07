"use client";

import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranch } from "@/contexts/branch-context";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function BranchSelector({ className }: { className?: string }) {
  const { branches, selectedBranchId, setSelectedBranchId } = useBranch();
  const { language } = useLanguage();

  if (branches.length <= 1) {
    return null;
  }

  const label =
    language === "vi"
      ? "Chi nhánh"
      : language === "zh"
        ? "分店"
        : "Branch";

  return (
    <div className={className}>
      <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
        <SelectTrigger className="h-8 w-[180px] border-background/20 bg-background/10 text-background text-sm">
          <Building2 className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-80" />
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

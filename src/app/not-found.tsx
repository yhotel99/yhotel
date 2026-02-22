"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t.notFound.title}</h1>
        <p className="text-xl text-foreground mb-2">{t.notFound.message}</p>
        <p className="text-muted-foreground mb-4">{t.notFound.description}</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t.notFound.backToHome}
        </Link>
      </div>
    </div>
  );
}


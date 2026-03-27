"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import type { Language } from "@/lib/i18n/translations";

export default function Providers({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 10 minutes (increased for better performance)
            staleTime: 1000 * 60 * 10,
            // Keep data in cache for 30 minutes (increased)
            gcTime: 1000 * 60 * 30,
            // Retry failed requests
            retry: 1,
            // Refetch on window focus (but use cached data if fresh)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect if data is fresh
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialLanguage={initialLanguage}>
        {children}
      </LanguageProvider>
    </QueryClientProvider>
  );
}


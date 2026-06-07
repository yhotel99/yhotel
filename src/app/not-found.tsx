import Link from "next/link";
import { cookies } from "next/headers";
import { translations, type Language } from "@/lib/i18n/translations";

function resolveLanguage(value: string | undefined): Language {
  if (value === "vi" || value === "en" || value === "zh") {
    return value;
  }
  return "vi";
}

export default async function NotFound() {
  const cookieStore = await cookies();
  const language = resolveLanguage(cookieStore.get("language")?.value);
  const t = translations[language].notFound;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
        <p className="text-xl text-foreground mb-2">{t.message}</p>
        <p className="text-muted-foreground mb-4">{t.description}</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t.backToHome}
        </Link>
      </div>
    </div>
  );
}

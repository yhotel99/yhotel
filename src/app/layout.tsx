import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "./providers";
import "@/index.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Y Hotel Cần Thơ - Khách Sạn 5 Sao Sang Trọng | Đặt Phòng Trực Tuyến",
  description: "Y Hotel Cần Thơ - Khách sạn 5 sao sang trọng với thiết bị hiện đại, không gian tinh tế và dịch vụ đẳng cấp quốc tế. Đặt phòng trực tuyến dễ dàng, giá tốt nhất. Trải nghiệm nghỉ dưỡng đẳng cấp tại trung tâm Cần Thơ.",
  keywords: "khách sạn Cần Thơ, khách sạn 5 sao Cần Thơ, khách sạn sang trọng, đặt phòng khách sạn, Y Hotel, nghỉ dưỡng cao cấp, phòng khách sạn cao cấp, khách sạn trung tâm Cần Thơ, hotel luxury Cần Thơ, booking khách sạn, khách sạn hiện đại, dịch vụ 5 sao, khách sạn miền Tây",
  authors: [{ name: "Y Hotel" }],
  openGraph: {
    title: "Y Hotel Cần Thơ - Khách Sạn 5 Sao Sang Trọng",
    description: "Khách sạn 5 sao tại Cần Thơ với thiết bị hiện đại, không gian sang trọng và dịch vụ đẳng cấp quốc tế. Đặt phòng ngay để trải nghiệm sự khác biệt.",
    type: "website",
    locale: "vi_VN",
    siteName: "Y Hotel",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Y Hotel Cần Thơ - Khách Sạn 5 Sao",
    description: "Khách sạn 5 sao tại Cần Thơ - Thiết bị hiện đại, dịch vụ đẳng cấp",
    site: "@lovable_dev",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://yhotel.lovable.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Y Hotel Cần Thơ",
    "description": "Khách sạn 5 sao sang trọng với thiết bị hiện đại, không gian tinh tế và dịch vụ đẳng cấp quốc tế. Tọa lạc tại vị trí trung tâm thành phố Cần Thơ, mang đến trải nghiệm nghỉ dưỡng hoàn hảo với tiêu chuẩn cao nhất.",
    "url": "https://yhotel.lovable.app",
    "telephone": "+84-292-123-4567",
    "email": "info@yhotel.com",
    "image": "https://yhotel.lovable.app/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "60-62-64 Lý Hồng Thanh",
      "addressLocality": "Cái Khế",
      "addressRegion": "Cần Thơ",
      "addressCountry": "VN",
      "postalCode": "900000"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": "5"
    },
    "priceRange": "$$$$",
    "checkinTime": "14:00",
    "checkoutTime": "12:00",
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "WiFi miễn phí tốc độ cao"
      },
      {
        "@type": "LocationFeatureSpecification", 
        "name": "Hồ bơi trong nhà"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Phòng gym hiện đại 24/7"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Nhà hàng cao cấp"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Bãi đỗ xe an toàn"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Dịch vụ phòng 24/7"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Phòng họp & Hội nghị"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "523",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Y Hotel có những loại phòng nào?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Y Hotel cung cấp đa dạng các loại phòng: Phòng Standard, Deluxe, Suite và Family Room. Tất cả các phòng đều được trang bị nội thất mới, hiện đại với đầy đủ tiện nghi 5 sao."
        }
      },
      {
        "@type": "Question",
        "name": "Thời gian check-in và check-out tại Y Hotel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Thời gian check-in từ 14:00 và check-out trước 12:00. Y Hotel có thể sắp xếp early check-in hoặc late check-out tùy theo tình trạng phòng."
        }
      },
      {
        "@type": "Question",
        "name": "Y Hotel có những tiện ích gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Y Hotel cung cấp đầy đủ tiện ích hiện đại: WiFi tốc độ cao miễn phí, hồ bơi trong nhà, phòng gym 24/7, nhà hàng cao cấp, bãi đỗ xe, spa, và dịch vụ phòng 24/7."
        }
      },
      {
        "@type": "Question",
        "name": "Y Hotel có gần sân bay không?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Y Hotel tọa lạc tại trung tâm thành phố Cần Thơ, cách sân bay quốc tế Cần Thơ khoảng 15-20 phút di chuyển. Khách sạn cung cấp dịch vụ đưa đón sân bay theo yêu cầu."
        }
      },
      {
        "@type": "Question",
        "name": "Làm thế nào để đặt phòng tại Y Hotel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bạn có thể đặt phòng trực tuyến qua website yhotel.lovable.app, gọi điện đến hotline +84 123 456 789, hoặc email đến booking@yhotel.com. Đặt phòng online để nhận giá tốt nhất."
        }
      }
    ]
  };

  return (
    <html lang="vi" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <head>
        <link rel="canonical" href="https://yhotel.lovable.app" />
        <meta name="geo.region" content="VN-CT" />
        <meta name="geo.placename" content="Can Tho City" />
        <meta name="geo.position" content="10.034149;105.722198" />
        <meta name="ICBM" content="10.034149, 105.722198" />
      </head>
      <body className="antialiased">
        <Script
          id="structured-data-hotel"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <Script
          id="structured-data-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData)
          }}
        />
        <Providers>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều Khoản & Điều Kiện Sử Dụng | Y Hotel Cần Thơ",
  description:
    "Điều khoản và điều kiện sử dụng dịch vụ đặt phòng, lưu trú và các dịch vụ đi kèm tại Y Hotel Cần Thơ.",
  openGraph: {
    title: "Điều Khoản & Điều Kiện | Y Hotel Cần Thơ",
    description:
      "Tìm hiểu điều khoản và điều kiện khi đặt phòng và sử dụng dịch vụ tại Y Hotel Cần Thơ.",
    type: "website",
    url: "https://yhotel.lovable.app/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Điều Khoản & Điều Kiện | Y Hotel Cần Thơ",
    description:
      "Nắm rõ điều khoản và điều kiện dịch vụ tại Y Hotel Cần Thơ.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


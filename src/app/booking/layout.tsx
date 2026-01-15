import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu & Quản Lý Đặt Phòng | Y Hotel Cần Thơ",
  description:
    "Tra cứu và xem chi tiết các đặt phòng tại Y Hotel Cần Thơ bằng email và số điện thoại đã sử dụng khi đặt.",
  openGraph: {
    title: "Tra Cứu Đặt Phòng | Y Hotel Cần Thơ",
    description:
      "Xem lại thông tin đặt phòng, lịch lưu trú và chi tiết đặt chỗ tại Y Hotel Cần Thơ.",
    type: "website",
    url: "https://yhotel.lovable.app/booking",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tra Cứu Đặt Phòng | Y Hotel Cần Thơ",
    description:
      "Tra cứu đặt phòng của bạn tại Y Hotel Cần Thơ một cách nhanh chóng.",
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


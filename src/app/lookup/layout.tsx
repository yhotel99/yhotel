import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Đặt Phòng Bằng Email & Số Điện Thoại | Y Hotel Cần Thơ",
  description:
    "Nhập email và số điện thoại để tra cứu nhanh trạng thái và chi tiết đặt phòng của bạn tại Y Hotel Cần Thơ.",
  openGraph: {
    title: "Tra Cứu Đặt Phòng | Y Hotel Cần Thơ",
    description:
      "Kiểm tra thông tin đặt phòng, thời gian lưu trú và trạng thái thanh toán tại Y Hotel Cần Thơ.",
    type: "website",
    url: "https://yhotel.lovable.app/lookup",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tra Cứu Đặt Phòng | Y Hotel Cần Thơ",
    description:
      "Tra cứu đặt phòng của bạn tại Y Hotel Cần Thơ bằng email và số điện thoại.",
  },
};

export default function LookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


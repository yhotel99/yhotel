import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt Phòng Trực Tuyến | Y Hotel Cần Thơ",
  description:
    "Đặt phòng khách sạn Y Hotel Cần Thơ trực tuyến nhanh chóng, bảo mật với nhiều lựa chọn phòng và chính sách hủy linh hoạt.",
  openGraph: {
    title: "Đặt Phòng Trực Tuyến | Y Hotel Cần Thơ",
    description:
      "Hoàn tất thông tin đặt phòng của bạn tại Y Hotel Cần Thơ chỉ trong vài bước đơn giản.",
    type: "website",
    url: "https://yhotel.lovable.app/book",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đặt Phòng Trực Tuyến | Y Hotel Cần Thơ",
    description:
      "Đặt phòng khách sạn Y Hotel Cần Thơ nhanh chóng, an toàn và tiện lợi.",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


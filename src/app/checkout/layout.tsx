import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanh Toán Đặt Phòng | Y Hotel Cần Thơ",
  description:
    "Kiểm tra thông tin đặt phòng và chọn phương thức thanh toán an toàn tại Y Hotel Cần Thơ.",
  openGraph: {
    title: "Thanh Toán Đặt Phòng | Y Hotel Cần Thơ",
    description:
      "Hoàn tất thanh toán đặt phòng của bạn tại Y Hotel Cần Thơ với hình thức chuyển khoản hoặc thanh toán tại khách sạn.",
    type: "website",
    url: "https://yhotel.lovable.app/checkout",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thanh Toán Đặt Phòng | Y Hotel Cần Thơ",
    description:
      "Bước cuối cùng để xác nhận đặt phòng tại Y Hotel Cần Thơ.",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật Thông Tin | Y Hotel Cần Thơ",
  description:
    "Chính sách bảo mật thông tin cá nhân và dữ liệu khách hàng khi sử dụng dịch vụ của Y Hotel Cần Thơ.",
  openGraph: {
    title: "Chính Sách Bảo Mật | Y Hotel Cần Thơ",
    description:
      "Tìm hiểu cách Y Hotel Cần Thơ thu thập, lưu trữ và bảo vệ thông tin cá nhân của khách hàng.",
    type: "website",
    url: "https://yhotel.lovable.app/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chính Sách Bảo Mật | Y Hotel Cần Thơ",
    description:
      "Chi tiết chính sách bảo mật và quyền riêng tư của khách hàng tại Y Hotel Cần Thơ.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


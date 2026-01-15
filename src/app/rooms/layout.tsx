import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phòng & Suites Y Hotel Cần Thơ | Đặt Phòng Khách Sạn Cao Cấp",
  description:
    "Khám phá các hạng phòng và suites sang trọng tại Y Hotel Cần Thơ với thiết kế hiện đại, tiện nghi 5 sao và vị trí trung tâm. Đặt phòng trực tuyến dễ dàng, giá tốt nhất.",
  openGraph: {
    title: "Phòng & Suites Y Hotel Cần Thơ",
    description:
      "Danh sách phòng và suites cao cấp tại Y Hotel Cần Thơ – lựa chọn đa dạng cho cặp đôi, gia đình và chuyến công tác.",
    type: "website",
    url: "https://yhotel.lovable.app/rooms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phòng & Suites Y Hotel Cần Thơ",
    description:
      "Đặt phòng khách sạn 5 sao tại Y Hotel Cần Thơ với các hạng phòng hiện đại, sang trọng.",
  },
};

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


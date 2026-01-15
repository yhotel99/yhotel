import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Y Hotel Cần Thơ | Tin Tức, Kinh Nghiệm & Ưu Đãi",
  description:
    "Cập nhật tin tức, kinh nghiệm du lịch, ưu đãi và câu chuyện thú vị từ Y Hotel Cần Thơ. Khám phá bí quyết nghỉ dưỡng trọn vẹn tại miền Tây.",
  openGraph: {
    title: "Blog Y Hotel Cần Thơ",
    description:
      "Tổng hợp bài viết về du lịch, trải nghiệm lưu trú và các chương trình khuyến mãi tại Y Hotel Cần Thơ.",
    type: "website",
    url: "https://yhotel.lovable.app/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Y Hotel Cần Thơ",
    description:
      "Khám phá tin tức, kinh nghiệm và ưu đãi mới nhất từ Y Hotel Cần Thơ.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


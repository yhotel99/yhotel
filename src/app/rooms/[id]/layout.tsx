import type { Metadata } from "next";

interface RoomResponse {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: string;
  guests: number;
  category: string;
}

type RoomLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://yhotel.lovable.app";

  try {
    const url = new URL(`/api/rooms/${encodeURIComponent(id)}`, baseUrl);

    const res = await fetch(url.toString(), {
      // Reuse API caching behaviour
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return {
        title: "Phòng Khách Sạn | Y Hotel Cần Thơ",
        description:
          "Đặt phòng khách sạn cao cấp tại Y Hotel Cần Thơ với không gian hiện đại và dịch vụ chuyên nghiệp.",
      };
    }

    const room = (await res.json()) as RoomResponse;

    const title = `${room.name} | Phòng Khách Sạn Y Hotel Cần Thơ`;
    const shortDescription =
      room.description &&
      room.description.replace(/\s+/g, " ").slice(0, 180).trim();

    const description =
      shortDescription && shortDescription.length > 0
        ? shortDescription
        : `Đặt phòng ${room.name} tại Y Hotel Cần Thơ với tiện nghi hiện đại, phù hợp cho ${room.guests} khách.`;

    const imageUrl = room.image?.startsWith("http")
      ? room.image
      : `${baseUrl}${room.image || "/logo.png"}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `${baseUrl}/rooms/${room.id}`,
        images: [imageUrl],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Phòng Khách Sạn | Y Hotel Cần Thơ",
      description:
        "Đặt phòng khách sạn cao cấp tại Y Hotel Cần Thơ với không gian hiện đại và dịch vụ chuyên nghiệp.",
    };
  }
}

export default function RoomDetailLayout({ children }: RoomLayoutProps) {
  return children;
}


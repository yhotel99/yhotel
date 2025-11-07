import { Wifi, Car, Coffee, Bath } from "lucide-react";
import luxuryRoomImage from "@/assets/luxury-room.jpg";
import { galleryImages } from "@/assets/images";

export interface Room {
  id: number;
  name: string;
  image: string;
  galleryImages?: string[]; // Thêm mảng hình ảnh cho gallery
  price: string;
  originalPrice: string;
  size: string;
  guests: number;
  features: string[];
  amenities: typeof Wifi[];
  popular: boolean;
  category: "standard" | "deluxe" | "suite" | "family";
}

export const rooms: Room[] = [
  {
    id: 1,
    name: "Phòng Standard",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[1],
      galleryImages[2],
      galleryImages[3]
    ],
    price: "1,500,000",
    originalPrice: "1,800,000",
    size: "25m²",
    guests: 2,
    features: ["1 giường đôi", "Phù hợp cho cặp đôi", "Tầm nhìn đẹp", "Minibar"],
    amenities: [Wifi, Coffee, Bath],
    popular: false,
    category: "standard"
  },
  {
    id: 2,
    name: "Phòng Family",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[1],
      galleryImages[2],
      galleryImages[3],
      galleryImages[4]
    ],
    price: "2,800,000",
    originalPrice: "3,200,000",
    size: "50m²",
    guests: 4,
    features: ["2 giường đôi", "Phù hợp cho gia đình", "Khu vực sinh hoạt rộng", "Minibar"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "family"
  },
  {
    id: 3,
    name: "Phòng Deluxe",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[2],
      galleryImages[3],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "2,200,000",
    originalPrice: "2,600,000",
    size: "35m²",
    guests: 2,
    features: ["1 giường đôi lớn", "Ban công riêng", "Tầm nhìn thành phố", "Minibar đầy đủ"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: false,
    category: "deluxe"
  },
  {
    id: 8,
    name: "Family Deluxe",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    price: "3,800,000",
    originalPrice: "4,500,000",
    size: "60m²",
    guests: 5,
    features: ["2 phòng ngủ", "Phòng khách", "Bếp mini", "Phù hợp gia đình"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: false,
    category: "family"
  },
  {
    id: 13,
    name: "Family Suite",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    price: "4,800,000",
    originalPrice: "5,500,000",
    size: "75m²",
    guests: 6,
    features: ["2 phòng ngủ", "Phòng khách lớn", "Bếp đầy đủ", "Phù hợp gia đình lớn"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: false,
    category: "family"
  },
  {
    id: 4,
    name: "Phòng Superior",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[1],
      galleryImages[2],
      galleryImages[3]
    ],
    price: "1,800,000",
    originalPrice: "2,100,000",
    size: "30m²",
    guests: 2,
    features: ["1 giường đôi", "Tầm nhìn đẹp", "Nội thất hiện đại", "Minibar"],
    amenities: [Wifi, Coffee, Bath],
    popular: false,
    category: "standard"
  },
  {
    id: 5,
    name: "Deluxe Ocean View",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[1],
      galleryImages[2],
      galleryImages[3],
      galleryImages[4]
    ],
    price: "2,500,000",
    originalPrice: "3,000,000",
    size: "40m²",
    guests: 2,
    features: ["1 giường đôi lớn", "Tầm nhìn biển", "Ban công riêng", "Minibar cao cấp"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "deluxe"
  },
  {
    id: 6,
    name: "Executive Suite",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[2],
      galleryImages[3],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "3,500,000",
    originalPrice: "4,200,000",
    size: "55m²",
    guests: 3,
    features: ["Phòng ngủ riêng", "Phòng khách", "Bàn làm việc", "Minibar đầy đủ"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: false,
    category: "suite"
  },
  {
    id: 7,
    name: "Presidential Suite",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[2],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "6,500,000",
    originalPrice: "7,500,000",
    size: "100m²",
    guests: 4,
    features: ["2 phòng ngủ", "Phòng khách sang trọng", "Bếp đầy đủ", "Phòng tắm jacuzzi"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "suite"
  },
  {
    id: 9,
    name: "Standard Twin",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[1],
      galleryImages[3],
      galleryImages[4]
    ],
    price: "1,600,000",
    originalPrice: "1,900,000",
    size: "28m²",
    guests: 2,
    features: ["2 giường đơn", "Phù hợp bạn bè", "Tầm nhìn đẹp", "Minibar"],
    amenities: [Wifi, Coffee, Bath],
    popular: false,
    category: "standard"
  },
  {
    id: 10,
    name: "Deluxe City View",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[2],
      galleryImages[3],
      galleryImages[4]
    ],
    price: "2,400,000",
    originalPrice: "2,800,000",
    size: "38m²",
    guests: 2,
    features: ["1 giường đôi lớn", "Tầm nhìn thành phố", "Ban công riêng", "Minibar cao cấp"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "deluxe"
  },
  {
    id: 11,
    name: "Junior Suite",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[1],
      galleryImages[2],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "3,200,000",
    originalPrice: "3,800,000",
    size: "50m²",
    guests: 3,
    features: ["Phòng ngủ riêng", "Phòng khách", "Bàn làm việc", "Minibar đầy đủ"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: false,
    category: "suite"
  },
  {
    id: 12,
    name: "Standard Plus",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[1],
      galleryImages[2]
    ],
    price: "1,700,000",
    originalPrice: "2,000,000",
    size: "32m²",
    guests: 2,
    features: ["1 giường đôi", "Nội thất hiện đại", "Tầm nhìn đẹp", "Minibar"],
    amenities: [Wifi, Coffee, Bath],
    popular: false,
    category: "standard"
  },
  {
    id: 14,
    name: "Royal Suite",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[2],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "5,500,000",
    originalPrice: "6,500,000",
    size: "85m²",
    guests: 4,
    features: ["2 phòng ngủ", "Phòng khách sang trọng", "Bếp đầy đủ", "Phòng tắm jacuzzi"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "suite"
  },
  {
    id: 15,
    name: "Family Premium",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[1],
      galleryImages[3],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "4,200,000",
    originalPrice: "4,800,000",
    size: "70m²",
    guests: 5,
    features: ["2 phòng ngủ", "Phòng khách rộng", "Bếp mini", "Phù hợp gia đình lớn"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: false,
    category: "family"
  },
  {
    id: 16,
    name: "Standard Comfort",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[1],
      galleryImages[2],
      galleryImages[3]
    ],
    price: "1,400,000",
    originalPrice: "1,700,000",
    size: "24m²",
    guests: 2,
    features: ["1 giường đôi", "Nội thất tiện nghi", "Tầm nhìn đẹp", "Minibar"],
    amenities: [Wifi, Coffee, Bath],
    popular: false,
    category: "standard"
  },
  {
    id: 17,
    name: "Deluxe Garden View",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[1],
      galleryImages[2],
      galleryImages[3],
      galleryImages[4]
    ],
    price: "2,600,000",
    originalPrice: "3,100,000",
    size: "42m²",
    guests: 2,
    features: ["1 giường đôi lớn", "Tầm nhìn vườn", "Ban công riêng", "Minibar cao cấp"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "deluxe"
  },
  {
    id: 18,
    name: "Grand Suite",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[2],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "4,000,000",
    originalPrice: "4,800,000",
    size: "65m²",
    guests: 3,
    features: ["Phòng ngủ riêng", "Phòng khách rộng", "Bàn làm việc", "Minibar đầy đủ"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: false,
    category: "suite"
  },
  {
    id: 19,
    name: "Family Grand",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[1],
      galleryImages[2],
      galleryImages[4],
      galleryImages[5]
    ],
    price: "4,500,000",
    originalPrice: "5,200,000",
    size: "80m²",
    guests: 6,
    features: ["3 phòng ngủ", "Phòng khách lớn", "Bếp đầy đủ", "Phù hợp gia đình lớn"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "family"
  },
  {
    id: 20,
    name: "Deluxe Panoramic",
    image: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
    galleryImages: [
      typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src,
      galleryImages[0],
      galleryImages[1],
      galleryImages[3],
      galleryImages[4]
    ],
    price: "2,800,000",
    originalPrice: "3,300,000",
    size: "45m²",
    guests: 2,
    features: ["1 giường đôi lớn", "Tầm nhìn toàn cảnh", "Ban công rộng", "Minibar cao cấp"],
    amenities: [Wifi, Coffee, Bath, Car],
    popular: true,
    category: "deluxe"
  }
];


export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  featured: boolean;
  content: string; // Nội dung đầy đủ của bài viết
  tags?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "10 Trải Nghiệm Không Thể Bỏ Lỡ Tại Y Hotel",
    excerpt: "Khám phá những trải nghiệm độc đáo và đáng nhớ nhất mà Y Hotel mang đến cho du khách từ khắp nơi trên thế giới.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    author: "Admin Y Hotel",
    date: "15 Dec 2024",
    category: "Kinh nghiệm",
    readTime: "5 phút đọc",
    featured: true,
    tags: ["Trải nghiệm", "Khách sạn", "Du lịch"],
    content: `
# 10 Trải Nghiệm Không Thể Bỏ Lỡ Tại Y Hotel

Y Hotel tự hào mang đến cho du khách những trải nghiệm đẳng cấp và đáng nhớ nhất. Từ dịch vụ phòng sang trọng đến các tiện ích cao cấp, chúng tôi cam kết tạo ra những khoảnh khắc khó quên cho mỗi vị khách.

## 1. Spa & Wellness Center

Trải nghiệm thư giãn tuyệt đối tại spa và wellness center của chúng tôi. Với các liệu pháp massage chuyên nghiệp, bể bơi vô cực và phòng xông hơi, bạn sẽ được tái tạo năng lượng và thư giãn hoàn toàn.

## 2. Ẩm Thực Đỉnh Cao

Khám phá các nhà hàng sang trọng với menu đa dạng từ ẩm thực quốc tế đến món ăn địa phương. Đầu bếp của chúng tôi sử dụng nguyên liệu tươi ngon nhất để tạo ra những món ăn tuyệt vời.

## 3. Phòng Suites Sang Trọng

Mỗi phòng tại Y Hotel được thiết kế với sự chú ý đến từng chi tiết. Từ view tuyệt đẹp đến nội thất cao cấp, mỗi phòng đều mang lại cảm giác thoải mái và sang trọng.

## 4. Dịch Vụ Butler 24/7

Đội ngũ butler chuyên nghiệp của chúng tôi sẵn sàng phục vụ bạn 24/7. Từ việc chuẩn bị phòng đến các yêu cầu đặc biệt, chúng tôi luôn ở đây để đảm bảo bạn có trải nghiệm tốt nhất.

## 5. Rooftop Bar & Lounge

Thưởng thức cocktail và đồ uống cao cấp tại rooftop bar với view toàn cảnh thành phố. Không gian sang trọng và không khí lãng mạn sẽ khiến buổi tối của bạn trở nên đặc biệt.

## 6. Fitness Center Hiện Đại

Giữ gìn sức khỏe tại phòng gym hiện đại với đầy đủ thiết bị tập luyện. Từ máy chạy bộ đến các thiết bị tập tạ, bạn sẽ có mọi thứ cần thiết cho buổi tập của mình.

## 7. Business Center

Cho các khách hàng công vụ, chúng tôi có business center với đầy đủ tiện ích như phòng họp, WiFi tốc độ cao và dịch vụ in ấn.

## 8. Kids Club

Gia đình có trẻ em sẽ rất thích kids club của chúng tôi. Với nhiều hoạt động vui chơi và giám sát chuyên nghiệp, trẻ em sẽ có khoảng thời gian vui vẻ trong khi bạn thư giãn.

## 9. Concierge Service

Đội ngũ concierge chuyên nghiệp sẽ giúp bạn lên kế hoạch cho chuyến đi của mình. Từ đặt vé máy bay đến tour tham quan, chúng tôi sẽ đảm bảo mọi thứ được sắp xếp hoàn hảo.

## 10. Sự Kiện & Tiệc

Y Hotel là địa điểm lý tưởng cho các sự kiện và tiệc. Với không gian rộng rãi và dịch vụ chuyên nghiệp, chúng tôi sẽ giúp bạn tổ chức sự kiện thành công.

## Kết Luận

Y Hotel không chỉ là nơi nghỉ ngơi mà còn là điểm đến cho những trải nghiệm đáng nhớ. Chúng tôi cam kết mang đến dịch vụ tốt nhất và tạo ra những khoảnh khắc khó quên cho mỗi vị khách.
    `
  },
  {
    id: 2,
    title: "Bí Quyết Tận Hưởng Kỳ Nghỉ Luxury Hoàn Hảo",
    excerpt: "Hướng dẫn chi tiết về cách tận hưởng trọn vẹn kỳ nghỉ sang trọng tại Y Hotel với những dịch vụ cao cấp.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
    author: "Travel Expert",
    date: "12 Dec 2024",
    category: "Du lịch",
    readTime: "7 phút đọc",
    featured: false,
    tags: ["Luxury", "Du lịch", "Mẹo vặt"],
    content: `
# Bí Quyết Tận Hưởng Kỳ Nghỉ Luxury Hoàn Hảo

Kỳ nghỉ luxury không chỉ là về việc ở một khách sạn đắt tiền, mà còn là về cách bạn tận hưởng từng khoảnh khắc và tận dụng mọi dịch vụ có sẵn.

## Lên Kế Hoạch Trước

Việc lên kế hoạch trước sẽ giúp bạn tận hưởng kỳ nghỉ một cách tối đa. Hãy liên hệ với đội ngũ concierge của chúng tôi để được tư vấn về các hoạt động và dịch vụ phù hợp.

## Tận Dụng Dịch Vụ Butler

Dịch vụ butler của Y Hotel sẵn sàng phục vụ bạn 24/7. Từ việc chuẩn bị phòng đến các yêu cầu đặc biệt, hãy đừng ngại sử dụng dịch vụ này.

## Khám Phá Ẩm Thực

Y Hotel tự hào với nhiều nhà hàng sang trọng. Hãy dành thời gian để khám phá menu đa dạng và thưởng thức các món ăn tuyệt vời.

## Thư Giãn Tại Spa

Spa & Wellness Center của chúng tôi cung cấp nhiều liệu pháp thư giãn. Hãy đặt lịch trước để đảm bảo có chỗ trong dịp cao điểm.

## Tận Hưởng View

Mỗi phòng tại Y Hotel đều có view tuyệt đẹp. Hãy dành thời gian để ngắm cảnh và tận hưởng không gian riêng tư của bạn.

## Tham Gia Các Hoạt Động

Y Hotel thường xuyên tổ chức các hoạt động và sự kiện đặc biệt. Hãy kiểm tra lịch trình để không bỏ lỡ những trải nghiệm thú vị.

## Lưu Ý Cuối Cùng

Hãy nhớ rằng kỳ nghỉ luxury là về sự thư giãn và tận hưởng. Đừng quá lo lắng về việc phải làm mọi thứ, hãy để mình thư giãn và tận hưởng từng khoảnh khắc.
    `
  },
  {
    id: 3,
    title: "Ẩm Thực Đỉnh Cao: Hành Trình Khám Phá Các Nhà Hàng",
    excerpt: "Khám phá những món ăn tinh tế và độc đáo tại các nhà hàng sang trọng của Y Hotel.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
    author: "Chef Y Hotel",
    date: "10 Dec 2024",
    category: "Ẩm thực",
    readTime: "6 phút đọc",
    featured: false,
    tags: ["Ẩm thực", "Nhà hàng", "Gourmet"],
    content: `
# Ẩm Thực Đỉnh Cao: Hành Trình Khám Phá Các Nhà Hàng

Y Hotel tự hào mang đến trải nghiệm ẩm thực đẳng cấp với các nhà hàng sang trọng và menu đa dạng.

## Nhà Hàng Chính - The Grand Dining

Nhà hàng chính của chúng tôi phục vụ ẩm thực quốc tế với menu thay đổi theo mùa. Đầu bếp của chúng tôi sử dụng nguyên liệu tươi ngon nhất để tạo ra những món ăn tuyệt vời.

### Signature Dishes

- **Wagyu Beef Steak**: Thịt bò Wagyu cao cấp được nướng hoàn hảo
- **Lobster Thermidor**: Tôm hùm tươi sống với sốt đặc biệt
- **Truffle Pasta**: Mì Ý với nấm truffle đen

## Nhà Hàng Á Châu - The Oriental

Khám phá hương vị Á Châu tại nhà hàng The Oriental. Từ các món ăn Việt Nam truyền thống đến ẩm thực Nhật Bản, Trung Quốc và Thái Lan.

### Highlights

- Sushi & Sashimi tươi sống
- Dim Sum đa dạng
- Các món nướng BBQ

## Rooftop Bar & Lounge

Thưởng thức cocktail và đồ uống cao cấp tại rooftop bar với view toàn cảnh thành phố. Menu tapas và finger food cũng rất đáng thử.

## Dịch Vụ Room Service 24/7

Bạn có thể thưởng thức các món ăn tuyệt vời ngay trong phòng của mình với dịch vụ room service 24/7.

## Trải Nghiệm Wine Pairing

Đội ngũ sommelier của chúng tôi sẽ giúp bạn chọn rượu vang phù hợp với món ăn. Tham gia buổi wine pairing để có trải nghiệm ẩm thực hoàn hảo.

## Kết Luận

Ẩm thực tại Y Hotel không chỉ là về việc ăn uống, mà còn là về trải nghiệm và khám phá. Hãy để chúng tôi mang đến cho bạn những bữa ăn đáng nhớ nhất.
    `
  },
  {
    id: 4,
    title: "Spa & Wellness: Hành Trình Tái Tạo Năng Lượng",
    excerpt: "Trải nghiệm các liệu pháp spa và wellness độc đáo giúp bạn thư giãn và tái tạo năng lượng.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600",
    author: "Wellness Expert",
    date: "8 Dec 2024",
    category: "Wellness",
    readTime: "4 phút đọc",
    featured: false,
    tags: ["Spa", "Wellness", "Thư giãn"],
    content: `
# Spa & Wellness: Hành Trình Tái Tạo Năng Lượng

Spa & Wellness Center của Y Hotel là thiên đường cho những ai muốn thư giãn và tái tạo năng lượng.

## Các Liệu Pháp Massage

### Swedish Massage

Massage Thụy Điển cổ điển giúp thư giãn cơ bắp và cải thiện tuần hoàn máu. Liệu pháp này hoàn hảo cho những ai muốn giảm stress.

### Deep Tissue Massage

Massage mô sâu dành cho những cơ bắp căng cứng và đau nhức. Kỹ thuật này giúp giải phóng căng thẳng sâu trong cơ.

### Aromatherapy Massage

Massage với tinh dầu thơm không chỉ thư giãn cơ thể mà còn làm dịu tâm trí. Mỗi loại tinh dầu có công dụng riêng.

## Bể Bơi Vô Cực

Tận hưởng bể bơi vô cực với view tuyệt đẹp. Không gian yên tĩnh và thư giãn sẽ giúp bạn quên đi mọi lo lắng.

## Phòng Xông Hơi & Jacuzzi

Phòng xông hơi giúp thải độc và thư giãn, trong khi Jacuzzi là nơi hoàn hảo để ngâm mình và thư giãn.

## Facial Treatments

Các liệu pháp chăm sóc da mặt chuyên nghiệp giúp bạn có làn da tươi trẻ và rạng rỡ. Sử dụng các sản phẩm cao cấp từ các thương hiệu hàng đầu.

## Yoga & Meditation Classes

Tham gia các lớp yoga và thiền định để tìm sự cân bằng cho tâm trí và cơ thể. Các lớp học được tổ chức hàng ngày.

## Wellness Packages

Chúng tôi cung cấp các gói wellness toàn diện bao gồm massage, facial, và các liệu pháp khác. Đặt trước để có giá tốt nhất.

## Kết Luận

Spa & Wellness Center của Y Hotel là nơi hoàn hảo để bạn tái tạo năng lượng và thư giãn. Hãy dành thời gian chăm sóc bản thân trong kỳ nghỉ của bạn.
    `
  },
  {
    id: 5,
    title: "Sự Kiện Đặc Biệt: Gala Dinner Mùa Đông 2024",
    excerpt: "Tham gia sự kiện Gala Dinner đặc biệt với menu cao cấp và chương trình giải trí hấp dẫn.",
    image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600",
    author: "Event Manager",
    date: "5 Dec 2024",
    category: "Sự kiện",
    readTime: "3 phút đọc",
    featured: false,
    tags: ["Sự kiện", "Gala", "Ẩm thực"],
    content: `
# Sự Kiện Đặc Biệt: Gala Dinner Mùa Đông 2024

Y Hotel tự hào giới thiệu sự kiện Gala Dinner Mùa Đông 2024 - một đêm đặc biệt với ẩm thực cao cấp và giải trí tuyệt vời.

## Thời Gian & Địa Điểm

- **Ngày**: 28 tháng 12, 2024
- **Giờ**: 19:00 - 23:00
- **Địa điểm**: Grand Ballroom, Y Hotel

## Menu Đặc Biệt

### Amuse-Bouche
- Caviar trên bánh mì nướng
- Oyster với sốt mignonette
- Foie gras với bánh mì

### Món Khai Vị
- Salad Caesar cổ điển với gà nướng
- Soup hải sản với saffron

### Món Chính
- Bò Wagyu nướng với rau củ theo mùa
- Cá hồi nướng với sốt beurre blanc
- Món chay: Risotto nấm truffle

### Tráng Miệng
- Chocolate lava cake
- Tiramisu cổ điển
- Phô mai theo mùa

## Chương Trình Giải Trí

- Triển lãm nghệ thuật sống
- Nhạc sống từ dàn nhạc jazz
- Trình diễn ánh sáng đặc biệt

## Wine Pairing

Mỗi món ăn được kết hợp hoàn hảo với rượu vang cao cấp được chọn bởi sommelier của chúng tôi.

## Giá Vé

- **VIP**: 2,500,000 VNĐ/người
- **Standard**: 1,800,000 VNĐ/người

## Đặt Vé

Để đặt vé, vui lòng liên hệ:
- Email: events@yhotel.com
- Hotline: +84 123 456 789

## Lưu Ý

- Trang phục: Black tie
- Đặt vé trước ngày 20/12 để được giảm giá 10%

Đừng bỏ lỡ sự kiện đặc biệt này!
    `
  },
  {
    id: 6,
    title: "Khám Phá Văn Hóa Địa Phương Xung Quanh Khách Sạn",
    excerpt: "Tìm hiểu những điểm đến văn hóa thú vị và các trải nghiệm địa phương gần Y Hotel.",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
    author: "Local Guide",
    date: "3 Dec 2024",
    category: "Khám phá",
    readTime: "8 phút đọc",
    featured: false,
    tags: ["Văn hóa", "Địa phương", "Du lịch"],
    content: `
# Khám Phá Văn Hóa Địa Phương Xung Quanh Khách Sạn

Y Hotel nằm ở vị trí lý tưởng, gần nhiều điểm đến văn hóa và thú vị. Hãy để chúng tôi giúp bạn khám phá vùng đất này.

## Bảo Tàng Lịch Sử

Chỉ cách Y Hotel 10 phút đi bộ, Bảo tàng Lịch Sử là nơi tuyệt vời để tìm hiểu về lịch sử và văn hóa địa phương. Trưng bày các hiện vật cổ và triển lãm tương tác.

## Chợ Đêm

Chợ đêm địa phương là nơi hoàn hảo để khám phá ẩm thực đường phố và mua quà lưu niệm. Chợ mở cửa từ 18:00 đến 23:00 mỗi ngày.

## Nhà Hát Truyền Thống

Xem các buổi biểu diễn nghệ thuật truyền thống tại nhà hát gần khách sạn. Trải nghiệm văn hóa địa phương qua âm nhạc và múa.

## Phố Cổ

Đi bộ qua phố cổ để khám phá kiến trúc cổ xưa và các cửa hàng thủ công. Nhiều cửa hàng bán đồ lưu niệm và quà tặng độc đáo.

## Chùa & Đền

Tham quan các ngôi chùa và đền cổ kính trong khu vực. Những kiến trúc tôn giáo này mang lại sự bình yên và hiểu biết về văn hóa tâm linh địa phương.

## Công Viên & Không Gian Xanh

Công viên gần khách sạn là nơi lý tưởng để đi dạo, chạy bộ hoặc dã ngoại. Không gian xanh tươi mát giữa thành phố.

## Tour Có Hướng Dẫn

Đội ngũ concierge của chúng tôi có thể sắp xếp các tour có hướng dẫn viên địa phương. Tìm hiểu về lịch sử, văn hóa và ẩm thực từ người dân địa phương.

## Ẩm Thực Địa Phương

Khám phá các nhà hàng địa phương gần khách sạn. Từ quán ăn đường phố đến nhà hàng cao cấp, có nhiều lựa chọn để thử.

## Lễ Hội & Sự Kiện

Kiểm tra lịch trình các lễ hội và sự kiện địa phương. Tham gia các lễ hội văn hóa để có trải nghiệm đáng nhớ.

## Kết Luận

Vùng đất xung quanh Y Hotel có rất nhiều điều thú vị để khám phá. Hãy để chúng tôi giúp bạn khám phá văn hóa địa phương và tạo ra những kỷ niệm đáng nhớ.
    `
  }
];

export const getBlogPostById = (id: number): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

export const getRelatedPosts = (currentPostId: number, limit: number = 3): BlogPost[] => {
  const currentPost = getBlogPostById(currentPostId);
  if (!currentPost) return [];

  return blogPosts
    .filter(post => post.id !== currentPostId && post.category === currentPost.category)
    .slice(0, limit);
};




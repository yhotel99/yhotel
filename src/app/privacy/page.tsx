"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useScrollThreshold } from "@/hooks/use-scroll";

export default function PrivacyPage() {
  const isScrolled = useScrollThreshold(100);

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Sticky Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: isScrolled ? 1 : 0,
            y: isScrolled ? 0 : -20,
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className={`fixed top-20 left-4 z-40 ${isScrolled ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          <Link href="/">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 backdrop-blur-sm bg-background/90 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Về trang chủ</span>
            </Button>
          </Link>
        </motion.div>

        {/* Header Section */}
        <section className="py-12 md:py-[25px] bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground">
                  Chính Sách Bảo Mật
                </h1>
              </div>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                Ban hành lần 1 (năm 2025) - Áp dụng cho toàn bộ hệ thống và các dịch vụ lưu trú – dịch vụ đi kèm
              </p>
            </motion.div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-10">
              <Link href="/">
                <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Về trang chủ</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-[20px] bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-background rounded-xl border shadow-lg p-6 md:p-8 lg:p-10 space-y-8">
                {/* Section I */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    I. CAM KẾT BẢO MẬT THÔNG TIN KHÁCH HÀNG
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                    Y Hotel cam kết tôn trọng và bảo vệ tuyệt đối quyền riêng tư cũng như thông tin cá nhân của khách hàng theo đúng quy định pháp luật hiện hành và chuẩn mực dịch vụ lưu trú chuyên nghiệp. Mọi thông tin được thu thập đều được quản lý, sử dụng minh bạch và có trách nhiệm.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Phạm vi thông tin được bảo mật:</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">Thông tin cá nhân cơ bản:</strong> Họ tên, năm sinh, số CMND/CCCD/Hộ chiếu, quốc tịch, địa chỉ, số điện thoại, email.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">Thông tin lưu trú:</strong> Thời gian lưu trú, loại phòng, lịch sử đặt phòng, yêu cầu dịch vụ, ghi chú chăm sóc khách hàng.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">Thông tin tài chính:</strong> Thông tin thanh toán, hóa đơn, phương thức thanh toán, thông tin xuất hóa đơn theo yêu cầu.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">Hình ảnh cá nhân:</strong> Hình ảnh được ghi nhận trong quá trình lưu trú (khu vực công cộng) hoặc hình ảnh do khách hàng cung cấp cho mục đích đăng ký dịch vụ, truyền thông khi có sự đồng ý.</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Nguyên tắc thu thập, sử dụng và bảo vệ thông tin:</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Không tiết lộ, chia sẻ thông tin khách hàng cho bên thứ ba khi chưa có sự đồng ý của khách hàng, trừ các trường hợp theo yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định pháp luật.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Thông tin khách hàng chỉ được sử dụng trong nội bộ Y Hotel nhằm mục đích: cung cấp dịch vụ lưu trú, chăm sóc khách hàng, quản lý chất lượng dịch vụ, đảm bảo an ninh – an toàn, và thực hiện nghĩa vụ pháp lý liên quan.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Nhân viên Y Hotel (bao gồm bộ phận lễ tân, buồng phòng, dịch vụ khách hàng, kế toán và các bộ phận liên quan) có trách nhiệm tuyệt đối giữ bí mật thông tin khách hàng trong suốt quá trình làm việc và sau khi chấm dứt hợp tác lao động.</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Quyền truy cập và điều chỉnh thông tin cá nhân:</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Khách hàng có quyền yêu cầu kiểm tra, cập nhật hoặc điều chỉnh thông tin cá nhân nếu phát hiện sai sót.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Yêu cầu được thực hiện thông qua quầy Lễ tân, bộ phận Chăm sóc khách hàng hoặc kênh liên hệ chính thức của Y Hotel trong thời gian khách hàng sử dụng dịch vụ hoặc sau khi kết thúc lưu trú.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section II */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    II. QUYỀN CỦA KHÁCH HÀNG LƯU TRÚ
                  </h2>
                  <ul className="space-y-3 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Được cung cấp dịch vụ lưu trú đúng tiêu chuẩn công bố, đảm bảo an toàn, riêng tư và tôn trọng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Được thông tin rõ ràng, minh bạch về giá phòng, các loại phí, chính sách đặt phòng – hủy phòng và các dịch vụ đi kèm.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Được bảo mật thông tin cá nhân và thông tin lưu trú trong suốt quá trình sử dụng dịch vụ tại Y Hotel.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Được quyền lựa chọn sử dụng hoặc từ chối các dịch vụ bổ sung theo nhu cầu cá nhân.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Được góp ý, phản ánh hoặc khiếu nại liên quan đến chất lượng dịch vụ, thái độ phục vụ của nhân viên và các vấn đề phát sinh trong thời gian lưu trú.</span>
                    </li>
                  </ul>
                </div>

                {/* Section III */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    III. TRÁCH NHIỆM VÀ HỢP TÁC CỦA KHÁCH HÀNG
                  </h2>
                  <ul className="space-y-3 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Cung cấp thông tin cá nhân chính xác, đầy đủ khi làm thủ tục nhận phòng theo quy định pháp luật về lưu trú.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Tuân thủ nội quy khách sạn, quy định về an ninh – an toàn, phòng cháy chữa cháy và các quy định chung trong khuôn viên Y Hotel.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Thanh toán đầy đủ các chi phí dịch vụ phát sinh trong thời gian lưu trú theo thỏa thuận.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Tôn trọng nhân viên khách sạn, các khách lưu trú khác và tài sản của Y Hotel.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Không quay phim, chụp ảnh, ghi âm hoặc phát trực tiếp tại các khu vực riêng tư, khu vực hạn chế của khách sạn khi chưa có sự cho phép bằng văn bản của Y Hotel.</span>
                    </li>
                  </ul>
                </div>

                {/* Section IV */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    IV. CƠ CHẾ TIẾP NHẬN PHẢN HỒI VÀ GIẢI QUYẾT KHIẾU NẠI
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-3">
                    Y Hotel triển khai các kênh tiếp nhận phản hồi chính thức bao gồm: quầy Lễ tân, hotline chăm sóc khách hàng, email và các nền tảng liên hệ được công bố chính thức.
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Mọi phản hồi, khiếu nại của khách hàng sẽ được ghi nhận và xử lý trong thời gian từ 24–72 giờ làm việc, tùy theo mức độ và tính chất vụ việc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Trường hợp phát sinh vấn đề cần trao đổi trực tiếp, Y Hotel sẽ chủ động liên hệ và phối hợp cùng khách hàng trên tinh thần thiện chí, minh bạch và tôn trọng.</span>
                    </li>
                  </ul>
                </div>

                {/* Section V */}
                <div className="pt-6 border-t">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    V. THÔNG TIN, ĐỒNG THUẬN VÀ CẬP NHẬT CHÍNH SÁCH
                  </h2>
                  <ul className="space-y-3 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Chính sách bảo mật này được công khai tại quầy Lễ tân, trên các kênh thông tin chính thức của Y Hotel và/hoặc thông báo trực tiếp khi khách hàng làm thủ tục nhận phòng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Việc khách hàng sử dụng dịch vụ tại Y Hotel được xem là đã đọc, hiểu và đồng thuận với các nội dung trong chính sách này.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Y Hotel cam kết rà soát, cập nhật chính sách bảo mật định kỳ nhằm phù hợp với quy định pháp luật và nâng cao trải nghiệm lưu trú an toàn – riêng tư – chuyên nghiệp cho khách hàng.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


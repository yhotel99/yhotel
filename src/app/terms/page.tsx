"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useScrollThreshold } from "@/hooks/use-scroll";

export default function TermsPage() {
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
        <section className="py-12 md:py-16 bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground">
                  Điều Khoản và Điều Kiện
                </h1>
              </div>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
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
        <section className="py-8 md:py-12 bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-background rounded-xl border shadow-lg p-6 md:p-8 lg:p-10 space-y-8">
                {/* Introduction */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    1. Giới Thiệu
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Chào mừng bạn đến với Y Hotel Cần Thơ. Khi bạn sử dụng dịch vụ đặt phòng trực tuyến của chúng tôi,
                    bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Vui lòng đọc kỹ các
                    điều khoản trước khi thực hiện đặt phòng.
                  </p>
                </div>

                {/* Booking Terms */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    2. Điều Khoản Đặt Phòng
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">2.1. Xác Nhận Đặt Phòng</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          Đặt phòng của bạn sẽ được xác nhận sau khi thanh toán thành công. Bạn sẽ nhận được email
                          xác nhận chứa thông tin chi tiết về đặt phòng của mình.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">2.2. Thông Tin Khách Hàng</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          Bạn có trách nhiệm cung cấp thông tin chính xác và đầy đủ khi đặt phòng. Y Hotel không chịu
                          trách nhiệm về bất kỳ hậu quả nào phát sinh từ thông tin không chính xác.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">2.3. Giá Cả và Thanh Toán</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          Tất cả giá được hiển thị bằng VNĐ và đã bao gồm thuế VAT. Giá có thể thay đổi tùy theo thời
                          điểm đặt phòng. Thanh toán có thể được thực hiện qua thẻ tín dụng, chuyển khoản ngân hàng hoặc
                          các phương thức thanh toán trực tuyến khác.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    3. Chính Sách Hủy Phòng
                  </h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">Hủy miễn phí:</strong> Bạn có thể hủy đặt phòng miễn phí
                      trước 24 giờ so với thời gian check-in dự kiến.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">Hủy có phí:</strong> Nếu hủy trong vòng 24 giờ trước khi
                      check-in, bạn sẽ bị tính phí hủy phòng tương đương 50% giá trị đặt phòng.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">Không đến (No-show):</strong> Nếu bạn không đến và không
                      thông báo trước, toàn bộ số tiền đặt phòng sẽ không được hoàn lại.
                    </p>
                  </div>
                </div>

                {/* Check-in/Check-out */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    4. Thời Gian Check-in và Check-out
                  </h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">Check-in:</strong> Từ 14:00 trở đi. Nếu bạn đến sớm hơn, chúng
                      tôi sẽ cố gắng sắp xếp phòng sớm nếu có sẵn, nhưng không được đảm bảo.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">Check-out:</strong> Trước 12:00. Nếu bạn muốn check-out
                      muộn hơn, vui lòng liên hệ với lễ tân để được sắp xếp (có thể phát sinh phí).
                    </p>
                  </div>
                </div>

                {/* Guest Responsibilities */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    5. Trách Nhiệm Của Khách Hàng
                  </h2>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Khách hàng phải tuân thủ các quy định của khách sạn trong thời gian lưu trú.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Khách hàng chịu trách nhiệm về mọi thiệt hại đối với tài sản của khách sạn do lỗi của mình gây
                        ra.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Không được hút thuốc trong phòng. Vi phạm sẽ bị tính phí làm sạch và có thể bị từ chối phục vụ.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Không được mang thú cưng vào khách sạn (trừ khi có thỏa thuận trước).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Khách hàng phải cung cấp giấy tờ tùy thân hợp lệ khi check-in theo quy định của pháp luật.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Hotel Responsibilities */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    6. Trách Nhiệm Của Khách Sạn
                  </h2>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Y Hotel cam kết cung cấp dịch vụ chất lượng cao và đảm bảo phòng được chuẩn bị sẵn sàng khi bạn
                        đến.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Khách sạn sẽ bảo mật thông tin cá nhân của khách hàng theo chính sách bảo mật.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        Trong trường hợp không thể cung cấp phòng đã đặt, khách sạn sẽ sắp xếp phòng thay thế tương đương
                        hoặc hoàn tiền.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Limitation of Liability */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    7. Giới Hạn Trách Nhiệm
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Y Hotel không chịu trách nhiệm về bất kỳ tổn thất, thiệt hại nào phát sinh từ các sự kiện ngoài tầm
                    kiểm soát như thiên tai, hỏa hoạn, đình công, hoặc các sự kiện bất khả kháng khác. Khách sạn cũng
                    không chịu trách nhiệm về tài sản cá nhân của khách hàng bị mất hoặc hư hỏng trong khách sạn.
                  </p>
                </div>

                {/* Changes to Terms */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    8. Thay Đổi Điều Khoản
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Y Hotel có quyền thay đổi các điều khoản và điều kiện này bất cứ lúc nào. Các thay đổi sẽ có hiệu
                    lực ngay sau khi được đăng tải trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi
                    được coi là bạn đã chấp nhận các điều khoản mới.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="pt-6 border-t">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    9. Liên Hệ
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                    Nếu bạn có bất kỳ câu hỏi nào về các điều khoản và điều kiện này, vui lòng liên hệ với chúng tôi:
                  </p>
                  <div className="space-y-2 text-sm md:text-base">
                    <p className="text-foreground">
                      <strong>Y Hotel Cần Thơ</strong>
                    </p>
                    <p className="text-muted-foreground">Địa chỉ: 60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ</p>
                    <p className="text-muted-foreground">Điện thoại: +84 123 456 789</p>
                    <p className="text-muted-foreground">Email: info@yhotel.com</p>
                  </div>
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


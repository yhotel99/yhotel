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
        <section className="py-12 md:py-16 bg-gradient-subtle">
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
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    1. Cam Kết Bảo Mật
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Y Hotel Cần Thơ cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. Chính sách bảo
                    mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng
                    dịch vụ của chúng tôi.
                  </p>
                </div>

                {/* Information Collection */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    2. Thông Tin Chúng Tôi Thu Thập
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">2.1. Thông Tin Cá Nhân</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Họ và tên</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Địa chỉ email</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Số điện thoại</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Địa chỉ</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Thông tin thanh toán (được mã hóa và bảo mật)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Thông tin giấy tờ tùy thân (khi check-in)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">2.2. Thông Tin Kỹ Thuật</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Địa chỉ IP</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Loại trình duyệt và phiên bản</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Thông tin thiết bị</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Cookies và công nghệ theo dõi tương tự</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How We Use Information */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    3. Cách Chúng Tôi Sử Dụng Thông Tin
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-3">
                    Chúng tôi sử dụng thông tin của bạn cho các mục đích sau:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Xử lý và xác nhận đặt phòng của bạn</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Gửi email xác nhận và thông tin về đặt phòng</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Cải thiện dịch vụ và trải nghiệm khách hàng</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Gửi thông tin khuyến mãi và ưu đãi đặc biệt (nếu bạn đồng ý)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Xử lý thanh toán và quản lý tài khoản</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Tuân thủ các yêu cầu pháp lý và quy định</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Phòng chống gian lận và bảo mật</span>
                    </li>
                  </ul>
                </div>

                {/* Information Sharing */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    4. Chia Sẻ Thông Tin
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-3">
                    Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, ngoại trừ các
                    trường hợp sau:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong className="text-foreground">Nhà cung cấp dịch vụ:</strong> Chúng tôi có thể chia sẻ thông
                        tin với các đối tác cung cấp dịch vụ (như dịch vụ thanh toán, email) để hỗ trợ hoạt động của
                        chúng tôi.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong className="text-foreground">Yêu cầu pháp lý:</strong> Chúng tôi có thể tiết lộ thông tin
                        nếu được yêu cầu bởi pháp luật hoặc cơ quan có thẩm quyền.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong className="text-foreground">Bảo vệ quyền lợi:</strong> Chúng tôi có thể chia sẻ thông
                        tin để bảo vệ quyền lợi, tài sản hoặc an toàn của Y Hotel, khách hàng hoặc người khác.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Data Security */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    5. Bảo Mật Dữ Liệu
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-3">
                    Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Mã hóa SSL/TLS cho tất cả các giao dịch trực tuyến</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Lưu trữ dữ liệu trên máy chủ an toàn với kiểm soát truy cập nghiêm ngặt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Thông tin thanh toán được xử lý bởi các nhà cung cấp thanh toán uy tín</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Đào tạo nhân viên về bảo mật thông tin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Giám sát và cập nhật hệ thống bảo mật thường xuyên</span>
                    </li>
                  </ul>
                </div>

                {/* Cookies */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    6. Cookies và Công Nghệ Theo Dõi
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-3">
                    Chúng tôi sử dụng cookies và công nghệ tương tự để:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Cải thiện trải nghiệm người dùng trên website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Phân tích cách bạn sử dụng website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Ghi nhớ tùy chọn và thông tin đăng nhập của bạn</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mt-3">
                    Bạn có thể quản lý hoặc xóa cookies thông qua cài đặt trình duyệt của mình. Tuy nhiên, việc vô hiệu
                    hóa cookies có thể ảnh hưởng đến chức năng của website.
                  </p>
                </div>

                {/* Your Rights */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    7. Quyền Của Bạn
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-3">
                    Bạn có các quyền sau đối với thông tin cá nhân của mình:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong className="text-foreground">Quyền truy cập:</strong> Bạn có quyền yêu cầu xem thông tin
                        cá nhân mà chúng tôi lưu trữ về bạn.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong className="text-foreground">Quyền chỉnh sửa:</strong> Bạn có quyền yêu cầu sửa đổi thông
                        tin không chính xác.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong className="text-foreground">Quyền xóa:</strong> Bạn có quyền yêu cầu xóa thông tin cá
                        nhân của mình (trừ khi pháp luật yêu cầu chúng tôi giữ lại).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong className="text-foreground">Quyền từ chối:</strong> Bạn có quyền từ chối nhận email
                        marketing từ chúng tôi.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Data Retention */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    8. Thời Gian Lưu Trữ Dữ Liệu
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để thực hiện các mục đích
                    được nêu trong chính sách này, hoặc theo yêu cầu của pháp luật. Sau khi không còn cần thiết, chúng
                    tôi sẽ xóa hoặc ẩn danh hóa thông tin của bạn một cách an toàn.
                  </p>
                </div>

                {/* Changes to Policy */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    9. Thay Đổi Chính Sách
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo trên
                    trang này với ngày cập nhật mới nhất. Chúng tôi khuyến khích bạn xem lại chính sách này định kỳ
                    để nắm bắt cách chúng tôi bảo vệ thông tin của bạn.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="pt-6 border-t">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    10. Liên Hệ Về Bảo Mật
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                    Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào liên quan đến chính sách bảo mật này hoặc cách chúng tôi
                    xử lý thông tin cá nhân của bạn, vui lòng liên hệ:
                  </p>
                  <div className="space-y-2 text-sm md:text-base">
                    <p className="text-foreground">
                      <strong>Bộ phận Bảo mật Thông tin - Y Hotel Cần Thơ</strong>
                    </p>
                    <p className="text-muted-foreground">Địa chỉ: 60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ</p>
                    <p className="text-muted-foreground">Điện thoại: +84 123 456 789</p>
                    <p className="text-muted-foreground">Email: privacy@yhotel.com</p>
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


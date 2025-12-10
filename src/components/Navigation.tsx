"use client";

import { useState } from "react";
import { Menu, X, Phone, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useScrollThreshold } from "@/hooks/use-scroll";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScrollThreshold(20);

  const navItems = [
    { name: "Trang Chủ", href: "/" },
    { name: "Phòng & Suites", href: "/rooms" },
    { name: "Blog", href: "/blog" },
    { name: "Tra Cứu Đặt Phòng", href: "/lookup" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-slate-900/95 backdrop-blur-lg shadow-card" : "bg-slate-900/80"
    }`}>
      <div className="container-luxury">
        <div className="relative flex items-center justify-between h-14 lg:h-16">
          {/* Spacer for mobile - to balance the menu button */}
          <div className="lg:hidden w-10 flex-shrink-0" />

          {/* Logo - Centered on mobile */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 flex items-center">
            <Image
              src="/logo.png"
              alt="Y Hotel Logo"
              width={180}
              height={60}
              className="h-14 w-auto md:h-16 lg:h-20 drop-shadow-2xl"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          {navItems.length > 0 && (
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-primary transition-colors duration-300 font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Contact Info & CTA - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Phone className="w-4 h-4" />
              <span>+84 123 456 789</span>
            </div>
            <Link href="/rooms">
              <Button variant="luxury" size="sm">
                Đặt Phòng
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - Right */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary hover:text-primary/80 hover:bg-primary/10 flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div className="bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-900/98 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl">
                <div className="px-6 py-8 space-y-1">
                  {/* Navigation Items */}
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between w-full px-4 py-3.5 rounded-lg text-white hover:text-primary hover:bg-primary/10 transition-all duration-300 font-medium text-base relative overflow-hidden"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="relative z-10">{item.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </motion.div>
                  ))}

                  {/* Separator */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                    className="pt-4 pb-2"
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                  </motion.div>

                  {/* Contact Info Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (navItems.length * 0.1) + 0.1, duration: 0.3 }}
                    className="space-y-3 pt-2"
                  >
                    {/* Phone */}
                    <a
                      href="tel:+84123456789"
                      className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Điện thoại</p>
                        <p className="text-white font-medium text-sm group-hover:text-primary transition-colors duration-300">
                          +84 123 456 789
                        </p>
                      </div>
                    </a>

                    {/* Email */}
                    <a
                      href="mailto:info@yhotel.com"
                      className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-white font-medium text-sm group-hover:text-primary transition-colors duration-300 break-all">
                          info@yhotel.com
                        </p>
                      </div>
                    </a>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: (navItems.length * 0.1) + 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
                    className="pt-6"
                  >
                    <Link href="/rooms" onClick={() => setIsOpen(false)} className="block">
                      <ShimmerButton
                        variant="luxury"
                        size="lg"
                        className="w-full h-14 text-base md:text-lg font-semibold shadow-2xl hover:shadow-primary/50 relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span>Đặt Phòng Ngay</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </ShimmerButton>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
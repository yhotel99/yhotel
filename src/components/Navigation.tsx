"use client";

import { useState, useEffect, memo } from "react";
import { Menu, X, Phone, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useScrollThreshold } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

const Navigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isScrolled = useScrollThreshold(20);

  // Handle menu animation state
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const navItems = [
    { name: "Trang Chủ", href: "/" },
    { name: "Phòng & Suites", href: "/rooms" },
    { name: "Blog", href: "/blog" },
    { name: "Tra Cứu Đặt Phòng", href: "/lookup" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-foreground/95 backdrop-blur-lg shadow-card" : "bg-foreground/80"
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
              className="h-14 w-auto lg:h-16 drop-shadow-2xl"
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
                  className="text-background hover:text-primary transition-colors duration-300 font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Contact Info & CTA - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-background/70">
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

        {/* Mobile Navigation - Optimized with CSS animations */}
        {(isOpen || isAnimating) && (
          <div
            className={cn(
              "lg:hidden overflow-hidden",
              isOpen ? "mobile-menu-enter" : "mobile-menu-exit"
            )}
          >
            <div className="bg-gradient-to-b from-foreground/98 via-foreground/95 to-foreground/98 backdrop-blur-xl border-t border-background/20 shadow-2xl">
              <div className="px-6 py-8 space-y-1">
                {/* Navigation Items */}
                {navItems.map((item, index) => (
                  <div
                    key={item.name}
                    className={cn(
                      isOpen && "nav-item-enter"
                    )}
                    style={isOpen ? { animationDelay: `${index * 0.1}s` } : {}}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between w-full px-4 py-3.5 rounded-lg text-background hover:text-primary hover:bg-primary/10 transition-all duration-300 font-medium text-base relative overflow-hidden"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="relative z-10">{item.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </div>
                ))}

                {/* Separator */}
                <div
                  className={cn(
                    "pt-4 pb-2",
                    isOpen && "nav-separator-enter"
                  )}
                  style={isOpen ? { animationDelay: `${navItems.length * 0.1}s` } : {}}
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-background/20 to-transparent" />
                </div>

                {/* Contact Info Section */}
                <div
                  className={cn(
                    "space-y-3 pt-2",
                    isOpen && "animate-fade-in-up"
                  )}
                  style={isOpen ? { animationDelay: `${(navItems.length * 0.1) + 0.1}s` } : {}}
                >
                    {/* Phone */}
                    <a
                      href="tel:+84123456789"
                      className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-background/10 hover:bg-background/20 border border-background/20 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-background/60 uppercase tracking-wider mb-0.5">Điện thoại</p>
                        <p className="text-background font-medium text-sm group-hover:text-primary transition-colors duration-300">
                          +84 123 456 789
                        </p>
                      </div>
                    </a>

                    {/* Email */}
                    <a
                      href="mailto:info@yhotel.com"
                      className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-background/10 hover:bg-background/20 border border-background/20 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-background/60 uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-background font-medium text-sm group-hover:text-primary transition-colors duration-300 break-all">
                          info@yhotel.com
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* CTA Button */}
                  <div
                    className={cn(
                      "pt-6",
                      isOpen && "nav-cta-enter"
                    )}
                    style={isOpen ? { animationDelay: `${(navItems.length * 0.1) + 0.2}s` } : {}}
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
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </nav>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
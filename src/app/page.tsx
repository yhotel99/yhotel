import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

// Lazy load sections below the fold for better initial page load
const AboutSection = dynamic(() => import("@/components/AboutSection"), {
  loading: () => <div className="py-12 md:py-16" />,
});
const RoomsSection = dynamic(() => import("@/components/RoomsSection"), {
  loading: () => <div className="py-12 md:py-16" />,
});
const MultiBookingPromo = dynamic(() => import("@/components/MultiBookingPromo"), {
  loading: () => <div className="py-12 md:py-16" />,
});
const ServicesSection = dynamic(() => import("@/components/ServicesSection"), {
  loading: () => <div className="py-12 md:py-16" />,
});
const GallerySection = dynamic(() => import("@/components/GallerySection"), {
  loading: () => <div className="py-12 md:py-16" />,
});
const BlogSection = dynamic(() => import("@/components/BlogSection"), {
  loading: () => <div className="py-12 md:py-16" />,
});
const ContactSection = dynamic(() => import("@/components/ContactSection"), {
  loading: () => <div className="py-8 md:py-10" />,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <RoomsSection />
        <MultiBookingPromo />
        <ServicesSection />
        <GallerySection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}


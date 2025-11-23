"use client";

import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookingSection from "@/components/BookingSection";

const BookPage = () => {
  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <BookingSection />
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;


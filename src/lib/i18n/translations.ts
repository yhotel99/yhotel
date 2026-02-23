import { homeTranslations } from "./home-translations";
import { bookingTranslations } from "./booking-translations";
import { legalTranslations } from "./legal-translations";

export type Language = "vi" | "en";

// Deep merge function for common sections
const mergeCommon = (lang: "vi" | "en") => ({
  ...homeTranslations[lang].common,
  ...bookingTranslations[lang].common,
});

// Merge all translation modules
export const translations = {
  vi: {
    nav: homeTranslations.vi.nav,
    common: mergeCommon("vi"),
    hero: homeTranslations.vi.hero,
    about: homeTranslations.vi.about,
    rooms: homeTranslations.vi.rooms,
    services: homeTranslations.vi.services,
    gallery: homeTranslations.vi.gallery,
    blog: homeTranslations.vi.blog,
    blogDetail: homeTranslations.vi.blogDetail,
    contact: homeTranslations.vi.contact,
    multiBooking: homeTranslations.vi.multiBooking,
    multiBookingPromo: homeTranslations.vi.multiBookingPromo,
    footer: homeTranslations.vi.footer,
    roomDetail: homeTranslations.vi.roomDetail,
    roomsPage: homeTranslations.vi.roomsPage,
    booking: bookingTranslations.vi.booking,
    onepayRedirect: bookingTranslations.vi.onepayRedirect,
    onepayReturn: bookingTranslations.vi.onepayReturn,
    checkout: bookingTranslations.vi.checkout,
    payAtHotel: bookingTranslations.vi.payAtHotel,
    payment: bookingTranslations.vi.payment,
    success: bookingTranslations.vi.success,
    lookup: bookingTranslations.vi.lookup,
    notFound: bookingTranslations.vi.notFound,
    terms: legalTranslations.vi.terms,
    privacy: legalTranslations.vi.privacy,
  },
  en: {
    nav: homeTranslations.en.nav,
    common: mergeCommon("en"),
    hero: homeTranslations.en.hero,
    about: homeTranslations.en.about,
    rooms: homeTranslations.en.rooms,
    services: homeTranslations.en.services,
    gallery: homeTranslations.en.gallery,
    blog: homeTranslations.en.blog,
    blogDetail: homeTranslations.en.blogDetail,
    contact: homeTranslations.en.contact,
    multiBooking: homeTranslations.en.multiBooking,
    multiBookingPromo: homeTranslations.en.multiBookingPromo,
    footer: homeTranslations.en.footer,
    roomDetail: homeTranslations.en.roomDetail,
    roomsPage: homeTranslations.en.roomsPage,
    booking: bookingTranslations.en.booking,
    onepayRedirect: bookingTranslations.en.onepayRedirect,
    onepayReturn: bookingTranslations.en.onepayReturn,
    checkout: bookingTranslations.en.checkout,
    payAtHotel: bookingTranslations.en.payAtHotel,
    payment: bookingTranslations.en.payment,
    success: bookingTranslations.en.success,
    lookup: bookingTranslations.en.lookup,
    notFound: bookingTranslations.en.notFound,
    terms: legalTranslations.en.terms,
    privacy: legalTranslations.en.privacy,
  },
} as const;

export type TranslationKeys = typeof translations.vi;

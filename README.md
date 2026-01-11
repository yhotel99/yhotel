# Y HOTEL - Modern Hotel Booking & Management

![Y HOTEL Logo](file:///d:/Project/yhotel/Y%20HOTEL_CIP.png)

A high-performance, responsive hotel booking and management platform built with Next.js, Supabase, and Tailwind CSS. This system provides a seamless experience for both customers looking for rooms and administrators managing hotel operations.

## ✨ Core Features

### 🏨 Guest Experience
- **Smart Room Discovery**: Browse and filter rooms by category, price, and availability.
- **Seamless Booking Flow**: Intuitive step-by-step process from room selection to confirmation.
- **Secure Payments**: Integrated with modern payment gateways (PAY2S, SEPAY).
- **Booking Lookup**: Easily retrieve and manage existing reservations.
- **Responsive Interface**: Fully optimized for mobile, tablet, and desktop viewing.

### 🛠️ Administrative Suite
- **Comprehensive Dashboard**: Real-time overview of bookings, revenue, and guest stats.
- **Room Management**: Easy interface to update room details, pricing, and availability.
- **User & Role Management**: Controlled access for administrators and staff.
- **Automated Webhooks**: Real-time payment processing and booking updates.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Package Manager**: [Bun](https://bun.sh/) or [npm](https://www.npmjs.com/)

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+) or Bun
- A Supabase project

### Installation
1.  **Clone the repository**:
    ```sh
    git clone <YOUR_GIT_URL>
    cd yhotel
    ```

2.  **Install dependencies**:
    ```sh
    npm install
    # or if using Bun
    bun install
    ```

3.  **Setup Environment Variables**:
    Create a `.env.local` file based on `.env.example`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    ```sh
    npm run dev
    # or
    bun dev
    ```

## 📂 Project Structure

- `src/app`: Next.js pages, API routes, and layouts.
- `src/components`: Reusable UI components (Shared, UI, Booking, Admin).
- `src/hooks`: Custom React hooks for data fetching and business logic.
- `src/lib`: Utility functions, Supabase client, and shared constants.
- `src/services`: API service layers.
- `supabase/`: Database migrations and configuration.

## 📖 Setup Guides
- [PAY2S Webhook Integration](file:///d:/Project/yhotel/PAY2S_WEBHOOK_SETUP.md)
- [SEPAY Webhook Integration](file:///d:/Project/yhotel/SEPAY_WEBHOOK_SETUP.md)
- [Realtime Features Setup](file:///d:/Project/yhotel/REALTIME_SETUP.md)

---
*Built with ❤️ for Y HOTEL.*

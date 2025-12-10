# yhotel-cyan-elegance Setup Guide

## Project Overview
This is a modern hotel booking and management web application built with **Next.js 15.5.7**, React 19, TypeScript, Tailwind CSS, and shadcn-ui components.

## Prerequisites

### Required Software
- **Node.js**: Version 18+ (Currently using v22.18.0 ✅)
- **npm**: Version 8+ (Currently using v10.9.3 ✅) 
- **Git**: For version control

### System Requirements
- Windows 10/11, macOS, or Linux
- 4GB+ RAM
- 500MB+ free disk space

## Installation Steps

### 1. Clone and Setup
```bash
# Navigate to project directory (if not already there)
cd yhotel-cyan-elegance

# Install dependencies (Already completed ✅)
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Environment Configuration

#### Required Environment Variables
Edit `.env.local` and configure the following:

```env
# Supabase Configuration (Required for database/auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anonymous-key

# Application Configuration
NEXT_PUBLIC_APP_NAME=YHotel Cyan Elegance
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Configuration
NODE_ENV=development
```

#### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Project Settings > API
3. Set up database tables as per project requirements
4. Configure Row Level Security (RLS) policies

### 3. Development Server

```bash
# Start development server (with Turbopack)
npm run dev

# The application will be available at:
# http://localhost:3000
```

### 4. Build and Deployment

```bash
# Production build  
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Project Structure

```
yhotel-cyan-elegance/
├── public/                 # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes (REST endpoints)
│   │   ├── blog/         # Blog pages
│   │   ├── book/         # Booking pages
│   │   ├── booking/      # Booking management
│   │   ├── checkout/     # Checkout flow
│   │   ├── rooms/        # Room pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Homepage
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # shadcn-ui components
│   │   └── *.tsx         # Feature components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions & API clients
│   └── types/            # TypeScript type definitions
├── .env.local            # Environment variables (create from .env.example)
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Technology Stack

### Frontend
- **Next.js 15.5.7** - React framework with App Router
- **React 19.2.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Turbopack** - Fast bundler (Next.js dev server)
- **Tailwind CSS 3.4.17** - Styling framework
- **shadcn-ui** - Component library
- **Framer Motion** - Animations

### State Management & Data
- **React Query (@tanstack/react-query)** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Supabase** - Backend database & authentication

### Routing & Navigation
- **Next.js App Router** - File-based routing with Server Components

### UI Components & Icons
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Recharts** - Charts and data visualization

## Development Guidelines

### Code Standards
- Use TypeScript with strict mode disabled (as configured)
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Implement responsive design
- Use shadcn-ui components when available

### File Naming Conventions
- Components: PascalCase (e.g., `HeroSection.tsx`)
- Pages: PascalCase (e.g., `Index.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Hooks: camelCase with 'use' prefix (e.g., `useToast.ts`)

### Performance Optimization
- Automatic code splitting with Next.js
- Optimized images with next/image
- Server Components for better performance
- Efficient re-renders with React Query
- Turbopack for faster development builds

## Troubleshooting

### Common Issues

1. **Dependencies not installed**
   ```bash
   npm install
   ```

2. **Environment variables not loaded**
   - Ensure `.env.local` exists
   - Restart development server

3. **Port 3000 already in use**
   ```bash
   npm run dev -- -p 3001
   ```

4. **Build errors**
   ```bash
   npm run lint
   # Fix linting errors and rebuild
   ```

### Security Vulnerabilities
Run security audit:
```bash
npm audit
```

If vulnerabilities are found:
- Review and update dependencies
- Most dev-only vulnerabilities don't affect production
- Monitor for security updates

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn-ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)

## Support

For project-specific issues:
1. Check this setup guide
2. Review project documentation
3. Check component implementation
4. Verify environment configuration

## Next Steps

1. ✅ Environment setup completed
2. 🔄 Configure Supabase (Required)
3. 🔄 Set up database schema
4. 🔄 Configure authentication
5. 🔄 Start development
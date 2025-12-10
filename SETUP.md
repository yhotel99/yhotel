# yhotel-cyan-elegance Setup Guide

## Project Overview
This is a modern hotel booking and management web application built with React, TypeScript, Vite, Tailwind CSS, and shadcn-ui components.

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
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key

# Application Configuration
VITE_APP_NAME=YHotel Cyan Elegance
VITE_APP_URL=http://localhost:8080

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
# Start development server
npm run dev

# The application will be available at:
# http://localhost:8080
```

### 4. Build and Deployment

```bash
# Development build
npm run build:dev

# Production build  
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
yhotel-cyan-elegance/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn-ui components
│   │   └── *.tsx         # Feature components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── .env.example          # Environment template
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Styling framework
- **shadcn-ui** - Component library
- **Framer Motion** - Animations

### State Management & Data
- **React Query (@tanstack/react-query)** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Routing & Navigation
- **React Router DOM** - Client-side routing

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
- Code splitting with React.lazy()
- Optimized images and assets
- Minimal bundle size with Vite
- Efficient re-renders with React Query

## Troubleshooting

### Common Issues

1. **Dependencies not installed**
   ```bash
   npm install
   ```

2. **Environment variables not loaded**
   - Ensure `.env.local` exists
   - Restart development server

3. **Port 8080 already in use**
   ```bash
   npm run dev -- --port 3000
   ```

4. **Build errors**
   ```bash
   npm run lint
   # Fix linting errors and rebuild
   ```

### Security Vulnerabilities
The current audit shows 3 moderate vulnerabilities in development dependencies (esbuild/vite). These are:
- Development-only vulnerabilities
- Do not affect production builds
- Can be monitored for updates

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn-ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)

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
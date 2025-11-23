import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				'display': ['Playfair Display', 'serif'],
				'sans': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					foreground: 'hsl(var(--gold-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-luxury': 'var(--gradient-luxury)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-overlay': 'var(--gradient-overlay)',
				'gradient-section': 'var(--gradient-section)',
				'gradient-shimmer': 'var(--gradient-shimmer)',
				'gradient-aurora': 'var(--gradient-aurora)',
			},
			boxShadow: {
				'luxury': 'var(--shadow-luxury)',
				'card': 'var(--shadow-card)',
				'hover': 'var(--shadow-hover)',
				'glass': 'var(--shadow-glass)',
				'glow': 'var(--shadow-glow)',
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius)',
				sm: 'calc(var(--radius) - 2px)',
				xl: 'var(--radius-xl)'
			},
			keyframes: {
				'marquee': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(calc(-100% - var(--gap)))' }
				},
				'marquee-vertical': {
					from: { transform: 'translateY(0)' },
					to: { transform: 'translateY(calc(-100% - var(--gap)))' }
				},
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(100px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary))' },
					'50%': { boxShadow: '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'aurora': {
					'0%, 100%': { 
						backgroundPosition: '0% 50%',
						opacity: '0.8'
					},
					'50%': { 
						backgroundPosition: '100% 50%',
						opacity: '1'
					}
				},
				'text-glow': {
					'0%, 100%': { textShadow: '0 0 10px hsl(var(--primary) / 0.3)' },
					'50%': { textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 10px hsl(var(--primary) / 0.2)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
						transform: 'scale(1.02)'
					}
				},
				'gradient-shift': {
					'0%': { 
						backgroundPosition: '0% 50%',
						filter: 'hue-rotate(0deg)'
					},
					'25%': { 
						backgroundPosition: '100% 50%',
						filter: 'hue-rotate(90deg)'
					},
					'50%': { 
						backgroundPosition: '100% 100%',
						filter: 'hue-rotate(180deg)'
					},
					'75%': { 
						backgroundPosition: '0% 100%',
						filter: 'hue-rotate(270deg)'
					},
					'100%': { 
						backgroundPosition: '0% 50%',
						filter: 'hue-rotate(360deg)'
					}
				}
			},
			animation: {
				'marquee': 'marquee var(--duration) linear infinite',
				'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-up': 'fade-up 0.4s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'float': 'float 2.5s ease-in-out infinite',
				'glow': 'glow 1.5s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'aurora': 'aurora 10s ease-in-out infinite',
				'text-glow': 'text-glow 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 5s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

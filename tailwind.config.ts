import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EAF0F7',
          100: '#C5D5E8',
          200: '#9FBAD9',
          300: '#7A9FCA',
          400: '#5484BB',
          500: '#2E69AC',
          600: '#1A3A6B',
          700: '#152F56',
          800: '#0D1F38',
          900: '#0A1628',
          950: '#060D18',
        },
        sky: {
          DEFAULT: '#7BA7C2',
          50: '#F5F9FC',
          100: '#E8F1F7',
          200: '#C8DCE9',
          300: '#A8C7DB',
          400: '#7BA7C2',
          500: '#5A8FAF',
          600: '#46779A',
          700: '#335F7F',
          800: '#204864',
          900: '#0E3049',
        },
        wine: {
          DEFAULT: '#8B1A2F',
          50: '#FDF0F2',
          100: '#F9D0D6',
          200: '#F2A0AD',
          300: '#E87083',
          400: '#D94059',
          500: '#C01035',
          600: '#8B1A2F',
          700: '#6B1323',
          800: '#4B0D18',
          900: '#2C070E',
        },
        cream: '#FAFBFC',
        'light-gray': '#F4F7FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(10, 22, 40, 0.08)',
        'card-hover': '0 8px 32px 0 rgba(10, 22, 40, 0.14)',
        premium: '0 4px 24px 0 rgba(10, 22, 40, 0.12)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(26,58,107,0.70) 60%, rgba(10,22,40,0.40) 100%)',
        'navy-gradient': 'linear-gradient(180deg, #0A1628 0%, #1A3A6B 100%)',
        'sky-gradient': 'linear-gradient(135deg, #EAF3FB 0%, #FFFFFF 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

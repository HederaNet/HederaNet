import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0faf4',
          100: '#dcf3e6',
          200: '#bce8d0',
          300: '#8fd7b3',
          400: '#5abe8d',
          500: '#35a26b',
          600: '#268356',
          700: '#1a7a4a',  // primary
          800: '#175f3b',
          900: '#154e32',
        },
        cream: {
          50: '#fdfcfa',
          100: '#f7f5f0',  // background
          200: '#ede9e0',
          300: '#ddd6c9',
        },
        amber: {
          400: '#f59e0b',
          500: '#d97706',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;

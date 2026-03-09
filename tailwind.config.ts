import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        yellow: {
          400: '#FACC15',
          500: '#EAB308',
        },
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        pink: {
          500: '#EC4899',
          600: '#DB2777',
        },
        lime: {
          400: '#A3E635',
          500: '#84CC16',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

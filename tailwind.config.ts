import type { Config } from 'tailwindcss';

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
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1E3A5F',
          900: '#0F1D36',
          950: '#0A1324',
          sidebar: '#14213d',
        },
        status: {
          green: '#10B981',
          'green-bg': '#E6F9F0',
          amber: '#F59E0B',
          'amber-bg': '#FEF3C7',
          orange: '#F97316',
          'orange-bg': '#FFEDD5',
          red: '#EF4444',
          'red-bg': '#FEE2E2',
          purple: '#8B5CF6',
          'purple-bg': '#F5F3FF',
          blue: '#3B82F6',
          'blue-bg': '#EFF6FF',
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        brand: '#00a218',
        'brand-dark': '#008714',
        'brand-tint': '#eaf8f2',
        ink: '#101211',
        'ink-soft': '#363a38',
        mist: '#f2f2f2',
        line: '#e5e5e6',
      },
    },
  },
  plugins: [],
};

export default config;

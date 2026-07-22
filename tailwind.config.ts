import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-grotesk)', ...fontFamily.sans]
      },
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        ring: 'var(--color-ring)'
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.25)'
      },
      backgroundImage: {
        'grid-slate':
          'linear-gradient(var(--grid-color) 1px, transparent 0), linear-gradient(90deg, var(--grid-color) 1px, transparent 0)'
      },
      backgroundSize: {
        grid: '32px 32px'
      }
    }
  },
  plugins: []
};

export default config;

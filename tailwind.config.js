/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#001738',
          muted: '#1a335b',
        },
        accent: {
          orange: '#F27420',
          'orange-soft': '#FFF4ED',
          'orange-border': '#E88A45',
        },
        net: {
          bg: '#E6F4EA',
          text: '#1E7E34',
        },
        gross: {
          bg: '#F0F2F5',
          text: '#001529',
        },
        'page-bg': '#F0F2F5',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        sidebar: {
          bg: '#001738',
          hover: '#0a2540',
          active: '#0d2d4d',
          text: '#a8b8c8',
          'text-active': '#001738',
        },
        table: {
          header: '#f8fafc',
          border: 'var(--Global-Border-border-subtle-02)',
          hover: '#f1f5f9',
          stripe: '#f4f7fb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 21, 41, 0.06)',
        modal: '0 12px 40px rgba(0, 21, 41, 0.12)',
      },
      borderColor: {
        'subtle-02': 'var(--Global-Border-border-subtle-02)',
      },
      textColor: {
        'global-text-primary': 'var(--Global-Text-Text-text-primary)',
      },
    },
  },
  plugins: [],
}

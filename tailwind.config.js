/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#1B4332',
          50: '#F0F4F1',
          100: '#D3E5DB',
          200: '#B3D0C2',
          300: '#8DBAA4',
          400: '#6BA586',
          500: '#4A8F68',
          600: '#1B4332',
          700: '#152920',
          800: '#0F1A15',
          900: '#0A0E0A',
        },
        secondary: {
          slate: '#4A4E69',
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
        accent: {
          gold: '#FFB703',
          50: '#FFFBEB',
          100: '#FFF3CD',
          200: '#FFE69C',
          300: '#FFD866',
          400: '#FFCA30',
          500: '#FFB703',
          600: '#E6A500',
          700: '#CC9400',
          800: '#B38300',
          900: '#997200',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

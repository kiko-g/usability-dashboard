/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ice: '#e7eaf4', // dce4f0
        navy: '#18222e',
        dark: '#252832',
        darker: '#1e2028',
        darkest: '#1a1c23',
        light: '#f2f4f7',
        lighter: '#f7f7f7',
        lightest: '#ffffff',
        primary: '#2DD4BF',
        secondary: '#0891B2',
        tertiary: '#A855F7',
      },
      maxWidth: {
        screen: '100vw',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      fontSize: {
        xxs: '0.6rem',
      },
      boxShadow: {
        'inner-md': 'inset 0px 0px 2px 2px rgb(0 0 0 / 0.1)',
        'inner-xl': 'inset 0px 0px 4px 4px rgb(0 0 0 / 0.1)',
      },
      fontFamily: {
        prose: ['Inter', ...defaultTheme.fontFamily.sans],
        headings: ['Inter', ...defaultTheme.fontFamily.sans],
        code: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
        flow: 'Flow',
      },
    },
  },
  plugins: [],
}

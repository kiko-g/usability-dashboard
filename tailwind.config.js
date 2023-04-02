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
        primary: '#2563eb',
        secondary: '#c084fc',
        twitch: '#6441a5',
        twitter: '#1da1f2',
        youtube: '#ff0000',
        github: '#333333',
        linktree: '#40e09e',
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
        lexend: ['Lexend', ...defaultTheme.fontFamily.sans],
        code: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
}

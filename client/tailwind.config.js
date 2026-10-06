/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#fbf6ec',
        surface: '#fffdf8',
        forest: {
          DEFAULT: '#2f6f4f',
          dark: '#24563d',
          light: '#3e8f67'
        },
        coral: {
          DEFAULT: '#ec7a4f',
          dark: '#d66338',
          light: '#f29672'
        },
        charcoal: '#1d2a24',
        softYellow: '#fdf1c7',
        softGreen: '#b9e3c6',
        softPurple: '#ece6fb',
        cobalt: '#4a86e0',
        civicPurple: '#8b6be0',
      },
      fontFamily: {
        fredoka: ['Fredoka', 'system-ui', 'sans-serif'],
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hard-sm': '1.5px 1.5px 0 #1d2a24',
        'hard': '2px 2px 0 #1d2a24',
        'hard-md': '3px 3px 0 #1d2a24',
        'hard-lg': '4px 4px 0 #1d2a24',
      }
    },
  },
  plugins: [],
}

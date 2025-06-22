/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        michroma: ['Michroma', 'sans-serif'],
        technovier: ['Technovier', 'sans-serif'],
        calculator: ['Calculator', 'sans-serif'],
      },
    },
  },
  plugins: [],
}   
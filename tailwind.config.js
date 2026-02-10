/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ivory: '#FFF9C4',
          blue: '#60A5FA',
          purple: '#A78BFA',
          pink: '#F472B6',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #60A5FA, #A78BFA, #F472B6)',
      },
    },
  },
  plugins: [],
}

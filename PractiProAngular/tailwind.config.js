/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        neon: '#51abcb',
        darkblue: '#000136',
        navbar: '#2187ab',
      },
      backgroundColor: {
        'dash-b': '#1e1b4b',
        'hover-side' : '#312e81'
      }

    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}



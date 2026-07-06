/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#1E7A46',
          dark: '#145233',
          light: '#E4F3EA',
        },
        ink: '#152019',
        mid: '#5B6B62',
        low: '#8FA098',
        line: '#DCE8E0',
        danger: '#C0392B',
        dangerbg: '#FBEAE7',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

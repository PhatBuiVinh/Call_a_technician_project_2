import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // makes `font-sans` use Poppins everywhere
        sans: ['"Poppins"', "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
         brand: {
          navy: "#000154",     // nav background
          green: "#31EE88",    // primary CTA
          lightblue: "#52D5FF",
          blue: "#1A58D3",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [typography],
};

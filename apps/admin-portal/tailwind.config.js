import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:  '#000154',  // Main Background (Navy)
          bg:    '#000154',  // Main Background (Navy)
          panel: '#0c1450',  // Panel Background
          blue:  '#1A58D3',  // Primary Blue (Buttons / Highlights)
          sky:   '#52D5FF',  // Accent Sky Blue
          teal:  '#31EE88',  // Success Teal
          ink:   '#0B1337',  // Text on Light Panels
          surface: '#0c1450',
          'surface-hover': '#1a1b2e',
          border: 'rgba(82, 213, 255, 0.2)',
          'border-hover': 'rgba(82, 213, 255, 0.3)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b8c5d6',
          muted: '#6b7280',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,.25)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [forms],
};

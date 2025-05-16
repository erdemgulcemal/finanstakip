/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ana tema renkleri
        theme: {
          DEFAULT: '#13131A',    // En koyu arka plan
          dark: '#1C1C28',       // Ana içerik arka planı
          light: '#232331',      // Açık arka plan
          card: '#1E1E2D',       // Kart arka planı
        },
        // Primary renkler
        primary: {
          '50': '#f0fdfa',
          '100': '#ccfbf1',
          '200': '#99f6e4',
          '300': '#5eead4',
          '400': '#2dd4bf',
          '500': '#14b8a6',      // Ana primary renk
          '600': '#0d9488',
          '700': '#0f766e',
          '800': '#115e59',
          '900': '#134e4a',
        },
        // Vurgu renkleri
        accent: {
          DEFAULT: '#00F7FF', // Turkuaz vurgu
          green: '#1AB98B',   // Yeşil
          red: '#FF5C5C',     // Kırmızı
          purple: '#6C5DD3',  // Mor
        },
        // Metin renkleri
        content: {
          DEFAULT: '#FFFFFF',
          secondary: '#A6A6B1',
          muted: '#6F6E84',
        }
      },
      boxShadow: {
        'card': '0 4px 8px rgba(0, 0, 0, 0.1)',
        'glow': '0 4px 20px rgba(0, 247, 255, 0.15)',
      },
    },
  },
  plugins: [],
} 
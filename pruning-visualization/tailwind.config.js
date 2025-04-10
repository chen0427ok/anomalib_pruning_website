module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5A2B',
        'primary-light': '#F5E8D7',
        accent: '#D2A66F',
        bg: '#FAF7F2',
        text: '#3E312B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      }
    },
  },
  plugins: [],
} 
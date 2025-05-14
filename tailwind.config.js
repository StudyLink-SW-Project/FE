// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 'primary' 유틸 사용 시 var(--primary-color)를 참조
        primary: 'var(--primary-color)',
        background: 'var(--bg-color)',
        foreground: 'var(--text-color)',
      },
    },
  },
  plugins: [],
};

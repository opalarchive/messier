module.exports = {
  purge: {
    content: ["src/**/*.{ts,tsx}"],
    safelist: [/^bg-/],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

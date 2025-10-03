const colors = require("./src/utils/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.light.primary,
          dark: colors.dark.primary,
        },
        secondary: {
          DEFAULT: colors.light.secondary,
          dark: colors.dark.secondary,
        },
        background: {
          DEFAULT: colors.light.background,
          dark: colors.dark.background,
        },
        surface: {
          DEFAULT: colors.light.surface,
          dark: colors.dark.surface,
        },
        text: {
          DEFAULT: colors.light.text,
          dark: colors.dark.text,
        },
        border: {
          DEFAULT: colors.light.border,
          dark: colors.dark.border,
        },
        onSurface: {
          DEFAULT: colors.light.onSurface,
          dark: colors.dark.onSurface,
        },
        onPrimary: {
          DEFAULT: colors.light.onPrimary,
          dark: colors.dark.onPrimary,
        },
      },
      fontFamily: {
        andada: ['andada', 'sans-serif'],
        'andada-bold': ['AndadaPro-Bold', 'sans-serif'],
        'andada-italic': ['AndadaPro-Italic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
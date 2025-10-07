// colors.js

const lightColors = {
  primary: "#ca5094",
  onPrimary: "#FFFFFF",
  primaryContainer: "#fce8f1",
  onPrimaryContainer: "#4a0030",

  secondary: "#a33c6e",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#f8d7e6",
  onSecondaryContainer: "#3d1228",

  tertiary: "#8a5075",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#f6d9eb",
  onTertiaryContainer: "#36142a",

  error: "rgb(186, 26, 26)",
  onError: "#FFFFFF",
  errorContainer: "rgb(255, 218, 214)",
  onErrorContainer: "rgb(65, 0, 2)",

  background: "#ffffff",   // seu override
  onBackground: "#212121",

  surface: "#F5F5F5",      // seu override
  onSurface: "#212121",

  surfaceVariant: "#fce8f1",
  onSurfaceVariant: "#6a5a64",

  outline: "#d3cfd4",
  outlineVariant: "#f1e6eb",

  shadow: "#000000",
  scrim: "#000000",

  inverseSurface: "#2e2e2e",
  inverseOnSurface: "#f5f5f5",
  inversePrimary: "#d17ba5",

  elevation: {
    level0: "transparent",
    level1: "#fdf5f9",
    level2: "#fceff5",
    level3: "#fbe8f0",
    level4: "#fbe4ee",
    level5: "#fadfea",
  },

  surfaceDisabled: "rgba(33, 33, 33, 0.12)",
  onSurfaceDisabled: "rgba(33, 33, 33, 0.38)",
  backdrop: "rgba(51, 47, 55, 0.4)",
};

const darkColors = {
  primary: "#ca5094",
  onPrimary: "#FFFFFF",
  primaryContainer: "#3a2a35",
  onPrimaryContainer: "#f8e3ef",

  secondary: "#d17ba5",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#4b2c3b",
  onSecondaryContainer: "#fdd9eb",

  tertiary: "#a36b8c",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#543447",
  onTertiaryContainer: "#fbd9ed",

  error: "rgb(255, 180, 171)",
  onError: "#690005",
  errorContainer: "rgb(147, 0, 10)",
  onErrorContainer: "rgb(255, 180, 171)",

  background: "#1a1a1a",
  onBackground: "#e0e0e0",

  surface: "#2a2a2a",
  onSurface: "#e0e0e0",

  surfaceVariant: "#3a2a35",
  onSurfaceVariant: "#c7bfc8",

  outline: "#5a4a55",
  outlineVariant: "#7a6875",

  shadow: "#000000",
  scrim: "#000000",

  inverseSurface: "#f5f5f5",
  inverseOnSurface: "#2e2e2e",
  inversePrimary: "#d17ba5",

  elevation: {
    level0: "transparent",
    level1: "#2a1d26",
    level2: "#342330",
    level3: "#3d2a38",
    level4: "#442f3e",
    level5: "#4c3545",
  },

  surfaceDisabled: "rgba(224, 224, 224, 0.12)",
  onSurfaceDisabled: "rgba(224, 224, 224, 0.38)",
  backdrop: "rgba(51, 47, 55, 0.4)",
};

module.exports = {
  light: lightColors,
  dark: darkColors,
};

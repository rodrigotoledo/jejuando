// paperTheme.js
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { light, dark } from "./colors";

export const paperTheme = {
  light: {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...light, // aqui suas cores sobrescrevem as default
    },
  },
  dark: {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...dark,
    },
  },
};

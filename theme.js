import { MD3LightTheme } from "react-native-paper";
import colors from "./colors";

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
};
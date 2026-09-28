# Stack — React Native 0.81.x Upgrade

Verified against the npm registry and the local toolchain. Version targets are the ceilings the declared peer ranges admit, not the newest published versions overall.

## Framework

| Package | Current | Target | Constraint |
|---|---|---|---|
| `react-native` | 0.81.1 | 0.81.6 | Capped by `react-native-macos` 0.81.9 |
| `react` | 19.1.0 | unchanged | Pairs with the 0.81 line |
| `react-native-macos` | ^0.79.0 | holds the cap | Newest published is 0.81.9; `next` = 0.81.0, `nightly` = 0.78.4 |

## Native modules

| Package | Current | Target | Basis |
|---|---|---|---|
| `react-native-reanimated` | 3.19.1 | 3.19.5 | 4.x requires RN 0.86–0.88 + worklets 0.13.x |
| `react-native-gesture-handler` | 2.26.0 | 2.33.0 | 3.x outside the 0.81 range |
| `react-native-paper` | 5.14.5 | current major | Wildcard `react-native` peer |
| `react-native-screens` | 4.15.4 | current major | Wildcard peer |
| `react-native-safe-area-context` | 5.5.2 | current major | Wildcard peer |
| `react-native-svg` | 15.12.1 | current major | Wildcard peer |
| `react-native-device-info` | 14.0.4 | current major | Wildcard peer |
| `react-native-config` | 1.5.5 | current major | Wildcard peer |
| `@notifee/react-native` | 9.1.8 | current | Already newest published |
| `@react-native-async-storage/async-storage` | 2.2.0 | current major | No range conflict identified |
| `@react-native-community/datetimepicker` | 8.4.4 | current major | No range conflict identified |

## Toolchain

| Component | Verified version | Note |
|---|---|---|
| Xcode | 27.0 (27A266a) | Available; iOS is an acceptance gate |
| JDK | 17 (Zulu 17.0.20.1) | Sufficient for the 0.81 range |
| Kotlin | 2.1.20 | `android/build.gradle` |
| Gradle | 8.14.3 | `gradle-wrapper.properties` |
| Node.js | 22.15.1 | `.tool-versions` |
| Ruby | 3.4.2 | CocoaPods via `Gemfile` |

## Condition for lifting the 0.81.x cap

The cap may be lifted only when `react-native-macos` publishes a release matching the intended `react-native` minor. Until then, any bump above the 0.81 line breaks the declared dependency's peer expectation.

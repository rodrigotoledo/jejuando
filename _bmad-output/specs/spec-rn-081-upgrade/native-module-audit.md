# Native Module Audit

The deliverable for CAP-3. Each native module in the park gets a verdict before any version bump, so an incompatible module is found before it breaks a build.

## Verdict vocabulary

- **compatible** — no change needed for the target range.
- **needs-replacement** — cannot be carried forward; a functional equivalent is required.
- **blocking** — no known path forward; escalate before proceeding.

## Audit scope

Every dependency that ships native code for Android or iOS:

`@notifee/react-native`, `@react-native-async-storage/async-storage`, `@react-native-community/datetimepicker`, `@react-native-vector-icons/material-design-icons`, `react-native-config`, `react-native-device-info`, `react-native-gesture-handler`, `react-native-pager-view`, `react-native-paper`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `react-native-vector-icons`, `react-native-circular-progress`, `rn-inkpad`, `react-native-checkbox`, `nativewind`.

## Required per-module record

| Field | Meaning |
|---|---|
| Module | Package name |
| Current | Declared version |
| Target | Version to adopt, or current if unchanged |
| New Architecture | Explicit support, bridged, or unknown |
| Verdict | compatible \| needs-replacement \| blocking |
| Evidence | Where the claim comes from — release notes, changelog, `android/` and `ios/` sources, peer ranges |

## Status

Audit not yet performed. Every module above is unverdicted until this table is filled in during implementation of CAP-3. A module without a verdict fails the review for that capability.

## Known risks to check first

- `react-native-reanimated` 3.x under the New Architecture — confirm the target patch is fully supported, not partially bridged.
- `react-native-checkbox` and `rn-inkpad` — both are low-maintenance; confirm either has a release in the target range.
- `nativewind` 4.1.23 — its Metro integration runs through `metro.config.js`; confirm compatibility with the Metro version shipped in `@react-native/metro-config` 0.81.x.
- `react-native-responsive-screen` and `react-native-circular-progress` — confirm current releases tolerate the target range.

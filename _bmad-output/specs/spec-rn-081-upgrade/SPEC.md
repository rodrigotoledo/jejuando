---
id: SPEC-rn-081-upgrade
companions:
  - stack.md
  - native-module-audit.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# React Native 0.81.x Upgrade

## Why

A **mandate to meet**, with a **pain to solve**. The project sits on `react-native` 0.81.1, six patch releases behind the 0.81 line, on a toolchain (Gradle 8.14.3, Kotlin 2.1.20) that predates the release train. Security fixes, Metro patches and dependency fixes shipped since 0.81.1 are unavailable to the app, and the dependency park has drifted — `react-native-reanimated` 3.19.1, `react-native-gesture-handler` 2.26.0 and `react-native-device-info` 14.0.4 all trail the newest version this range can carry. Every future upgrade gets more expensive the longer this drifts.

The force that sets the shape of this work is a hard ceiling: `react-native-macos` has published nothing past 0.81.9. The declared dependency therefore pins the entire framework to the 0.81.x line, and the upgrade is scoped to the newest patch this range admits rather than to a newer minor.

## Capabilities

- **CAP-1**
  - **intent:** A developer can run `npm install` on a clean checkout and get a coherent, deduplicated dependency tree with `react-native` at the newest 0.81.x release, without peer-dependency errors.
  - **success:** `npm ls react-native` reports a single resolved 0.81.x version across the tree, and `npm install` exits 0 with no unmet peer dependency warnings for the packages listed in `stack.md`.

- **CAP-2**
  - **intent:** A developer can build and launch the app on both Android and iOS from the upgraded tree, so that both platforms remain deliverable.
  - **success:** `npm run android` launches the app on an emulator and `npm run ios` launches it on a simulator, each reaching the first rendered screen with no red-box error, verified by a screenshot from both.

- **CAP-3**
  - **intent:** A maintainer can determine, from a durable record, which native modules in the park are compatible with the current architecture and which need replacement, so that the upgrade does not silently inherit an unsupported module.
  - **success:** `native-module-audit.md` lists every native dependency with a verdict of compatible, needs-replacement, or blocking, and any module without a verdict fails the review.

- **CAP-4**
  - **intent:** A developer can run the app's existing test and lint suites against the upgraded tree and get the same pass/fail picture as before the upgrade, so that the upgrade is not a silent behavioural regression.
  - **success:** `npm test` and `npm run lint` run to completion, and every test that passed on 0.81.1 still passes or has a documented, reviewed reason it cannot.

- **CAP-5**
  - **intent:** A maintainer can see, at the point of the version constraint, why the framework is capped at 0.81.x, so that a future upgrade is not attempted blindly against an unresolved ceiling.
  - **success:** The `react-native-macos` constraint in `package.json` carries a comment naming the ceiling and the condition for lifting it, and `stack.md` records the same condition.

## Constraints

- `react-native` must not exceed the 0.81.x line while `react-native-macos` is declared, because 0.81.9 is its newest published release.
- `react-native-reanimated` must not exceed the 3.x line; 4.x requires `react-native` 0.86–0.88 and `react-native-worklets` 0.13.x, neither of which this range provides.
- `react-native-gesture-handler` must not exceed the 2.x line.
- Every library currently in the dependency park must survive the upgrade. A library that cannot be carried forward is replaced by a functional equivalent, not removed.
- Both iOS and Android builds must be green for this work to be accepted; neither platform may be deferred.
- The `react-native-macos` dependency stays declared; macOS support is not removed as part of this upgrade.
- New Architecture (Fabric, TurboModules, JSI) is the runtime target; the audit precedes any version bump so that an incompatible module is found before it breaks a build.

## Non-goals

- Reaching `react-native` 0.87.x, or any minor above the 0.81 line. The macOS ceiling forbids it.
- Building an actual macOS target. There is no `macos/` directory, and this spec requires only that the existing pin does not break.
- Upgrading `react-native-reanimated` to 4.x, `react-native-gesture-handler` to 3.x, or adopting `react-native-worklets`.
- Migrating to Expo, Expo Router, TanStack Query, Zustand, or FlashList. Modernization beyond the current range is not part of this work.
- Changing any user-facing behaviour, screen, or navigation structure.
- Rewriting the app's source from JavaScript to TypeScript, or adopting the Strict TypeScript API.

## Success signal

A developer clones the repository, runs `npm install`, then `npm run ios` and `npm run android`, and both platforms reach the first rendered screen on a clean build from the upgraded tree — with `npm test` and `npm run lint` reporting no new failures and the native module park fully accounted for in `native-module-audit.md`.

## Assumptions

- The `react-native-macos` dependency is vestigial: no `macos/` directory exists, it is absent from `node_modules`, and its only reference is `package.json:40`. The user nonetheless chose to retain it, so it is treated as a live pin rather than dead weight.
- The `@react-native/*` devDependency packages bump in lockstep with `react-native` to their matching 0.81.x releases; their exact versions were not confirmed and are resolved during implementation.

## Open Questions

- The exact `@react-native/*@0.81` versions for `babel-preset`, `eslint-config`, `metro-config` and `typescript-config` were not confirmed against the registry. Does the upgrade align them all to a single 0.81.x patch, or is the newest available per package acceptable?
- Does `@notifee/react-native` 9.1.8 need a bump for the chosen range, given it is already at its newest published version and has no newer release to reach?
- Should the `react-native-macos` pin be raised from `^0.79.0` to the newest 0.81.x, or left exactly as declared?

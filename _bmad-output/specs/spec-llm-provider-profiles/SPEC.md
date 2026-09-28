---
id: SPEC-llm-provider-profiles
companions:
  - provider-profiles.md
  - migration-notes.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# LLM Provider Profiles — local Ollama and remote gateway

## Why

A **pain to solve**. Every generated diet plan and exercise plan currently depends on a paid, remote, hardcoded OpenAI endpoint. `src/utils/openai.js` builds a client straight against `https://api.openai.com/v1` with `Config.API_GPT_KEY`, and two screens construct their own duplicate clients the same way. There is no way to develop, test or demo the app's core AI features without spending money and without a network round-trip to a third party, and no way to point the app at a different model.

That blocks work on the app's most valuable behaviour. A developer cannot iterate on prompting, cannot reproduce a generation locally, and cannot run the app at all without a funded OpenAI key. Meanwhile a capable medical-domain model, `MedGemma1.5:latest`, is already running locally on Ollama — the means to remove the dependency exists and is unused.

This matters now because the app's AI features are its differentiator and they are the hardest thing to develop against.

## Capabilities

- **CAP-1**
  - **intent:** A developer can select which model backend the app uses without editing application code, choosing between a local Ollama instance and a remote gateway.
  - **success:** Changing only environment variables switches the app between the local and remote profiles, with no source file modified, and the generated plan reflects the selected profile's model.

- **CAP-2**
  - **intent:** A developer can run and exercise the app's generation features fully offline against a local Ollama instance serving `MedGemma1.5:latest`, so that development needs no paid key and no external service.
  - **success:** With the local profile active and the machine offline from the public internet, generating a diet plan and an exercise plan each returns rendered content in the app, originating from the local Ollama endpoint.

- **CAP-3**
  - **intent:** A developer can point the app at the local Ollama instance from an Android emulator, a physical device, and an iOS simulator, so that the same build works across the machines actually used.
  - **success:** The same app build generates successfully from all three host configurations by changing only the configured base URL, with the reachable address for each documented in `provider-profiles.md`.

- **CAP-4**
  - **intent:** A maintainer can change the model, endpoint, or credentials for either profile in exactly one place, so that no future call site drifts to a hardcoded backend.
  - **success:** A search of the source finds exactly one construction of the LLM client, and no endpoint literal or credential read outside the configuration layer.

- **CAP-5**
  - **intent:** A user can tell the difference between "the model is still working" and "the model failed", so that a slow or unreachable local instance does not present as an indefinite hang.
  - **success:** When the configured endpoint is unreachable, the app shows an error state naming the failure within the configured timeout, with no infinite loading indicator.

## Constraints

- The app must never require an external server in development. The local profile talks only to an Ollama instance the developer controls.
- The base URL is configuration, not a constant: the Android emulator reaches the host at `10.0.2.2`, a physical device needs the LAN address, and the iOS simulator uses `localhost`.
- Profile selection happens through environment variables read at build time; the two profiles are named `local` and `remote`.
- The local profile is the default in development; the remote profile is opt-in.
- Exactly one place in the source may construct the LLM client. The inline clients in `DietScreen.js` and `ExerciseScreen.js` are removed, not left alongside.
- The helper's model must not default to a cloud model such as `gpt-4o`; the active profile supplies it.
- An explicit request timeout is required, so a slow local model surfaces as a failure rather than a hang.
- `react-native-config` compiles env values into the build, so a profile change requires a rebuild rather than a Metro reload; the documentation must say so.
- No credential may be committed. `.env` stays ignored and `.env.example` carries only non-secret placeholders.
- Existing generation behaviour is preserved: both screens still produce a diet plan and an exercise plan from the user's stored profile.

## Non-goals

- Adding a model-picker UI for end users. Profile selection is a developer concern, set by env.
- Streaming or token-by-token rendering of model output.
- Fine-tuning, training, or hosting `MedGemma1.5` — the spec consumes an Ollama instance, it does not provision one.
- Reworking prompts, evaluation logic, or the response parsing that turns model output into a stored plan.
- Migrating from `react-native-config` to another env mechanism, or replacing the `openai` SDK.
- Any change to the React Native version or packaging; that is a separate spec.
- Supporting multiple providers simultaneously within one session.

## Success signal

A developer with no OpenAI key, working offline, sets the local profile, launches the app on an Android emulator, and generates both a diet plan and an exercise plan from `MedGemma1.5:latest` running on their own machine — then flips one environment variable to the remote profile, rebuilds, and gets the same two plans from the gateway instead.

## Assumptions

- Ollama is already running locally and `MedGemma1.5:latest` is already pulled; the spec does not cover installing either. Observed during recon: the endpoint answered and the model is present.
- Both screens call the helper with a single argument, so the model flows from the active profile rather than the call site.
- The `local`/`remote` split is a developer-machine concern and not shipped as a user-facing setting.

## Open Questions

- For the remote profile, what is the gateway's base URL, and does it expect a bearer token or another auth scheme?
- Should the remote profile be permitted in production builds, or hard-fail so a release cannot silently depend on a developer gateway?
- Is `MedGemma1.5:latest` the model for both the diet and exercise flows, or should the exercise flow use a different local model?
- What timeout value suits the local profile? Local generation is slower than the cloud model, so the current absence of a timeout is not a safe baseline.

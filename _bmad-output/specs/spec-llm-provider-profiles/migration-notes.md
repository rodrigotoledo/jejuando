# Migration Notes

What exists today and what changes. Read alongside `SPEC.md`.

## Current state

The LLM client is constructed in three places, each hardcoding the cloud endpoint:

| Location | What it does |
|---|---|
| `src/utils/openai.js:4-7` | Builds the client with `Config.API_GPT_KEY`, sets `baseURL` to the OpenAI endpoint, overrides `buildURL` |
| `src/screens/DietScreen.js:22-24` | Constructs a second client identically, then never uses it — dead code |
| `src/screens/ExerciseScreen.js:27-29` | Constructs a third client identically — also dead code |

The exported helper is the only path actually exercised:

```
callGPTAPI(prompt, model = "gpt-4o", temperature = 0.7)
```

Both screens call it as `callGPTAPI(prompt)`, so every generation silently requests `gpt-4o` against `api.openai.com`.

## Target state

One client, one helper, model and endpoint from the active profile:

- A single module reads `LLM_PROFILE`, `LLM_BASE_URL`, `LLM_MODEL` and `LLM_API_KEY`, resolves the profile, and constructs the client once.
- `callGPTAPI` keeps a compatible call shape so the two screens need no logic change beyond deleting their dead client blocks, but its model parameter no longer defaults to a cloud model.
- The local profile resolves to the Ollama endpoint with `MedGemma1.5:latest`.

## Call sites to update

| File | Change |
|---|---|
| `src/utils/openai.js` | Becomes the single client owner; reads the profile |
| `src/screens/DietScreen.js` | Removes the unused client block and the now-unneeded `openai` and `Config` imports if unused |
| `src/screens/ExerciseScreen.js` | Same removal |

## Environment files

`.env` is gitignored and currently holds only `API_GPT_KEY`. `.env.example` holds the same key name with an empty value.

The new variables belong in `.env.example` with non-secret placeholder values, and in the developer's own `.env` with real values. No token may be committed.

## Verification approach

- Local profile, emulator: generate a diet plan and an exercise plan; confirm both render and that no request leaves for the public internet.
- Local profile, iOS simulator and physical device: repeat with the matching `LLM_BASE_URL`.
- Remote profile: repeat with the gateway values, confirming only env changed.
- Failure path: stop Ollama, trigger a generation, confirm an error surfaces within the timeout rather than an endless spinner.
- Drift check: grep the source for the endpoint literal and for client construction; expect exactly one of the latter and none of the former outside the configuration layer.

# Provider Profiles

The two profiles are selected by environment, read at build time through `react-native-config`. Both speak the OpenAI chat-completions shape, which is why one client and one helper serve both.

## `local` — default in development

| Variable | Value | Note |
|---|---|---|
| `LLM_PROFILE` | `local` | Selects this profile |
| `LLM_BASE_URL` | see host table | Must match the runtime host |
| `LLM_MODEL` | `MedGemma1.5:latest` | Served by Ollama |
| `LLM_API_KEY` | `ollama` | Ollama ignores it, but the SDK requires a non-empty string |

Ollama serves an OpenAI-compatible surface at `/v1` on port `11434`, so no SDK change is needed.

## Host reachability

The same build cannot reach the host at one fixed address, so `LLM_BASE_URL` is per host:

| Runtime | Base URL | Why |
|---|---|---|
| Android emulator | `http://10.0.2.2:11434/v1` | `10.0.2.2` is the emulator's alias for the host machine |
| Physical Android device | `http://<LAN-IP>:11434/v1` | Device and host must share a network; `192.168.1.6` was the observed address |
| iOS simulator | `http://localhost:11434/v1` | Shares the host's network stack |

A physical device also needs Ollama to accept non-loopback connections, which is a host-side setting rather than an app one.

## `remote` — opt-in gateway

| Variable | Value | Note |
|---|---|---|
| `LLM_PROFILE` | `remote` | Selects this profile |
| `LLM_BASE_URL` | gateway URL | Supplies `/v1` |
| `LLM_MODEL` | gateway's model id | For example the alias the gateway expects |
| `LLM_API_KEY` | gateway token | Never committed; lives only in `.env` |

The exact URL, token and expected model id for the gateway are unresolved — see the spec's open questions.

## Rebuild requirement

`react-native-config` injects values at build time via `android/app/build.gradle` (`dotenv.gradle`) and `android/settings.gradle`. Changing a profile therefore requires a rebuild; a Metro reload will not pick it up. The iOS side reads env through the same package's build phase.

## Failure behaviour

An unreachable endpoint must surface as an error naming the failure within the configured timeout. Without an explicit timeout a slow local model presents as an indefinite loading indicator, which is the failure mode this spec exists to prevent.

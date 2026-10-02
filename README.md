# omp-provider-at-statusline

An extension for [Oh My Pi (omp)](https://github.com/can1357/oh-my-pi) that outputs the friendly, sanitized AI provider name to the native `status` statusline segment.

Pairs cleanly alongside the native `model` segment, giving you clear separation between the active provider and the current model with its reasoning effort level.

## Features

- **Built-in Suggested Dictionary**: Ships with pre-configured clean labels for all official Oh My Pi providers without requiring regular expression workarounds.
- **Custom Overrides (`/provider-rename`)**: Modify any provider name interactively or directly in `~/.omp/provider-names.json`.
- **Clean Default Labels**: Maps `openai-codex` to `ChatGPT Plus/Pro`, `google-antigravity` to `Antigravity`, `xiaomi-token-plan-sgp` to `Xiaomi Token Plan`, and so on.
- **Native Synergy**: Designed to precede the native `model` segment in `leftSegments`, keeping thinking levels, effort indicators, and model names rendered natively by omp.
- **Zero Runtime Dependencies**: Lightweight and fast, consuming host APIs directly without external overhead.
## Installation

Install via the omp plugin manager:

```sh
omp plugin install omp-provider-at-statusline
```

Or link locally for development:

```sh
omp plugin link ~/Code/omp-provider-at-statusline
```

## Configuration

In your `~/.omp/agent/config.yml`, add `status` before `model` in `leftSegments` and ensure `showHookStatus` is set to `false` so the status renders in the main segment rather than an extra hook line:

```yaml
statusLine:
  preset: custom
  separator: powerline
  leftSegments:
    - status
    - model
    - path
    - git
  compactThinkingLevel: false
  showHookStatus: false
```
## Command: `/provider-rename`

Rename providers on the fly directly inside your omp sessions:

- `/provider-rename <new-name>`: Renames the provider of your currently active model.
- `/provider-rename <provider-id> <new-name>`: Sets a custom display name for any specific provider ID.
- `/provider-rename reset [provider-id]`: Resets a provider back to the built-in default.
- `/provider-rename list`: Lists all custom aliases configured on your machine.

Custom overrides are persisted to `~/.omp/provider-names.json`:

```json
{
  "google-antigravity": "Gemini",
  "anthropic": "Claude AI"
}
```

## Preview

With powerline separators enabled, the segments render as:

- `Antigravity` (status segment) | `gemini-3.8-flash · 󰪡 med` (model segment)
- `ChatGPT Plus/Pro` (status segment) | `gpt-6-luna ·  max` (model segment)
- `Google` (status segment) | `gemini-2.5-flash` (model segment)

## License

MIT © [João C. Furtado](https://github.com/jotafurtado)

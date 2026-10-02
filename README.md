# omp-provider-at-statusline

An extension for [Oh My Pi (omp)](https://github.com/can1357/oh-my-pi) that outputs the friendly, sanitized AI provider name to the native `status` statusline segment.

Pairs cleanly alongside the native `model` segment, giving you clear separation between the active provider and the current model with its reasoning effort level.

## Features

- **Clean Provider Names**: Strips extraneous parenthetical metadata (e.g. `Antigravity` instead of `Antigravity (Gemini 3, Claude, GPT-OSS)` or `Xiaomi Token Plan` instead of `Xiaomi Token Plan (Singapore)`).
- **Special Case Mapping**: Maps `openai-codex` directly to the concise label `ChatGPT Plus/Pro`.
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

## Preview

With powerline separators enabled, the segments render as:

- `Antigravity` (status segment) | `gemini-3.8-flash · 󰪡 med` (model segment)
- `ChatGPT Plus/Pro` (status segment) | `gpt-6-luna ·  max` (model segment)
- `Google` (status segment) | `gemini-2.5-flash` (model segment)

## License

MIT © [João C. Furtado](https://github.com/jotafurtado)

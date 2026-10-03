# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-10-03

### Added

- Built-in friendly name `Kiro` for the `kiro` provider.

## [1.1.0] - 2026-10-02

### Added

- Built-in suggested provider dictionary (`DEFAULT_PROVIDER_NAMES`) covering all official Oh My Pi providers without regex stripping.
- `/provider-rename` slash command with interactive provider selection and rename input dialogs, plus quick CLI arguments.
- Persistent custom overrides via `~/.omp/provider-names.json`.

## [1.0.0] - 2026-10-02

### Added

- Initial release of `omp-provider-at-statusline`.
- Friendly provider name rendering to the native `status` statusline segment.
- Parenthetical metadata sanitization for cleaner provider names.
- Automatic mapping of `openai-codex` to `ChatGPT Plus/Pro`.
- Seamless compatibility with omp's native `model` segment and thinking effort levels.

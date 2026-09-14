# Changelog

## [1.1.1-pro.1] - 2026-09-14

Forked from [orangeboyChen/codebuddy2api](https://github.com/orangeboyChen/codebuddy2api) v1.1.1 (MIT).

### Added (Pro hardening, not in upstream)

- **Outbound payload sanitization** — fixes upstream HTTP 400 `11128 Illegal API invocation`
  caused by exact-match blacklist hits on Claude Code / Codex fingerprint sentences and
  `x-anthropic-billing-header` / `cc_*` key-value segments. Fingerprint sentences are
  rewritten one word at a time (semantics preserved, idempotent — no snowballing on retry).
- **`developer` role normalization** — upstream only accepts `system`; `developer` messages
  are normalized automatically before forwarding.
- **`tool_choice` string normalization** — upstream rejects object-form `tool_choice`
  (HTTP 400 `11101`); object forms are converted to strings (`auto`/`required`/tool name),
  `none` strips both `tool_choice` and `tools`.
- **Model discovery User-Agent fix** — model-discovery requests now send the CLI User-Agent
  and X-IDE headers so upstream `/v3/config` no longer rejects them (previously new upstream
  models never appeared in `/v1/models`).
- **Generic outbound proxy support** — documented standard `HTTPS_PROXY`/`HTTP_PROXY` env
  var support (Bun native fetch) for routing upstream traffic through any HTTP proxy.

### Changed

- `package.json` name → `codebuddy2api-pro`
- README quick start builds from source (no published image yet)

### Tests

- Added `tests/server/pro-sanitize.test.ts` covering sanitization, role normalization,
  tool_choice normalization, and model-discovery headers.
- Updated upstream tests that asserted object-form `tool_choice` passthrough to assert the
  new normalized string behavior. Full suite: 259 passing (was 253 upstream + 6 new).

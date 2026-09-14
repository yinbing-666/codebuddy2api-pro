# CodeBuddy2API Pro

**CodeBuddy / WorkBuddy → OpenAI & Anthropic compatible gateway, hardened for production.**

CodeBuddy2API Pro is a self-hosted gateway that turns your CodeBuddy / WorkBuddy account into OpenAI-compatible and Anthropic-compatible APIs for Codex, Claude Code, and standard SDK clients — with production hardening you won't find upstream:

- 🛡️ **Anti-ban payload sanitization** — strips Claude Code / Codex fingerprint sentences and `x-anthropic-billing-header` / `cc_*` key-value segments that trip upstream's exact-match blacklist (HTTP 400 `11128 Illegal API invocation`). Verified: agentic requests that used to 400 now pass.
- 🧼 **`developer` role normalization** — upstream only accepts `system`; `developer` messages are normalized automatically.
- 🔧 **`tool_choice` normalization** — upstream only accepts string `tool_choice`; object forms (`{"type":"auto"}` etc.) are converted or stripped to avoid HTTP 400 `11101`.
- 🔍 **Model discovery UA fix** — upstream's model-discovery request omits the User-Agent header and gets rejected by `/v3/config`, so new upstream models never appear. Fixed here.
- 🌐 **Generic outbound proxy support** — route all upstream traffic through **any** HTTP proxy via standard `HTTPS_PROXY`/`HTTP_PROXY` env vars (Webshare, Bright Data, your own exit node, whatever). No vendor lock-in.
- 🔄 **Multi-protocol API** — OpenAI Chat Completions, OpenAI Responses, Anthropic Messages under `/v1`.
- 👥 **Multi-account pool** — manage many CodeBuddy/WorkBuddy credentials behind one gateway with round-robin rotation and per-account usage tracking.
- 🖥️ **Web admin console** — credentials, access keys, usage, account status, debug traces, runtime settings.

Based on [orangeboyChen/codebuddy2api](https://github.com/orangeboyChen/codebuddy2api) (MIT) with production hardening from real-world operation.

## Quick Start

Build and run from source:

```bash
docker build -t codebuddy2api-pro .
docker run -d \
  --name codebuddy2api-pro \
  --restart unless-stopped \
  -p 8001:8001 \
  -v codebuddy2api-data:/app/.codebuddy_data \
  -e CODEBUDDY_STORAGE_BACKEND=sqlite \
  -e CODEBUDDY_STORAGE_ENCRYPTION_KEY='replace-with-a-long-random-secret' \
  -e CODEBUDDY_INTERNET_ENVIRONMENT=public \
  codebuddy2api-pro
```

Open `http://127.0.0.1:8001/dashboard`, complete CodeBuddy authentication or add a credential manually, then create an access key for your clients.

Or use docker compose (recommended):

```bash
cp .env.example .env    # fill in your values
docker compose -f deploy/docker-compose.yml up -d --build
```

## Using an outbound proxy (anti-ban / region routing)

Bun's native fetch honors standard proxy env vars — **any HTTP proxy works**, credentials optional:

```yaml
environment:
  HTTPS_PROXY: 'http://user:pass@proxy.example.com:8080'
  HTTP_PROXY: 'http://user:pass@proxy.example.com:8080'
```

- Use a **fixed proxy IP** per account to avoid "unusual login location" flags.
- Prefer residential/datacenter proxies close to the target region.
- Omit these vars entirely if you connect directly.

## API Compatibility

Endpoints under `/v1`:

- `POST /v1/chat/completions` — OpenAI Chat Completions
- `POST /v1/responses` — OpenAI Responses
- `POST /v1/messages` — Anthropic Messages
- `GET /v1/models` — models available to the requesting access key

Authenticate with either `Authorization: Bearer <access-key>` or `x-api-key: <access-key>`.

## Storage

- `file` — zero-configuration storage for a single instance
- `sqlite` — encrypted SQLite storage for a single instance
- `pg` — PostgreSQL storage for multiple instances

Database backends require `CODEBUDDY_STORAGE_ENCRYPTION_KEY`. Set `DATABASE_URL` for PostgreSQL or `CODEBUDDY_STORAGE_SQLITE_PATH` for SQLite.

## Known pitfalls (learned the hard way)

- `400 11128 first message is not system prompt` — upstream blacklists fixed agent template sentences. This build sanitizes them automatically; you should NOT need to strip system prompts yourself.
- `400 11133 parameters rejected` — keep `max_tokens` reasonable (e.g. 100+); tiny values get rejected.
- `400 11101` — `tool_choice` must be a string; this build normalizes it.
- New upstream models invisible to `/v1/models` — upstream model discovery was missing the User-Agent; fixed here. Run the dashboard "check" button after upstream adds models.

## Documentation

See upstream docs: https://orangeboychen.github.io/codebuddy2api/

## License

MIT — see [LICENSE](./LICENSE). Upstream: [orangeboyChen/codebuddy2api](https://github.com/orangeboyChen/codebuddy2api).

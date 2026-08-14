# GSA Brasil Hub API

To install dependencies:

```bash
bun install
```

To start the REST API in development:

```bash
bun run dev
```

The REST API uses `PORT` (default `3001`). Forum discussions are loaded through regular HTTP requests, so new posts appear when the page is opened or manually refreshed.

## Automatic forum moderator

Every forum includes the non-loginable **MiMo Guard** moderator. Configure `MIMO_API_URL`, `MIMO_API_KEY` and optionally `MIMO_MODEL` in `.env` to enable content review with `mimo-v2.5-pro`. Without the API key, the bot remains visible but takes no automated action.

Clear profanity, credible threats and likely personal-data exposure are handled by a local high-confidence guard before a message is published. Other messages are classified asynchronously by MiMo through a validated JSON decision (`allow`, `delete`, `mute`, `remove` or `ban`), then the server applies the corresponding scoped action.

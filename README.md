# SecretChecker

A tiny app to experiment with Cloudflare Workers (API), Cloudflare Pages (UI), and Worker secrets.

- Frontend: React 19 + Vite + Tailwind CSS (single page)
- Backend: Cloudflare Worker (API-only)
- Secret storage: Cloudflare Worker secret `application_secret`

## Live

- UI: https://secretchecker.ciancode.com/
- API: https://secretchecker-api.ciancode.com/check_secret.json

\
[<img alt="Secretchecker" src="secretchecker-frontend/public/abc_grey.png" width="320" />](https://secretchecker.ciancode.com/)

## What it does

- The UI lets you enter a 2-character `secret_prefix`.
- The Worker exposes `POST /check_secret.json` that compares the prefix against a secure secret named `application_secret`.
  - If the secret starts with the provided prefix, it returns the full secret.
  - Otherwise it returns a 400 with an error.

### API contract

- Endpoint: `POST /check_secret.json`
- Request body:

```json
{ "secret_prefix": "ab" }
```

- Responses:
  - 200 OK
    ```json
    { "secret": "the_full_secret_value" }
    ```
  - 400 Bad Request (invalid format or incorrect prefix)
    ```json
    { "error": "Invalid prefix format" }
    ```
    or
    ```json
    { "error": "Incorrect prefix" }
    ```

## Local development

Run UI and API separately.

1. Worker API (local)

```
cd secretchecker-worker
# Provide a local secret for the Worker
# Create .dev.vars with:
# application_secret=YOUR_LOCAL_TEST_SECRET

wrangler dev --local
# API available at http://localhost:8787/check_secret.json
```

2. Frontend (Vite)

```
cd secretchecker-frontend
npm install
# Point the UI to the local API
# Create .env.local with:
# VITE_API_BASE=http://localhost:8787

npm run dev
# UI at http://localhost:5173
```

## Deploy

This project uses a split architecture: Pages for UI, Worker for API.

### Cloudflare Pages (UI)

- Root directory: `secretchecker/secretchecker-frontend`
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_BASE=https://secretchecker-api.ciancode.com`
- Node version: 20 or 24
- Custom domain: `secretchecker.ciancode.com`

### Cloudflare Worker (API)

- Route in `wrangler.toml`:
  - `secretchecker-api.ciancode.com/*` (zone `ciancode.com`)
- One-time secret setup:

```
cd secretchecker-worker
wrangler secret put application_secret
```

- Deploy manually:

```
wrangler deploy
```

- Or via CI (recommended): configure a GitHub Action with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to run `npx wrangler deploy` on pushes to `master` under `secretchecker/secretchecker-worker/**`.

## DNS

- UI (Pages): Create a CNAME record
  - Name: `secretchecker`
  - Target: your Pages project’s `.pages.dev` hostname (Pages will show the exact target)
  - Proxy: ON
- API (Worker): the Worker route binds `secretchecker-api.ciancode.com/*`. If Cloudflare requires a DNS record, add a proxied placeholder (e.g., A 192.0.2.1) or a CNAME; keep Proxy ON.

## Notes after migrating to Vite

- Build output changed from CRA’s `build/` to Vite’s `dist/`.
- Pages must be configured to use `dist` (see settings above).
- Environment variables changed from `REACT_APP_*` to `VITE_*`. The UI reads `import.meta.env.VITE_API_BASE`.
- Local UI dev server runs at `http://localhost:5173`.
- The Worker is now API-only with CORS allowing `https://secretchecker.ciancode.com`, `http://localhost:3000`, and `http://localhost:5173`.

## Tech highlights

- Cloudflare Workers for a simple, secure API
- Cloudflare Pages for fast static hosting and CI
- React 19 + Vite + Tailwind for a modern UI stack

This app was mainly built as an exercise to use Cloudflare Workers, a small UI, and secrets end-to-end.

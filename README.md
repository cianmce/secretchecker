# SecretChecker

A tiny app to experiment with Cloudflare Workers, a simple UI, and Worker secrets.

- Frontend: React + Tailwind CSS (single page)
- Backend: Cloudflare Worker serving static assets and an API route
- Secret storage: Cloudflare Worker secret `application_secret`

## Live

App is live at: [secretchecker.ciancode.com](https://secretchecker.ciancode.com/)

## What it does

- The UI lets you enter a 4-character `secret_prefix`.
- The Worker exposes `POST /check_secret.json` that compares the prefix against a secure secret named `application_secret`.
  - If the secret starts with the provided prefix, it returns the full secret.
  - Otherwise it returns a 400 with an error.

### API

- Endpoint: `POST /check_secret.json`
- Request body:

```json
{ "secret_prefix": "abcd" }
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

Two processes (frontend dev server + Worker), with automatic UI hot reload proxied via the Worker.

1. Frontend

```
cd secretchecker-frontend
npm install
npm start
```

2. Worker (local)

```
cd secretchecker-worker
# Provide a local secret for the Worker
# Create .dev.vars in this directory with:
# application_secret=YOUR_LOCAL_TEST_SECRET

npm run dev
```

- Open http://localhost:8787/ to use the app.
- `POST /check_secret.json` is handled by the Worker locally.
- The Worker proxies UI requests to the CRA dev server for instant HMR.

## Deploy

```
cd secretchecker-worker
# Set the production secret once (paste the value when prompted)
wrangler secret put application_secret

# Build the frontend and deploy the Worker
npm run ci-cd-build
```

Routing and static assets are configured via `wrangler.toml`:

- Assets binding serves `secretchecker-frontend/build` as the site.
- Custom domain route: `secretchecker.ciancode.com/*` (Cloudflare-managed DNS).

## Tech highlights

- Cloudflare Workers as the API and static hosting layer
- React + Tailwind CSS for a small, modern UI
- Cloudflare Worker secrets to keep `application_secret` off the client

This project was mainly built as an exercise to use Cloudflare Workers, a simple UI, and secrets end-to-end.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/check_secret.json" && request.method === "POST") {
      try {
        const body = await request.json();
        const prefix = body.secret_prefix || "";

        if (typeof prefix !== "string" || prefix.length !== 4) {
          return new Response(
            JSON.stringify({ error: "Invalid prefix format" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const secret = env.application_secret || env.APPLICATION_SECRET;
        if (!secret) {
          return new Response(
            JSON.stringify({ error: "Missing application_secret" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
        if (secret.startsWith(prefix)) {
          return new Response(JSON.stringify({ secret }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(
            JSON.stringify({ error: "Incorrect prefix" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "Invalid JSON" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // otherwise serve static React app (SPA-friendly)
    try {
      // In local dev, proxy to CRA dev server for instant HMR
      if (env.FRONTEND_DEV_SERVER) {
        const base = new URL(env.FRONTEND_DEV_SERVER);
        const incoming = new URL(request.url);
        const proxied = new URL(incoming.pathname + incoming.search, base);
        // Let CRA handle HTML fallback/routes
        return await fetch(new Request(proxied.toString(), request));
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }

      // SPA fallback: return index.html for unknown routes
      const url = new URL(request.url);
      if (request.method === "GET" && !url.pathname.startsWith("/check_secret")) {
        const indexUrl = new URL("/index.html", url.origin);
        return await env.ASSETS.fetch(new Request(indexUrl, request));
      }

      return new Response("Not found", { status: 404 });
    } catch (e) {
      return new Response("Not found: " + e, { status: 404 });
    }
  },
};

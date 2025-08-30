function buildCorsHeaders(origin) {
  const allowedOrigins = [
    "https://secretchecker.ciancode.com",
    "http://localhost:3000",
    "http://localhost:5173",
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : "";
  const base = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
  if (allowOrigin) base["Access-Control-Allow-Origin"] = allowOrigin;
  return base;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // Preflight
    if (url.pathname === "/check_secret.json" && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: buildCorsHeaders(origin) });
    }

    if (url.pathname === "/check_secret.json" && request.method === "POST") {
      try {
        const body = await request.json();
        const prefix = body.secret_prefix || "";

        if (typeof prefix !== "string" || prefix.length !== 4) {
          return new Response(
            JSON.stringify({ error: "Invalid prefix format" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json", ...buildCorsHeaders(origin) },
            }
          );
        }

        const secret = env.application_secret || env.APPLICATION_SECRET;
        if (!secret) {
          return new Response(
            JSON.stringify({ error: "Missing application_secret" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...buildCorsHeaders(origin) },
            }
          );
        }
        if (secret.startsWith(prefix)) {
          return new Response(JSON.stringify({ secret }), {
            headers: { "Content-Type": "application/json", ...buildCorsHeaders(origin) },
          });
        } else {
          return new Response(
            JSON.stringify({ error: "Incorrect prefix" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json", ...buildCorsHeaders(origin) },
            }
          );
        }
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "Invalid JSON" }),
          { status: 400, headers: { "Content-Type": "application/json", ...buildCorsHeaders(origin) } }
        );
      }
    }

    return new Response("Not found", { status: 404, headers: buildCorsHeaders(origin) });
  },
};

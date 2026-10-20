// VedSAAS frontend — Cloudflare Worker (2026-10-20)
//
// Ek pata: vedsaas.vedkuber.in
//   /api/*  → VedSAAS backend (API_ORIGIN, Cloudflare Tunnel se PC tak) — frontend ko sirf "/api" jaanna hai,
//             CORS nahi, backend ka asli pata user ko nahi dikhta
//   baaki   → website ke static pages (ASSETS)
// API_ORIGIN: wrangler.toml [vars] me.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      if (!env.API_ORIGIN) {
        return Response.json({ ok: false, error: "API_ORIGIN set nahi hai (wrangler.toml [vars])" }, { status: 503 });
      }
      const target = new URL(url.pathname + url.search, env.API_ORIGIN);
      const headers = new Headers(request.headers);
      headers.set("X-Forwarded-Host", url.host);
      headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));
      const init = {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      };
      try {
        return await fetch(target, init);
      } catch (e) {
        return Response.json(
          { ok: false, error: "VedSAAS backend tak nahi pahunch paaye (PC / Tunnel band?)", detail: String(e) },
          { status: 502 },
        );
      }
    }
    return env.ASSETS.fetch(request);
  },
};

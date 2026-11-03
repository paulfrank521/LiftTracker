import { getStore } from "@netlify/blobs";

const same = (a, b) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

export default async (req) => {
  const pass = Netlify.env.get("SYNC_PASSCODE");
  if (!pass) return new Response("SYNC_PASSCODE is not set", { status: 500 });
  if (!same(req.headers.get("x-passcode") || "", pass)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const store = getStore("liftlog");
  if (req.method === "GET") {
    return Response.json(await store.get("data", { type: "json" }));
  }
  if (req.method === "PUT") {
    const body = await req.text();
    if (body.length > 2000000) return new Response("Too large", { status: 413 });
    try { JSON.parse(body); } catch { return new Response("Bad JSON", { status: 400 }); }
    await store.set("data", body);
    return Response.json({ ok: true });
  }
  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/sync" };

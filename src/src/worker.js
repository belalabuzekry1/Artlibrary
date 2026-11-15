/* =========================================================
   ARTLIBRARY API WORKER
   Handles account endpoints under /api/. Everything else is
   served from the static assets binding (the existing site).
   Data lives in the D1 database bound as DB.
   ========================================================= */

const SESSION_COOKIE = "al_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const PBKDF2_ITERATIONS = 150000;
const MAX_LOGIN_FAILS = 5;
const LOGIN_LOCK_MINUTES = 15;
const MAX_REGISTERS_PER_HOUR = 8;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }
    try {
      return await handleApi(request, env, url);
    } catch (err) {
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  },
};

async function handleApi(request, env, url) {
  // Same-origin only: the site never calls cross-origin, and browsers
  // attach Sec-Fetch-Site on form/fetch posts.
  const sfs = request.headers.get("Sec-Fetch-Site");
  if (sfs && sfs !== "same-origin" && sfs !== "none") {
    return json({ error: "Forbidden" }, 403);
  }

  if (url.pathname === "/api/register" && request.method === "POST") return register(request, env);
  if (url.pathname === "/api/login" && request.method === "POST") return login(request, env);
  if (url.pathname === "/api/logout" && request.method === "POST") return logout(request, env);
  if (url.pathname === "/api/me" && request.method === "GET") return me(request, env);
  return json({ error: "Not found" }, 404);
}

/* ---------------- responses & input ---------------- */

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

async function readJson(request) {
  const ct = request.headers.get("Content-Type") || "";
  if (!ct.includes("application/json")) return null;
  const text = await request.text();
  if (text.length > 10000) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function validEmail(email) {
  return typeof email === "string" && email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanName(name) {
  if (typeof name !== "string") return null;
  const n = name.replace(/\s+/g, " ").trim();
  if (n.length < 2 || n.length > 60) return null;
  return n;
}

function slugify(name) {
  const s = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);
  return s || "artist";
}

/* ---------------- passwords (PBKDF2 via WebCrypto) ---------------- */

function toB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromB64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hashPassword(password, saltB64) {
  const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(bits)}`;
}

function timingSafeEqualB64(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyPassword(password, stored) {
  const parts = (stored || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const computed = await hashPassword(password, parts[2]);
  return timingSafeEqualB64(computed.split("$")[3], parts[3]);
}

/* ---------------- sessions ---------------- */

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toB64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

function clearedCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readSessionToken(request) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === SESSION_COOKIE) return rest.join("=");
  }
  return null;
}

async function getSessionUser(request, env) {
  const token = readSessionToken(request);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    "SELECT u.id, u.name, u.email, u.handle, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?"
  ).bind(tokenHash, now).first();
  return row || null;
}

async function createSession(env, userId) {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(tokenHash, userId, now.toISOString(), expires.toISOString()).run();
  return token;
}

/* ---------------- rate limiting ---------------- */

async function attemptRow(env, key) {
  return env.DB.prepare("SELECT fails, locked_until FROM login_attempts WHERE attempt_key = ?").bind(key).first();
}

async function isLocked(env, key) {
  const row = await attemptRow(env, key);
  if (!row || !row.locked_until) return false;
  return row.locked_until > new Date().toISOString();
}

async function recordFail(env, key, maxFails, lockMinutes) {
  const now = new Date().toISOString();
  const row = await attemptRow(env, key);
  const fails = (row ? row.fails : 0) + 1;
  const lockedUntil = fails >= maxFails
    ? new Date(Date.now() + lockMinutes * 60000).toISOString()
    : null;
  await env.DB.prepare(
    `INSERT INTO login_attempts (attempt_key, fails, locked_until, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(attempt_key) DO UPDATE SET fails = excluded.fails, locked_until = excluded.locked_until, updated_at = excluded.updated_at`
  ).bind(key, fails >= maxFails ? 0 : fails, lockedUntil, now).run();
}

async function clearFails(env, key) {
  await env.DB.prepare("DELETE FROM login_attempts WHERE attempt_key = ?").bind(key).run();
}

/* ---------------- endpoints ---------------- */

async function register(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipKey = "register:" + ip;
  if (await isLocked(env, ipKey)) {
    return json({ error: "Too many sign-ups from this connection. Please try again later." }, 429);
  }

  const body = await readJson(request);
  const name = body && cleanName(body.name);
  const email = body && typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  const password = body && typeof body.password === "string" ? body.password : null;

  if (!body || !name || !validEmail(email) || !password || password.length < 8 || password.length > 128) {
    return json({ error: "Please check your details: name (2-60 chars), a valid email, and a password of at least 8 characters." }, 400);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return json({ error: "An account with this email already exists. Try signing in instead." }, 409);
  }

  // Unique handle for the future public portfolio URL.
  let handle = slugify(name);
  for (let i = 2; await env.DB.prepare("SELECT id FROM users WHERE handle = ?").bind(handle).first(); i++) {
    handle = `${slugify(name)}-${i}`;
    if (i > 50) handle = `artist-${crypto.randomUUID().slice(0, 8)}`;
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  await env.DB.prepare(
    "INSERT INTO users (id, email, name, handle, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, email, name, handle, passwordHash, new Date().toISOString()).run();

  await recordFail(env, ipKey, MAX_REGISTERS_PER_HOUR, 60);

  const token = await createSession(env, id);
  return json({ ok: true, user: { name, email, handle } }, 201, { "Set-Cookie": sessionCookie(token) });
}

async function login(request, env) {
  const body = await readJson(request);
  const email = body && typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  const password = body && typeof body.password === "string" ? body.password : null;
  if (!body || !validEmail(email) || !password) {
    return json({ error: "Enter your email and password." }, 400);
  }

  const key = "login:" + email;
  if (await isLocked(env, key)) {
    return json({ error: `Too many failed attempts. Please wait ${LOGIN_LOCK_MINUTES} minutes and try again.` }, 429);
  }

  const user = await env.DB.prepare("SELECT id, name, email, handle, password_hash FROM users WHERE email = ?").bind(email).first();
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!ok) {
    await recordFail(env, key, MAX_LOGIN_FAILS, LOGIN_LOCK_MINUTES);
    return json({ error: "Wrong email or password." }, 401);
  }

  await clearFails(env, key);
  const token = await createSession(env, user.id);
  return json({ ok: true, user: { name: user.name, email: user.email, handle: user.handle } }, 200, { "Set-Cookie": sessionCookie(token) });
}

async function logout(request, env) {
  const token = readSessionToken(request);
  if (token) {
    const tokenHash = await sha256Hex(token);
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  }
  return json({ ok: true }, 200, { "Set-Cookie": clearedCookie() });
}

async function me(request, env) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: "Not signed in" }, 401);
  return json({
    user: {
      name: user.name,
      email: user.email,
      handle: user.handle,
      created_at: user.created_at,
    },
  });
}

/* =========================================================
   ARTLIBRARY API WORKER
   Handles account endpoints under /api/. Everything else is
   served from the static assets binding (the existing site).
   Data lives in the D1 database bound as DB.
   ========================================================= */

const SESSION_COOKIE = "al_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const PBKDF2_ITERATIONS = 100000; // Cloudflare Workers WebCrypto cap
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
  // Cross-site guard for mutating calls. Top-level GET navigations (the
  // Google OAuth redirect back to us) legitimately arrive as cross-site.
  const sfs = request.headers.get("Sec-Fetch-Site");
  if (request.method !== "GET" && sfs && sfs !== "same-origin" && sfs !== "none") {
    return json({ error: "Forbidden" }, 403);
  }

  if (url.pathname === "/api/auth/google" && request.method === "GET") return googleStart(request, env);
  if (url.pathname === "/api/auth/google/callback" && request.method === "GET") return googleCallback(request, env);
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

const RESERVED_USERNAMES = new Set([
  "www", "api", "admin", "about", "contact", "login", "register",
  "account", "art", "how-to-use", "explore",
]);

function cleanUsername(username) {
  if (typeof username !== "string") return null;
  const value = username.trim().toLowerCase();
  if (value.length < 3 || value.length > 24 || !/^[a-z0-9_-]+$/.test(value)) return null;
  if (RESERVED_USERNAMES.has(value)) return null;
  return value;
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

async function hashPassword(password, saltB64, iterations = PBKDF2_ITERATIONS) {
  const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return `pbkdf2$${iterations}$${toB64(salt)}$${toB64(bits)}`;
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
  const iterations = parseInt(parts[1], 10);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 100000) return false;
  const computed = await hashPassword(password, parts[2], iterations);
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

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

function readSessionToken(request) {
  return readCookie(request, SESSION_COOKIE);
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
  const username = body && cleanUsername(body.username);
  const email = body && typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  const password = body && typeof body.password === "string" ? body.password : null;

  if (!body || !name || !username || !validEmail(email) || !password || password.length < 8 || password.length > 128) {
    return json({ error: "Please check your details: name (2-60 characters), username (3-24 letters, numbers, underscores, or hyphens; reserved names are not allowed), a valid email, and a password of at least 8 characters." }, 400);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return json({ error: "An account with this email already exists. Try signing in instead." }, 409);
  }

  // Handles are the future portfolio URLs. Compare case-insensitively; the
  // database also has a unique index on lower(handle) to close race conditions.
  const existingHandle = await env.DB.prepare("SELECT id FROM users WHERE lower(handle) = ?").bind(username).first();
  if (existingHandle) {
    return json({ error: "That username is already taken. Please choose another." }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  try {
    await env.DB.prepare(
      "INSERT INTO users (id, email, name, handle, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, email, name, username, passwordHash, new Date().toISOString()).run();
  } catch (err) {
    // A concurrent sign-up may win after the check above. Keep the public
    // response clear without exposing SQL errors.
    const taken = await env.DB.prepare("SELECT id FROM users WHERE lower(handle) = ?").bind(username).first();
    if (taken) return json({ error: "That username is already taken. Please choose another." }, 409);
    throw err;
  }
  const handle = username;

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

  const user = await env.DB.prepare("SELECT id, name, email, handle, password_hash, google_sub FROM users WHERE email = ?").bind(email).first();
  if (user && user.google_sub && (!user.password_hash || user.password_hash.startsWith("oauth$"))) {
    return json({ error: "This account was created with Google. Use Continue with Google to sign in." }, 400);
  }
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!ok) {
    await recordFail(env, key, MAX_LOGIN_FAILS, LOGIN_LOCK_MINUTES);
    return json({ error: "Wrong email or password." }, 401);
  }

  await clearFails(env, key);
  const token = await createSession(env, user.id);
  return json({ ok: true, user: { name: user.name, email: user.email, handle: user.handle } }, 200, { "Set-Cookie": sessionCookie(token) });
}

/* ---------------- Google sign-in ---------------- */

const GOOGLE_STATE_COOKIE = "al_gstate";
const GOOGLE_NONCE_COOKIE = "al_gnonce";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_FLOW_SECONDS = 10 * 60;
const OAUTH_ONLY_PASSWORD = "oauth$google"; // sentinel: no usable password

function oauthCookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function redirectWithCookies(location, cookies = []) {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const c of cookies) headers.append("Set-Cookie", c);
  return new Response(null, { status: 302, headers });
}

function googleFail() {
  return redirectWithCookies("/login.html?error=google", [
    oauthCookie(GOOGLE_STATE_COOKIE, "", 0),
    oauthCookie(GOOGLE_NONCE_COOKIE, "", 0),
  ]);
}

async function googleStart(request, env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return googleFail();
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const key = "google:" + ip;
  if (await isLocked(env, key)) return googleFail();
  await recordFail(env, key, 30, 60); // soft per-IP throttle on flow starts

  const state = randomToken();
  const nonce = randomToken();
  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: origin + "/api/auth/google/callback",
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    prompt: "select_account",
  });
  return redirectWithCookies(`${GOOGLE_AUTH_URL}?${params.toString()}`, [
    oauthCookie(GOOGLE_STATE_COOKIE, state, GOOGLE_FLOW_SECONDS),
    oauthCookie(GOOGLE_NONCE_COOKIE, nonce, GOOGLE_FLOW_SECONDS),
  ]);
}

// Google rotates its signing keys; keep a short-lived cache per isolate.
let googleKeysCache = { keys: [], fetchedAt: 0 };

async function googleSigningKey(kid) {
  async function refresh() {
    const res = await fetch(GOOGLE_JWKS_URL);
    if (!res.ok) return false;
    const body = await res.json();
    googleKeysCache = { keys: body.keys || [], fetchedAt: Date.now() };
    return true;
  }
  if (Date.now() - googleKeysCache.fetchedAt > 6 * 60 * 60 * 1000) {
    if (!(await refresh())) return null;
  }
  let jwk = googleKeysCache.keys.find((k) => k.kid === kid);
  if (!jwk && (await refresh())) {
    jwk = googleKeysCache.keys.find((k) => k.kid === kid);
  }
  return jwk || null;
}

function fromB64Url(text) {
  return fromB64(text.replaceAll("-", "+").replaceAll("_", "/"));
}

async function verifyGoogleIdToken(idToken, env, expectedNonce) {
  const parts = (idToken || "").split(".");
  if (parts.length !== 3) return null;
  let header, payload;
  try {
    header = JSON.parse(new TextDecoder().decode(fromB64Url(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(fromB64Url(parts[1])));
  } catch (e) {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;
  const jwk = await googleSigningKey(header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, fromB64Url(parts[2]),
    new TextEncoder().encode(parts[0] + "." + parts[1])
  );
  if (!valid) return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < now - 30) return null;
  if (typeof payload.iat !== "number" || payload.iat > now + 300) return null;
  if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") return null;
  if (payload.aud !== env.GOOGLE_CLIENT_ID) return null;
  if (expectedNonce && payload.nonce !== expectedNonce) return null;
  return payload;
}

async function exchangeGoogleCode(code, env, origin) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: origin + "/api/auth/google/callback",
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!res.ok) return null;
  return res.json();
}

// Usernames come from the email local part, shaped to the site rules.
function handleFromEmail(email) {
  const local = (email.split("@")[0] || "").toLowerCase();
  let base = local.replace(/[^a-z0-9_-]+/g, "-").replace(/-{2,}/g, "-").replace(/^[-_]+|[-_]+$/g, "");
  if (base.length > 24) base = base.slice(0, 24).replace(/[-_]+$/g, "");
  if (base.length < 3) base = base + "-member";
  if (RESERVED_USERNAMES.has(base)) base = base + "-user";
  return base;
}

async function uniqueHandle(env, email) {
  const base = handleFromEmail(email);
  for (let i = 0; i <= 100; i++) {
    const candidate = i === 0 ? base : base.slice(0, 24 - String(i + 1).length) + (i + 1);
    const taken = await env.DB.prepare("SELECT id FROM users WHERE lower(handle) = ?").bind(candidate).first();
    if (!taken) return candidate;
  }
  return base.slice(0, 15) + "-" + crypto.randomUUID().slice(0, 8);
}

async function googleCallback(request, env) {
  const url = new URL(request.url);
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return googleFail();
  if (url.searchParams.get("error")) return googleFail();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = readCookie(request, GOOGLE_STATE_COOKIE);
  const cookieNonce = readCookie(request, GOOGLE_NONCE_COOKIE);
  if (!code || !state || !cookieState || cookieState !== state) return googleFail();

  const tokenData = await exchangeGoogleCode(code, env, url.origin);
  if (!tokenData || !tokenData.id_token) return googleFail();
  const payload = await verifyGoogleIdToken(tokenData.id_token, env, cookieNonce);
  if (!payload || !payload.sub) return googleFail();
  if (payload.email_verified !== true || !validEmail(payload.email)) return googleFail();

  const email = payload.email.trim().toLowerCase();
  let user = await env.DB.prepare("SELECT id, name, email, handle, google_sub FROM users WHERE email = ?").bind(email).first();
  if (!user) {
    user = await env.DB.prepare("SELECT id, name, email, handle, google_sub FROM users WHERE google_sub = ?").bind(payload.sub).first();
  }

  let userId, handle;
  if (user) {
    userId = user.id;
    handle = user.handle;
    if (!user.google_sub) {
      // Google has verified ownership of this email, so linking is safe.
      await env.DB.prepare("UPDATE users SET google_sub = ? WHERE id = ?").bind(payload.sub, userId).run();
    }
  } else {
    userId = crypto.randomUUID();
    handle = await uniqueHandle(env, email);
    const name = cleanName(payload.name) || handle;
    try {
      await env.DB.prepare(
        "INSERT INTO users (id, email, name, handle, password_hash, google_sub, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(userId, email, name, handle, OAUTH_ONLY_PASSWORD, payload.sub, new Date().toISOString()).run();
    } catch (err) {
      // A concurrent sign-up won the email or handle race; use that account.
      const existing = await env.DB.prepare("SELECT id, handle FROM users WHERE email = ?").bind(email).first();
      if (!existing) return googleFail();
      userId = existing.id;
      handle = existing.handle;
    }
  }

  const token = await createSession(env, userId);
  return redirectWithCookies("/account.html", [
    sessionCookie(token),
    oauthCookie(GOOGLE_STATE_COOKIE, "", 0),
    oauthCookie(GOOGLE_NONCE_COOKIE, "", 0),
  ]);
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

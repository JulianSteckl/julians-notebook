// Vercel serverless proxy for Canvas LMS API.
// Forwards requests to the school's Canvas instance, adding the user's
// Bearer token. This exists only to avoid browser CORS restrictions —
// no tokens are stored server-side; they arrive per-request from the client.

const ALLOWED_PATH_PATTERNS = [
  /^\/courses(\?.*)?$/,
  /^\/courses\/\d+\/assignments(\?.*)?$/,
  /^\/courses\/\d+\/enrollments(\?.*)?$/,
  /^\/users\/self\/profile(\?.*)?$/,
  /^\/users\/self\/upcoming_events(\?.*)?$/,
];

function isAllowedPath(path) {
  const bare = path.split("?")[0];
  return ALLOWED_PATH_PATTERNS.some((re) => re.test(bare));
}

function isValidDomain(domain) {
  // Must be a valid hostname with at least one dot, no slashes or spaces
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]{1,200}\.[a-zA-Z]{2,}$/.test(domain) &&
         !domain.includes("/");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { domain, token, path } = req.query;

  if (!domain || !token || !path) {
    return res.status(400).json({ error: "Missing domain, token, or path" });
  }
  if (!isValidDomain(domain)) {
    return res.status(400).json({ error: "Invalid Canvas domain" });
  }
  if (!isAllowedPath(path)) {
    return res.status(400).json({ error: "Path not allowed" });
  }

  const url = `https://${domain}/api/v1${path.startsWith("/") ? path : "/" + path}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: "Canvas unreachable", detail: err.message });
  }
}

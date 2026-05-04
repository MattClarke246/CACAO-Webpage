const { Resend } = require("resend");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server-side rate limiting (per IP, per 60 seconds)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 3; // max 3 submissions per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  record.count++;
  if (record.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Strip HTML tags to prevent injection in emails
function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, "");
}

function parseBody(req) {
  if (!req || !req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_err) {
      return {};
    }
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Reject oversized payloads (> 10 KB)
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > 10240) {
    return res.status(413).json({ error: "Payload too large." });
  }

  // Server-side rate limiting
  const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many submissions. Please wait a minute." });
  }

  const body = parseBody(req);

  // Honeypot check (bots fill this hidden field)
  if (body.website_url) {
    // Silently reject — don't reveal to bots
    return res.status(200).json({ ok: true });
  }

  const name = stripHtml(String(body.name || "").trim()).slice(0, 100);
  const email = stripHtml(String(body.email || "").trim()).slice(0, 254);
  const subject = stripHtml(String(body.subject || "").trim()).slice(0, 200);
  const message = stripHtml(String(body.message || "").trim()).slice(0, 2000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service is not configured." });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
  const toEmail = "cacaoonline@gmail.com";
  const submittedAt = new Date().toISOString();

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[CACAO Contact] ${subject || "New message"}`,
      text: [
        "New contact form submission from cacao site",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Submitted: ${submittedAt}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend send failed:", err);
    return res.status(500).json({ error: "Unable to send message at the moment." });
  }
};

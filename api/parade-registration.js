const { Resend } = require("resend");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-()+.]{7,20}$/;

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
  const firstName = stripHtml(String(body.firstName || "").trim()).slice(0, 50);
  const lastName = stripHtml(String(body.lastName || "").trim()).slice(0, 50);
  const email = stripHtml(String(body.email || "").trim()).slice(0, 254);
  const phone = stripHtml(String(body.phone || "").trim()).slice(0, 20);
  const registrationType = stripHtml(String(body.registrationType || "").trim());
  const orgName = stripHtml(String(body.orgName || "").trim()).slice(0, 100);
  const groupSize = stripHtml(String(body.groupSize || "").trim()).slice(0, 5);

  // Validation
  if (!firstName || !lastName || !email || !phone || !registrationType) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  if (!PHONE_REGEX.test(phone)) {
    return res.status(400).json({ error: "Please provide a valid phone number." });
  }

  if (!["individual", "group"].includes(registrationType)) {
    return res.status(400).json({ error: "Registration type must be individual or group." });
  }

  if (registrationType === "group" && !orgName) {
    return res.status(400).json({ error: "Organization name is required for group registration." });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service is not configured." });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
  const toEmail = "cacaoonline@gmail.com";
  const submittedAt = new Date().toISOString();

  const isGroup = registrationType === "group";
  const typeLabel = isGroup ? "Group / Band" : "Individual";

  const lines = [
    "🎭 NEW PARADE REGISTRATION",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Type:         ${typeLabel}`,
    `Name:         ${firstName} ${lastName}`,
    `Email:        ${email}`,
    `Phone:        ${phone}`,
  ];

  if (isGroup) {
    lines.push(`Organization: ${orgName}`);
    lines.push(`Group Size:   ${groupSize || "Not specified"}`);
  }

  lines.push("");
  lines.push(`Submitted:    ${submittedAt}`);
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("This registration was submitted from the CACAO festival page.");
  lines.push("The registrant has been informed that payment is via Cash App or Venmo (@alcaribbean).");

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[CACAO Parade] ${typeLabel} Registration — ${firstName} ${lastName}`,
      text: lines.join("\n"),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend send failed:", err);
    return res.status(500).json({ error: "Unable to send registration at the moment." });
  }
};

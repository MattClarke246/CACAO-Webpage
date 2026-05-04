const { Resend } = require("resend");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-()+.]{7,20}$/;

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

  const body = parseBody(req);
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const registrationType = String(body.registrationType || "").trim();
  const orgName = String(body.orgName || "").trim();
  const groupSize = String(body.groupSize || "").trim();

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

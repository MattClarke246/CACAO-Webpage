# 📜 gemini.md — Project Constitution
> **This file is law.** Update only when a schema changes, a rule is added, or architecture is modified.

---

## 🏝️ Project Identity
- **Project Name:** CACAO Web Project
- **Full Name:** Central Alabama Caribbean American Organizations
- **Theme:** Caribbean-themed Association & Scholarship Website
- **Status:** 🟢 COMPLETED — Phase 4 Stylized, active on Vercel. Awaiting Phase 5 Google integrations by operators.
- **Hosting:** GitHub → Vercel (auto-deploy on push)
- **Domain:** https://cacao-webpage.vercel.app/

---

## 📐 Data Schema
> **[CONFIRMED]** — Locked after Discovery Q&A 2026-04-05

### Page Sections
```json
{
  "hero": {
    "backgroundImage": "string (local asset — adjusted reference image)",
    "headline": "string (e.g. 'Celebrating Caribbean Culture & Community')",
    "subheadline": "string (e.g. 'Raising Scholarships for Caribbean American Students')",
    "ctaLabel": "string (e.g. 'Donate / Learn More')",
    "ctaHref": "string (anchor or external link)"
  },
  "about": {
    "text": "string",
    "missionStatement": "string",
    "photos": ["string (image paths)"]
  },
  "scholarships": {
    "headline": "string",
    "description": "string",
    "applyFormUrl": "string (Google Form embed URL)",
    "donateUrl": "string"
  },
  "events": [
    {
      "title": "string",
      "date": "string",
      "description": "string",
      "imageUrl": "string"
    }
  ],
  "gallery": [
    { "imageUrl": "string", "caption": "string" }
  ],
  "contact": {
    "googleFormUrl": "string (embedded contact form)",
    "email": "string",
    "socialLinks": {}
  },
  "footer": {
    "copyrightText": "string",
    "links": []
  }
}
```

### Integration Schema
```json
{
  "googleForms": {
    "scholarshipApplication": "string (embed URL)",
    "contactForm": "string (embed URL)",
    "donationInterest": "string (embed URL)"
  },
  "googleSheets": {
    "eventsSheet": "string (published CSV URL — for dynamic events)",
    "membersSheet": "string (optional)"
  }
}
```

---

## 📏 Architectural Invariants
> Rules that MUST NEVER be broken.

- **No backend server.** All dynamic data flows through Google Forms/Sheets embeds or external APIs.
- **Static HTML/CSS/JS only.** Deployed to Vercel as a static site from GitHub.
- **Google Forms are embedded via `<iframe>`, EXCEPT Contact Form.** The user requested a clean HTML Q&A form for contact, to be hooked up to a database later.
- **All images live in `/assets/images/`.** No external image CDNs unless explicitly approved.
- **Mobile-first breakpoints.** All components must be responsive (375px → 1440px).
- **Accessibility baseline.** All images have `alt` text. Font size minimum 16px body.
- **CACAO is always written in ALL CAPS** in headings and brand contexts.

---

## 🔧 Behavioral Rules

- **Tone:** Warm, welcoming, family-friendly. Never corporate or cold.
- **Audience:** Caribbean American community + Central Alabama locals. Operated by older volunteers → keep admin workflows dead simple.
- **Culture:** Rich Caribbean imagery, colors (tropical greens, warm golds, ocean blues, sunset oranges). Avoid stereotypes.
- **Scholarship First:** Every page should have a visible path to the scholarship donation/apply CTA.
- **Photo-centric:** Gallery and cultural memory sections are first-class, not afterthoughts.
- **No paywalls, no logins.** The site is fully public.
- **DO NOT** use complex CMS platforms (WordPress, Webflow, etc.) — plain HTML/CSS/JS only.
- **DO NOT** use stock photos as hero/primary images — use provided real photos where possible.

---

## 🗂️ Maintenance Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-04-05 | File initialized | Protocol 0 startup |
| 2026-04-05 | Data Schema confirmed, Behavioral Rules & Invariants locked | Discovery Q&A complete |
| 2026-04-05 | Repository created & Vercel linked | Phase 2 Link completed |
| 2026-04-05 | Phase 3 & 4 Completed | V6 Hero image locked in, CSS Overhauled, pushed to Production |

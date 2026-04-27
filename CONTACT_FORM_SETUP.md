# Contact Form Email Setup (Resend)

The contact form uses `POST /api/contact` and sends to `cacaoonline@gmail.com` via Resend.

## Required environment variables

- `RESEND_API_KEY` (required)
- `CONTACT_FROM_EMAIL` (optional; defaults to `onboarding@resend.dev`)

## Vercel setup

1. In Vercel Project Settings -> Environment Variables, add:
   - `RESEND_API_KEY`
   - `CONTACT_FROM_EMAIL` (recommended, from your verified sending domain)
2. Redeploy the project.

## Local testing

1. Start local static server:
   - `python3 -m http.server 8080`
2. In another shell, run Vercel dev so `/api/contact` works locally:
   - `vercel dev`
3. Open the local URL shown by `vercel dev` and submit the form.

## Notes

- Keep `type="email"` and client regex validation in the form; server validates again.
- If email fails in production, check Vercel Function logs for `/api/contact`.

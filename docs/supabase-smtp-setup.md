# Supabase Auth SMTP Setup

Supabase's built-in email sender is not suitable for production. Configure a custom SMTP provider before relying on password reset, confirmation, magic link, or invite emails.

## Recommended Provider

Use Resend for this project, because the app already uses the `resend` package for transactional email routes.

## Values To Enter In Supabase

Open:

```text
Supabase Dashboard > Authentication > Emails > SMTP Settings
```

Enable custom SMTP and enter:

```text
Sender email: no-reply@g-rgabriellaromeo.it
Sender name: G-R Gabriella Romeo
SMTP host: smtp.resend.com
SMTP port: 587
SMTP username: resend
SMTP password: your Resend API key
Minimum interval between emails: keep Supabase default unless production volume requires more
```

If using another provider, use that provider's SMTP host, port, username, and password instead.

## Required DNS

Before production use, verify the sending domain in the provider dashboard and add all DNS records it gives you:

```text
SPF
DKIM
DMARC
Return-Path / bounce records if provided
```

Do not use a personal Gmail/Hotmail sender for production auth emails.

## Security Notes

- Do not expose recovery links from a public API.
- Password reset must send a link only to the mailbox owner.
- Keep Auth emails separate from marketing emails when possible.
- Add CAPTCHA/rate limiting before enabling high-volume public signup.

## Related Env

The app's own transactional routes use:

```env
RESEND_API_KEY=
```

Supabase Auth SMTP is configured in Supabase, not from `.env.local`.

/**
 * Email adapter (INT-6). Resend HTTP API when RESEND_API_KEY is set;
 * console output otherwise (dev/CI). Templates are localised upstream (MSG-8).
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export async function sendEmail(mail: OutgoingEmail): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:console] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return { delivered: false };
  }
  const domain = process.env.RESEND_EMAIL_DOMAIN;
  const from =
    process.env.EMAIL_FROM ??
    (domain ? `bookings@${domain}` : "no-reply@example.com");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      reply_to: mail.replyTo,
    }),
  });
  return { delivered: response.ok };
}

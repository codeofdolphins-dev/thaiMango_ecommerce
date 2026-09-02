import nodemailer from "nodemailer";

/**
 * Sends the password-reset email. SMTP comes from env (SMTP_HOST, SMTP_PORT,
 * SMTP_USER, SMTP_PASS, optional SMTP_FROM); when it isn't configured — the
 * usual case in local dev — the link is logged to the server console instead
 * so the flow stays fully testable.
 */
export async function sendPasswordResetEmail(to: string, link: string) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.log(
            `[mailer] SMTP not configured — password reset link for ${to}:\n${link}`
        );
        return;
    }

    const port = Number(SMTP_PORT) || 587;
    const transport = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transport.sendMail({
        from: SMTP_FROM || SMTP_USER,
        to,
        subject: "Reset your Bangkok Mango password",
        text: `We received a request to reset your password.\n\nOpen this link to choose a new one (valid for 30 minutes):\n${link}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #24211E;">
                <h2 style="letter-spacing: 0.05em;">BANGKOK MANGO</h2>
                <p>We received a request to reset your password.</p>
                <p>
                    <a href="${link}" style="display: inline-block; padding: 12px 28px; background: #52091E; color: #F7F4EE; text-decoration: none; border-radius: 999px;">
                        Choose a new password
                    </a>
                </p>
                <p style="font-size: 13px; color: #756F68;">
                    The link is valid for 30 minutes. If you didn't request this,
                    you can safely ignore this email.
                </p>
            </div>
        `,
    });
}

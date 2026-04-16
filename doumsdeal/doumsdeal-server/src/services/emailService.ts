import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT ?? '587'),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export async function sendNewMessageEmail(opts: {
    toEmail: string;
    toUsername: string;
    fromUsername: string;
    adTitle: string;
    preview: string;
    conversationId: number;
}): Promise<void> {
    if (!process.env.MAIL_USER || process.env.MAIL_USER === 'ton_email@gmail.com') return;

    const link = `${process.env.FRONTEND_URL}/messages/${opts.conversationId}`;

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: opts.toEmail,
            subject: `Nouveau message de ${opts.fromUsername} — DoumsDeal`,
            html: `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f5f4ff;border-radius:12px;">
                    <h2 style="color:#2563eb;margin-bottom:8px;">✉ Nouveau message</h2>
                    <p>Bonjour <strong>${opts.toUsername}</strong>,</p>
                    <p><strong>${opts.fromUsername}</strong> vous a envoyé un message concernant l'annonce <strong>${opts.adTitle}</strong> :</p>
                    <blockquote style="border-left:3px solid #7c3aed;padding:10px 16px;background:#fff;border-radius:6px;color:#374151;">
                        ${opts.preview.slice(0, 200)}${opts.preview.length > 200 ? '...' : ''}
                    </blockquote>
                    <a href="${link}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                        Répondre
                    </a>
                    <p style="margin-top:24px;font-size:12px;color:#9ca3af;">DoumsDeal — La marketplace des étudiants</p>
                </div>
            `,
        });
    } catch {
        // Ne jamais bloquer l'envoi de message si l'email échoue
    }
}

import nodemailer from 'nodemailer';

let transporter = null;

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

/**
 * Envoie un email. Si SMTP n'est pas configuré → log console (dev) et retourne false.
 * @returns {{ sent: boolean, preview?: string }}
 */
export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'EduManage <noreply@edumanage.local>';
  const transport = getTransporter();

  if (!transport) {
    console.log(`[EMAIL DEV] À: ${to}`);
    console.log(`[EMAIL DEV] Sujet: ${subject}`);
    console.log(`[EMAIL DEV] ${text}`);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
  });

  return { sent: true };
}

export function buildResponsableCredentialsEmail({ firstName, email, temporaryPassword }) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = `${frontendUrl}/login`;

  const subject = 'Vos identifiants EduManage — espace responsable';
  const text = `Bonjour ${firstName},

Votre compte responsable a été créé sur EduManage.

Email : ${email}
Mot de passe temporaire : ${temporaryPassword}

Connectez-vous ici : ${loginUrl}

Vous devrez changer votre mot de passe à la première connexion.

Cordialement,
L'équipe EduManage`;

  return { subject, text };
}

export function buildStudentCredentialsEmail({ firstName, email, temporaryPassword }) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = `${frontendUrl}/login`;

  const subject = 'Vos identifiants EduManage — espace étudiant';
  const text = `Bonjour ${firstName},

Votre compte étudiant a été créé sur EduManage.

Email : ${email}
Mot de passe temporaire : ${temporaryPassword}

Connectez-vous ici : ${loginUrl}

Vous devrez changer votre mot de passe à la première connexion.

Cordialement,
L'équipe EduManage`;

  return { subject, text };
}

export function buildApplicationDecisionEmail({ firstName, offerSubject, accepted }) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const candidaturesUrl = `${frontendUrl}/etudiant/candidatures`;

  if (accepted) {
    return {
      subject: `Candidature acceptée — ${offerSubject}`,
      text: `Bonjour ${firstName},

Bonne nouvelle : votre candidature pour l'offre « ${offerSubject} » a été acceptée.

Connectez-vous à votre espace étudiant pour consulter le détail :
${candidaturesUrl}

Cordialement,
L'équipe EduManage`,
    };
  }

  return {
    subject: `Candidature refusée — ${offerSubject}`,
    text: `Bonjour ${firstName},

Votre candidature pour l'offre « ${offerSubject} » n'a pas été retenue.

Vous pouvez consulter d'autres offres sur votre espace étudiant :
${candidaturesUrl}

Cordialement,
L'équipe EduManage`,
  };
}

export { isSmtpConfigured };

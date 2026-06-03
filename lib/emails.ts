import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "Wslni.ma <onboarding@resend.dev>"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wslni.ma"

/** Wraps HTML content in the standard Wslni email chrome (logo header, footer). */
function emailLayout(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${previewText}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#F3F4F6;">${previewText}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo Header -->
          <tr>
            <td style="background-color:#DC2626;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <span style="font-size:30px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">Wslni.ma</span>
              </a>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px 40px 32px;border-radius:0;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#FFFFFF;border-top:1px solid #F0F0F0;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;line-height:1.5;">
                © ${new Date().getFullYear()} Wslni.ma — La marketplace des freelances marocains
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.5;">
                Vous recevez cet e-mail car vous avez un compte sur
                <a href="${SITE_URL}" style="color:#DC2626;text-decoration:none;">Wslni.ma</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Renders an inline red CTA button linking to href. */
function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:#DC2626;color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.1px;margin-top:8px;">${label}</a>`
}

/** Renders a bordered info card with labelled key-value rows. */
function infoCard(rows: Array<{ label: string; value: string; valueStyle?: string }>): string {
  const rowsHtml = rows
    .map(
      (r, i) => `
    <tr>
      <td style="padding:${i === 0 ? "0" : "12px"} 0 ${i === rows.length - 1 ? "0" : "12px"};${i > 0 ? "border-top:1px solid #F3F4F6;" : ""}">
        <p style="margin:0 0 3px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.8px;">${r.label}</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;${r.valueStyle ?? ""}">${r.value}</p>
      </td>
    </tr>`
    )
    .join("")

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:20px 24px;margin:20px 0 28px;">
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rowsHtml}
      </table>
    </td></tr>
  </table>`
}

// ─── 1. Welcome Email ─────────────────────────────────────────────────────────

/** Sends the welcome email to a newly registered user. */
export async function sendWelcomeEmail(email: string, fullName: string) {
  const firstName = fullName.trim().split(" ")[0]

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">
      Bienvenue sur Wslni.ma, ${firstName} !
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#4B5563;line-height:1.7;">
      Nous sommes ravis de vous accueillir dans la communauté des freelances marocains.
      Votre compte est prêt — voici comment bien démarrer :
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #F3F4F6;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top">
                <div style="width:32px;height:32px;border-radius:50%;background-color:#DC2626;color:#FFFFFF;font-size:14px;font-weight:800;text-align:center;line-height:32px;">1</div>
              </td>
              <td style="padding-left:14px;" valign="top">
                <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">Complétez votre profil</p>
                <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5;">Ajoutez vos compétences, votre photo et votre biographie pour attirer des clients.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #F3F4F6;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top">
                <div style="width:32px;height:32px;border-radius:50%;background-color:#DC2626;color:#FFFFFF;font-size:14px;font-weight:800;text-align:center;line-height:32px;">2</div>
              </td>
              <td style="padding-left:14px;" valign="top">
                <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">Créez votre premier service</p>
                <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5;">Proposez vos compétences et commencez à recevoir des commandes dès aujourd'hui.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top">
                <div style="width:32px;height:32px;border-radius:50%;background-color:#DC2626;color:#FFFFFF;font-size:14px;font-weight:800;text-align:center;line-height:32px;">3</div>
              </td>
              <td style="padding-left:14px;" valign="top">
                <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">Explorez les services disponibles</p>
                <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5;">Trouvez des freelances talentueux pour vos projets et collaborez facilement.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton(`${SITE_URL}/dashboard`, "Accéder à mon tableau de bord")}
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Bienvenue sur Wslni.ma, ${firstName} !`,
    html: emailLayout(content, `Bienvenue ${firstName} ! Votre compte Wslni.ma est prêt.`),
  })
}

// ─── 2. New Order Notification (freelancer) ───────────────────────────────────

/** Notifies a freelancer by email when a new order arrives for one of their services. */
export async function sendNewOrderEmail(params: {
  freelancerEmail: string
  freelancerName: string
  clientName: string
  serviceTitle: string
  price: number
}) {
  const { freelancerEmail, freelancerName, clientName, serviceTitle, price } = params
  const firstName = freelancerName.trim().split(" ")[0]

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">
      Nouvelle commande reçue !
    </h1>
    <p style="margin:0 0 4px;font-size:15px;color:#4B5563;line-height:1.7;">
      Bonjour <strong>${firstName}</strong>, excellente nouvelle —
      <strong>${clientName}</strong> vient de passer une commande pour votre service.
    </p>

    ${infoCard([
      { label: "Service commandé", value: serviceTitle },
      { label: "Client", value: clientName },
      {
        label: "Montant",
        value: `${price.toLocaleString("fr-MA")} MAD`,
        valueStyle: "font-size:20px;font-weight:800;color:#DC2626;",
      },
    ])}

    <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.7;">
      Connectez-vous à votre tableau de bord pour consulter les détails de cette commande
      et démarrer la collaboration avec votre client.
    </p>

    ${ctaButton(`${SITE_URL}/dashboard`, "Voir la commande")}
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to: freelancerEmail,
    subject: `Nouvelle commande : ${serviceTitle}`,
    html: emailLayout(content, `${clientName} vient de commander votre service "${serviceTitle}".`),
  })
}

// ─── 3. Order Status Update Notification (client) ────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  en_cours: "En cours",
  livré: "Livré",
  annulé: "Annulé",
}

const STATUS_COLORS: Record<string, string> = {
  en_cours: "#2563EB",
  livré: "#059669",
  annulé: "#DC2626",
}

const STATUS_MESSAGES: Record<string, string> = {
  en_cours:
    "Votre freelance a accepté votre commande et a commencé à travailler dessus. Vous pouvez le contacter via la messagerie.",
  livré:
    "Votre commande a été livrée avec succès ! N'oubliez pas de laisser un avis pour aider la communauté.",
  annulé: "Votre commande a été annulée. Si vous avez des questions, contactez notre support.",
}

/** Notifies a client by email when their order status changes (en_cours, livré, annulé). */
export async function sendOrderStatusEmail(params: {
  clientEmail: string
  clientName: string
  freelancerName: string
  serviceTitle: string
  newStatus: string
  price: number
}) {
  const { clientEmail, clientName, freelancerName, serviceTitle, newStatus, price } = params
  const firstName = clientName.trim().split(" ")[0]

  const statusLabel = STATUS_LABELS[newStatus] ?? newStatus
  const statusColor = STATUS_COLORS[newStatus] ?? "#6B7280"
  const statusMessage = STATUS_MESSAGES[newStatus] ?? ""

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">
      Mise à jour de votre commande
    </h1>
    <p style="margin:0 0 4px;font-size:15px;color:#4B5563;line-height:1.7;">
      Bonjour <strong>${firstName}</strong>, voici une mise à jour concernant votre commande.
    </p>

    ${infoCard([
      { label: "Service", value: serviceTitle },
      { label: "Freelance", value: freelancerName },
      {
        label: "Statut",
        value: `<span style="display:inline-block;background-color:${statusColor}1A;color:${statusColor};font-size:13px;font-weight:700;padding:4px 14px;border-radius:20px;">${statusLabel}</span>`,
      },
      {
        label: "Montant",
        value: `${price.toLocaleString("fr-MA")} MAD`,
        valueStyle: "font-weight:700;",
      },
    ])}

    ${
      statusMessage
        ? `<p style="margin:0 0 24px;font-size:14px;color:#4B5563;line-height:1.7;background-color:#F9FAFB;border-left:3px solid #DC2626;padding:12px 16px;border-radius:0 6px 6px 0;">${statusMessage}</p>`
        : ""
    }

    ${ctaButton(`${SITE_URL}/dashboard`, "Voir mes commandes")}
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to: clientEmail,
    subject: `Commande "${serviceTitle}" — Statut : ${statusLabel}`,
    html: emailLayout(
      content,
      `Votre commande "${serviceTitle}" est maintenant "${statusLabel}".`
    ),
  })
}

// ─── 4. CIN Verification Result ───────────────────────────────────────────────

/** Notifies a user by email that their CIN identity verification was approved. */
export async function sendCinApprovedEmail(params: {
  email: string
  fullName: string
}) {
  const { email, fullName } = params
  const firstName = fullName.trim().split(" ")[0]

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">
      Identité vérifiée ✓
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Bonjour <strong>${firstName}</strong>, excellente nouvelle ! Votre identité a été
      <strong style="color:#059669;">vérifiée avec succès</strong> par notre équipe.
    </p>

    <div style="background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:10px;padding:20px 24px;margin:0 0 28px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">✅</div>
      <p style="margin:0;font-size:16px;font-weight:700;color:#065F46;">Badge « Vérifié » activé</p>
      <p style="margin:8px 0 0;font-size:13px;color:#047857;line-height:1.5;">
        Un badge vert apparaît désormais sur votre profil public, renforçant la confiance
        des clients envers vos services.
      </p>
    </div>

    <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.7;">
      Ce badge témoigne de votre sérieux et augmente vos chances d'être contacté par des clients.
    </p>

    ${ctaButton(`${SITE_URL}/profil`, "Voir mon profil")}
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Votre identité a été vérifiée sur Wslni.ma ✓",
    html: emailLayout(content, `${firstName}, votre badge Vérifié est actif sur Wslni.ma !`),
  })
}

/** Notifies a user by email that their CIN verification was rejected and prompts resubmission. */
export async function sendCinRejectedEmail(params: {
  email: string
  fullName: string
}) {
  const { email, fullName } = params
  const firstName = fullName.trim().split(" ")[0]

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">
      Vérification d'identité refusée
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Bonjour <strong>${firstName}</strong>, malheureusement votre demande de vérification
      d'identité n'a pas pu être acceptée en l'état.
    </p>

    <div style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:20px 24px;margin:0 0 28px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#991B1B;">Raisons possibles :</p>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#7F1D1D;line-height:1.8;">
        <li>Photo illisible ou floue</li>
        <li>Document expiré ou invalide</li>
        <li>CIN non visible en entier sur la photo</li>
      </ul>
    </div>

    <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.7;">
      Vous pouvez soumettre à nouveau une photo claire et lisible de votre CIN depuis
      la section « Vérification d'identité » de votre profil.
    </p>

    ${ctaButton(`${SITE_URL}/profil`, "Soumettre à nouveau")}
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Demande de vérification d'identité — Action requise",
    html: emailLayout(content, `${firstName}, votre vérification CIN nécessite une nouvelle soumission.`),
  })
}

// ─── 5. New Message Notification (recipient) ─────────────────────────────────

/** Notifies a user by email when they receive a new message, including a preview of the content. */
export async function sendNewMessageEmail(params: {
  recipientEmail: string
  recipientName: string
  senderName: string
  messagePreview: string
}) {
  const { recipientEmail, recipientName, senderName, messagePreview } = params
  const firstName = recipientName.trim().split(" ")[0]
  const preview =
    messagePreview.length > 200 ? messagePreview.substring(0, 200) + "…" : messagePreview

  const content = `
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">
      Nouveau message reçu
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.7;">
      Bonjour <strong>${firstName}</strong>,
      <strong>${senderName}</strong> vous a envoyé un message sur Wslni.ma.
    </p>

    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-left:4px solid #DC2626;border-radius:0 10px 10px 0;padding:20px 24px;margin:0 0 28px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.8px;">
        ${senderName} a écrit :
      </p>
      <p style="margin:0;font-size:15px;color:#1F2937;line-height:1.7;font-style:italic;">
        &ldquo;${preview}&rdquo;
      </p>
    </div>

    <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.7;">
      Répondez directement depuis votre messagerie Wslni.ma pour continuer la conversation.
    </p>

    ${ctaButton(`${SITE_URL}/messages`, "Répondre au message")}
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `Nouveau message de ${senderName} sur Wslni.ma`,
    html: emailLayout(
      content,
      `${senderName} vous a envoyé un message : "${preview.substring(0, 60)}..."`
    ),
  })
}

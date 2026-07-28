import { env } from '../../config/env';
import { escapeHtml } from './escape';

const BRAND = {
  primary: '#047857',
  primarySoft: '#ECFDF5',
  ink: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  surface: '#FFFFFF',
  canvas: '#F1F5F9',
  danger: '#B91C1C',
} as const;

export type EmailDocument = {
  subject: string;
  html: string;
  text: string;
};

type LayoutOptions = {
  /** Hidden inbox preview line */
  preheader: string;
  /** Eyebrow above headline */
  eyebrow: string;
  title: string;
  /** Main HTML body (already escaped / safe markup) */
  bodyHtml: string;
  /** Plain-text counterpart */
  bodyText: string;
};

/**
 * Transactional email shell — table-based for Gmail/Outlook.
 * Visual: ink + emerald, quiet retail/ops tone (not generic SaaS purple).
 */
export function renderEmailLayout(options: LayoutOptions): EmailDocument {
  const appName = escapeHtml(env.APP_NAME);
  const year = new Date().getFullYear();
  const fromHint = env.EMAIL_FROM ?? null;
  const supportHtml = fromHint
    ? `Questions? Reply to this email or write ${escapeHtml(fromHint)}.`
    : 'Questions? Reply to this email.';
  const supportText = fromHint
    ? `Questions? Reply to this email or write ${fromHint}.`
    : 'Questions? Reply to this email.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(options.title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.canvas};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.canvas};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
          <!-- Brand mark -->
          <tr>
            <td style="padding:0 8px 20px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:36px;height:36px;border-radius:10px;background-color:${BRAND.primary};text-align:center;vertical-align:middle;">
                    <span style="display:inline-block;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;line-height:36px;color:#FFFFFF;letter-spacing:-0.5px;">S</span>
                  </td>
                  <td style="padding-left:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:${BRAND.ink};letter-spacing:-0.2px;">
                    ${appName}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
              <!-- Accent rail -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg, ${BRAND.primary} 0%, #34D399 100%);background-color:${BRAND.primary};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 32px 28px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                    <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.primary};">
                      ${escapeHtml(options.eyebrow)}
                    </p>
                    <h1 style="margin:0 0 20px 0;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.4px;color:${BRAND.ink};">
                      ${escapeHtml(options.title)}
                    </h1>
                    ${options.bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px 8px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:left;">
              <p style="margin:0 0 8px 0;">${supportHtml}</p>
              <p style="margin:0;">© ${year} ${appName}. All rights reserved.</p>
              <p style="margin:12px 0 0 0;color:#94A3B8;">This is an automated message related to your ${appName} account. If you did not request it, you can ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${env.APP_NAME}`,
    '',
    options.title,
    '',
    options.bodyText,
    '',
    '---',
    supportText,
    `© ${year} ${env.APP_NAME}`,
  ].join('\n');

  return {
    subject: options.title,
    html,
    text,
  };
}

/** Large OTP block — readable on mobile + desktop. */
export function renderOtpBlock(otp: string): string {
  const digits = escapeHtml(otp);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
      <tr>
        <td align="center" style="background-color:${BRAND.primarySoft};border:1px solid #A7F3D0;border-radius:12px;padding:22px 16px;">
          <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.primary};">
            One-time code
          </p>
          <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:36px;line-height:1.2;font-weight:700;letter-spacing:0.28em;color:${BRAND.ink};">
            ${digits}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function renderParagraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${BRAND.ink};">${escapeHtml(text)}</p>`;
}

export function renderMutedNote(text: string): string {
  return `<p style="margin:0 0 8px 0;font-size:13px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(text)}</p>`;
}

export function renderSecurityCallout(text: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0 0;">
      <tr>
        <td style="border-left:3px solid ${BRAND.primary};padding:10px 0 10px 14px;background-color:#F8FAFC;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:${BRAND.muted};">
            ${escapeHtml(text)}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export { BRAND };

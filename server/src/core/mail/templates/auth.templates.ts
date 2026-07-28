import { env } from '../../config/env';
import { escapeHtml } from './escape';
import {
  renderEmailLayout,
  renderMutedNote,
  renderOtpBlock,
  renderParagraph,
  renderSecurityCallout,
  type EmailDocument,
} from './layout';

type OtpEmailInput = {
  firstName?: string | null;
  otp: string;
  expiryMinutes?: number;
};

function greeting(firstName?: string | null): string {
  const name = firstName?.trim();
  return name ? `Hi ${name},` : 'Hi there,';
}

/** Email verification after register / resend. */
export function buildEmailVerificationEmail(
  input: OtpEmailInput,
): EmailDocument {
  const minutes = input.expiryMinutes ?? env.OTP_EXPIRY_MINUTES;
  const greet = greeting(input.firstName);

  const bodyHtml = [
    renderParagraph(greet),
    renderParagraph(
      `Welcome to ${env.APP_NAME}. Use the code below to verify your email and finish setting up your account.`,
    ),
    renderOtpBlock(input.otp),
    renderMutedNote(`This code expires in ${minutes} minutes.`),
    renderMutedNote(
      'Enter it in the app on the email verification screen. Do not share this code with anyone.',
    ),
    renderSecurityCallout(
      `If you did not create a ${env.APP_NAME} account, you can safely ignore this email. No changes will be made.`,
    ),
  ].join('\n');

  const bodyText = [
    greet,
    '',
    `Welcome to ${env.APP_NAME}. Use this code to verify your email:`,
    '',
    input.otp,
    '',
    `This code expires in ${minutes} minutes.`,
    'Do not share this code with anyone.',
    '',
    `If you did not create a ${env.APP_NAME} account, ignore this email.`,
  ].join('\n');

  const doc = renderEmailLayout({
    preheader: `Your ${env.APP_NAME} verification code is ${input.otp}`,
    eyebrow: 'Account security',
    title: 'Verify your email',
    bodyHtml,
    bodyText,
  });

  return {
    ...doc,
    subject: `Verify your email · ${env.APP_NAME}`,
  };
}

/** Password reset OTP. */
export function buildPasswordResetEmail(
  input: OtpEmailInput,
): EmailDocument {
  const minutes = input.expiryMinutes ?? env.OTP_EXPIRY_MINUTES;
  const greet = greeting(input.firstName);

  const bodyHtml = [
    renderParagraph(greet),
    renderParagraph(
      `We received a request to reset the password for your ${env.APP_NAME} account. Use the code below to continue.`,
    ),
    renderOtpBlock(input.otp),
    renderMutedNote(`This code expires in ${minutes} minutes.`),
    renderMutedNote(
      'After verifying, you will choose a new password. Anyone with this code can reset your password — keep it private.',
    ),
    renderSecurityCallout(
      'If you did not request a password reset, ignore this email. Your password will stay the same.',
    ),
  ].join('\n');

  const bodyText = [
    greet,
    '',
    `We received a request to reset your ${env.APP_NAME} password. Use this code:`,
    '',
    input.otp,
    '',
    `This code expires in ${minutes} minutes.`,
    'Do not share this code.',
    '',
    'If you did not request a reset, ignore this email.',
  ].join('\n');

  const doc = renderEmailLayout({
    preheader: `Password reset code: ${input.otp} · expires in ${minutes} min`,
    eyebrow: 'Password reset',
    title: 'Reset your password',
    bodyHtml,
    bodyText,
  });

  return {
    ...doc,
    subject: `Reset your password · ${env.APP_NAME}`,
  };
}

/** Confirmation after password successfully changed. */
export function buildPasswordChangedEmail(input: {
  firstName?: string | null;
  email: string;
}): EmailDocument {
  const greet = greeting(input.firstName);

  const bodyHtml = [
    renderParagraph(greet),
    renderParagraph(
      `Your ${env.APP_NAME} password was changed successfully. All active sessions were signed out for your security.`,
    ),
    renderParagraph(`Account: ${input.email}`),
    renderMutedNote(
      'You can sign in again with your new password from the app.',
    ),
    renderSecurityCallout(
      `If you did not make this change, reset your password immediately and contact support. Your account may be at risk.`,
    ),
  ].join('\n');

  const bodyText = [
    greet,
    '',
    `Your ${env.APP_NAME} password was changed successfully.`,
    `Account: ${input.email}`,
    'All active sessions were signed out.',
    '',
    'If you did not make this change, reset your password immediately.',
  ].join('\n');

  const doc = renderEmailLayout({
    preheader: `Your ${env.APP_NAME} password was changed`,
    eyebrow: 'Security notice',
    title: 'Password updated',
    bodyHtml,
    bodyText,
  });

  return {
    ...doc,
    subject: `Password updated · ${env.APP_NAME}`,
  };
}

/** Invite email when shop admin creates manager / employee. */
export function buildTeamMemberInviteEmail(input: {
  firstName?: string | null;
  email: string;
  temporaryPassword: string;
  roleName: string;
  organizationName: string;
}): EmailDocument {
  const greet = greeting(input.firstName);

  const bodyHtml = [
    renderParagraph(greet),
    renderParagraph(
      `You have been added to ${input.organizationName} on ${env.APP_NAME} as ${input.roleName}.`,
    ),
    renderParagraph('Sign in with these credentials:'),
    renderMutedNote(`Email: ${input.email}`),
    `<p style="margin:8px 0 16px 0;padding:14px 16px;background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:16px;font-weight:600;color:#0F172A;word-break:break-all;">${escapeHtml(input.temporaryPassword)}</p>`,
    renderMutedNote(
      'This is your temporary password. Keep it private. Password changes are managed by your shop admin.',
    ),
    renderSecurityCallout(
      'If you were not expecting this invitation, contact your shop admin and do not sign in.',
    ),
  ].join('\n');

  const bodyText = [
    greet,
    '',
    `You have been added to ${input.organizationName} on ${env.APP_NAME} as ${input.roleName}.`,
    '',
    `Email: ${input.email}`,
    `Temporary password: ${input.temporaryPassword}`,
    '',
    'Password changes are managed by your shop admin.',
  ].join('\n');

  const doc = renderEmailLayout({
    preheader: `Your ${env.APP_NAME} account for ${input.organizationName}`,
    eyebrow: 'Team invitation',
    title: 'You are invited to the shop',
    bodyHtml,
    bodyText,
  });

  return {
    ...doc,
    subject: `Welcome to ${input.organizationName} · ${env.APP_NAME}`,
  };
}

import nodemailer from 'nodemailer';

import { env } from '../config/env';
import { AppError } from '../errors/app-error';
import { HTTP_STATUS } from '../constants/http-status';

const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({
  to,
  subject,
  html,
}: SendMailOptions): Promise<void> => {
  if (!transporter) {
    if (env.NODE_ENV === 'production') {
      throw new AppError(
        'Email service is not configured.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return;
  }

  const fromAddress =
    env.EMAIL_FROM ?? env.SMTP_USER ?? 'noreply@localhost';
  const fromName = env.EMAIL_FROM_NAME ?? env.APP_NAME;

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    html,
  });
};

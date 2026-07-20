import dotenv from 'dotenv-safe'

dotenv.config({
  allowEmptyValues: true,
})

const required = (key: string): string => {
  const value = process.env[key]

  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

const optional = (key: string, fallback?: string): string | undefined => {
  const value = process.env[key]

  if (value === undefined || value === '') {
    return fallback
  }

  return value
}

const requiredNumber = (key: string, fallback?: number): number => {
  const raw = process.env[key]

  if (raw === undefined || raw === '') {
    if (fallback !== undefined) {
      return fallback
    }

    throw new Error(`Missing required environment variable: ${key}`)
  }

  const value = Number(raw)

  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${key} must be a number`)
  }

  return value
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development') as
    | 'development'
    | 'production'
    | 'test',
  PORT: requiredNumber('PORT', 5000),
  API_VERSION: optional('API_VERSION', 'v1') as string,
  APP_NAME: optional('APP_NAME', 'ShopMaster') as string,
  SERVER_URL: optional('SERVER_URL', 'http://localhost:5000') as string,

  DATABASE_URL: required('DATABASE_URL'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: optional('JWT_ACCESS_EXPIRES_IN', '15m') as string,
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d') as string,
  JWT_PASSWORD_RESET_SECRET: required('JWT_PASSWORD_RESET_SECRET'),
  JWT_PASSWORD_RESET_EXPIRES_IN: optional(
    'JWT_PASSWORD_RESET_EXPIRES_IN',
    '15m',
  ) as string,

  SMTP_HOST: optional('SMTP_HOST'),
  SMTP_PORT: requiredNumber('SMTP_PORT', 587),
  SMTP_SECURE: optional('SMTP_SECURE', 'false') === 'true',
  SMTP_USER: optional('SMTP_USER'),
  SMTP_PASS: optional('SMTP_PASS'),
  EMAIL_FROM: optional('EMAIL_FROM'),
  EMAIL_FROM_NAME: optional('EMAIL_FROM_NAME'),

  REDIS_URL: optional('REDIS_URL'),

  BCRYPT_SALT_ROUNDS: requiredNumber('BCRYPT_SALT_ROUNDS', 12),
  OTP_LENGTH: requiredNumber('OTP_LENGTH', 6),
  OTP_EXPIRY_MINUTES: requiredNumber('OTP_EXPIRY_MINUTES', 10),

  CORS_ALLOWED_ORIGINS: optional(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:8081',
  ) as string,

  RATE_LIMIT_WINDOW_MS: requiredNumber('RATE_LIMIT_WINDOW_MS', 60_000),
  RATE_LIMIT_MAX: requiredNumber('RATE_LIMIT_MAX', 100),

  LOG_LEVEL: optional('LOG_LEVEL', 'info') as string,
  LOG_FILE_PATH: optional('LOG_FILE_PATH', 'logs/app.log') as string,

  ORGANIZATION_DEFAULT_CURRENCY: optional(
    'ORGANIZATION_DEFAULT_CURRENCY',
    'BDT',
  ) as string,
  ORGANIZATION_DEFAULT_TIMEZONE: optional(
    'ORGANIZATION_DEFAULT_TIMEZONE',
    'Asia/Dhaka',
  ) as string,

  SETTING_DEFAULT_INVOICE_PREFIX: optional(
    'SETTING_DEFAULT_INVOICE_PREFIX',
    'INV',
  ) as string,
  SETTING_DEFAULT_INVOICE_NEXT_NUMBER: optional(
    'SETTING_DEFAULT_INVOICE_NEXT_NUMBER',
    '1',
  ) as string,
  SETTING_DEFAULT_PURCHASE_PREFIX: optional(
    'SETTING_DEFAULT_PURCHASE_PREFIX',
    'PO',
  ) as string,
  SETTING_DEFAULT_PURCHASE_NEXT_NUMBER: optional(
    'SETTING_DEFAULT_PURCHASE_NEXT_NUMBER',
    '1',
  ) as string,
  SETTING_DEFAULT_PURCHASE_RETURN_PREFIX: optional(
    'SETTING_DEFAULT_PURCHASE_RETURN_PREFIX',
    'PR',
  ) as string,
  SETTING_DEFAULT_PURCHASE_RETURN_NEXT_NUMBER: optional(
    'SETTING_DEFAULT_PURCHASE_RETURN_NEXT_NUMBER',
    '1',
  ) as string,
  SETTING_DEFAULT_SALE_RETURN_PREFIX: optional(
    'SETTING_DEFAULT_SALE_RETURN_PREFIX',
    'SR',
  ) as string,
  SETTING_DEFAULT_SALE_RETURN_NEXT_NUMBER: optional(
    'SETTING_DEFAULT_SALE_RETURN_NEXT_NUMBER',
    '1',
  ) as string,
  SETTING_DEFAULT_LOW_STOCK_THRESHOLD: optional(
    'SETTING_DEFAULT_LOW_STOCK_THRESHOLD',
    '10',
  ) as string,
  SETTING_DEFAULT_ALLOW_NEGATIVE_STOCK: optional(
    'SETTING_DEFAULT_ALLOW_NEGATIVE_STOCK',
    'false',
  ) as string,
  SETTING_DEFAULT_DATE_FORMAT: optional(
    'SETTING_DEFAULT_DATE_FORMAT',
    'DD/MM/YYYY',
  ) as string,
  SETTING_DEFAULT_DECIMAL_PLACES: optional(
    'SETTING_DEFAULT_DECIMAL_PLACES',
    '2',
  ) as string,

  UPLOAD_DIR: optional('UPLOAD_DIR', 'uploads') as string,
  UPLOAD_MAX_BYTES: requiredNumber('UPLOAD_MAX_BYTES', 10 * 1024 * 1024),
  UPLOAD_ALLOWED_MIME: optional(
    'UPLOAD_ALLOWED_MIME',
    'image/png,image/jpeg,image/jpg,image/gif,image/webp,application/pdf',
  ) as string,
  UPLOAD_STATIC_PATH: optional(
    'UPLOAD_STATIC_PATH',
    '/uploads/files',
  ) as string,
} as const

export type Env = typeof env

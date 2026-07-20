process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.API_VERSION = 'v1';
process.env.APP_NAME = 'ShopMaster Test';
process.env.SERVER_URL = 'http://localhost:5000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://srs:3326@localhost:5432/shop_erp_test';
process.env.JWT_ACCESS_SECRET =
  'test_access_secret_min_32_chars_long_enough_123456';
process.env.JWT_REFRESH_SECRET =
  'test_refresh_secret_min_32_chars_long_enough_12345';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.JWT_PASSWORD_RESET_SECRET =
  'test_password_reset_secret_min_32_chars_long_123';
process.env.JWT_PASSWORD_RESET_EXPIRES_IN = '15m';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.OTP_LENGTH = '6';
process.env.OTP_EXPIRY_MINUTES = '10';
process.env.SMTP_HOST = '';
process.env.SMTP_PORT = '587';
process.env.SMTP_SECURE = 'false';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
process.env.EMAIL_FROM = '';
process.env.EMAIL_FROM_NAME = 'ShopMaster Test';
process.env.REDIS_URL = '';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:8081';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX = '100';
process.env.LOG_LEVEL = 'error';
process.env.LOG_FILE_PATH = 'logs/test.log';
process.env.ORGANIZATION_DEFAULT_CURRENCY = 'BDT';
process.env.ORGANIZATION_DEFAULT_TIMEZONE = 'Asia/Dhaka';
process.env.SETTING_DEFAULT_INVOICE_PREFIX = 'INV';
process.env.SETTING_DEFAULT_INVOICE_NEXT_NUMBER = '1';
process.env.SETTING_DEFAULT_PURCHASE_PREFIX = 'PO';
process.env.SETTING_DEFAULT_PURCHASE_NEXT_NUMBER = '1';
process.env.SETTING_DEFAULT_PURCHASE_RETURN_PREFIX = 'PR';
process.env.SETTING_DEFAULT_PURCHASE_RETURN_NEXT_NUMBER = '1';
process.env.SETTING_DEFAULT_SALE_RETURN_PREFIX = 'SR';
process.env.SETTING_DEFAULT_SALE_RETURN_NEXT_NUMBER = '1';
process.env.SETTING_DEFAULT_LOW_STOCK_THRESHOLD = '10';
process.env.SETTING_DEFAULT_ALLOW_NEGATIVE_STOCK = 'false';
process.env.SETTING_DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';
process.env.SETTING_DEFAULT_DECIMAL_PLACES = '2';
process.env.UPLOAD_DIR = 'uploads_test';
process.env.UPLOAD_MAX_BYTES = '5242880';
process.env.UPLOAD_ALLOWED_MIME = 'image/png,image/jpeg,text/plain';
process.env.UPLOAD_STATIC_PATH = '/uploads/files';

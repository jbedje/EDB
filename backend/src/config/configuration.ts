export const configuration = () => ({
  app: {
    name: process.env.APP_NAME || 'EDB Backend API',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    url: process.env.APP_URL || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.SMTP_FROM || 'noreply@ecoledelabourse.com',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
  },
  payment: {
    cinetpay: {
      apiKey: process.env.CINETPAY_API_KEY,
      siteId: process.env.CINETPAY_SITE_ID,
      secretKey: process.env.CINETPAY_SECRET_KEY,
      notifyUrl: process.env.CINETPAY_NOTIFY_URL,
    },
    orangeMoney: {
      apiKey: process.env.ORANGE_MONEY_API_KEY,
      merchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY,
      callbackUrl: process.env.ORANGE_MONEY_CALLBACK_URL,
    },
    wave: {
      apiKey: process.env.WAVE_API_KEY,
      secretKey: process.env.WAVE_SECRET_KEY,
      callbackUrl: process.env.WAVE_CALLBACK_URL,
    },
  },
  coaching: {
    freeDurationMonths: parseInt(
      process.env.FREE_COACHING_DURATION_MONTHS,
      10,
    ) || 3,
    reminderDaysBeforeExpiry: process.env.COACHING_REMINDER_DAYS_BEFORE_EXPIRY
      ?.split(',')
      .map((d) => parseInt(d, 10)) || [7, 14, 30],
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    path: process.env.UPLOAD_PATH || './uploads',
  },
  security: {
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDurationMinutes:
      parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) || 15,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
});

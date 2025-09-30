import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export const env = {
  dbHost: requireEnv('DB_HOST'),
  dbPort: Number(process.env.DB_PORT ?? 3306),
  dbUser: requireEnv('DB_USER'),
  dbPassword: process.env.DB_PASSWORD ?? '',
  dbName: requireEnv('DB_NAME'),
  dbConnectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900),
  jwtRefreshExpiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 604800),
  uploadRoot: process.env.UPLOAD_ROOT ?? 'docs',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 120),
  logLevel: process.env.LOG_LEVEL ?? 'info'
};

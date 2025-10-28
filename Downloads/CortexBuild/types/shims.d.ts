// Ambient module/type shims to satisfy TypeScript without adding runtime deps

declare module '@nestjs/config' {
  export const ConfigModule: any;
}

declare namespace Express {
  // Augment Express Request with user field used by our middleware
  interface Request {
    user?: any;
  }
}


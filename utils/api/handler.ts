export type ApiHandler = (req: Request) => Promise<Response>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err: any) {
      const msg = err?.message || 'Internal Server Error';
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }
  };
}

const requestsMap = new Map<string, { count: number; ts: number }>();

export function withRateLimit(handler: ApiHandler, limit = 30, windowMs = 60_000): ApiHandler {
  return async (req: Request) => {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').toString();
    const now = Date.now();
    const rec = requestsMap.get(ip) || { count: 0, ts: now };
    if (now - rec.ts > windowMs) {
      rec.count = 0;
      rec.ts = now;
    }
    rec.count += 1;
    requestsMap.set(ip, rec);
    if (rec.count > limit) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(req);
  };
}

export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
}



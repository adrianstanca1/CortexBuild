import { withErrorHandling, withRateLimit, json } from '../../../utils/api/handler';

const handler = withRateLimit(
  withErrorHandling(async () => {
    return json({ status: 'ok', time: new Date().toISOString() });
  })
);

export const GET = handler;



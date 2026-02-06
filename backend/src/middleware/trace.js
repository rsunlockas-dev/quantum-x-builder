import crypto from 'crypto';

function normalizeId(value) {
  if (!value) return null;
  return String(value).trim();
}

export function traceMiddleware(req, res, next) {
  const traceId = normalizeId(req.headers['x-trace-id']) || crypto.randomUUID();
  const spanId = normalizeId(req.headers['x-span-id']) || crypto.randomUUID();

  req.trace = { traceId, spanId };
  res.setHeader('x-trace-id', traceId);
  res.setHeader('x-span-id', spanId);

  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'request.completed',
        trace_id: traceId,
        span_id: spanId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: durationMs
      })
    );
  });

  next();
}
export function errorHandler(err, req, res, next) {
  console.error('[Unhandled error]', err);

  if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found' });
  if (err.code === 'P2002') return res.status(409).json({ error: 'Duplicate value — record already exists' });

  const status = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(status).json({ error: message });
}

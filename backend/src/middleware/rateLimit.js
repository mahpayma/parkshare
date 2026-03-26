import rateLimit from 'express-rate-limit';

export const unlockRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many unlock attempts. Try again shortly.' }
});

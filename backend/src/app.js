import express from 'express';
import authRoutes from './routes/auth.js';
import accessRoutes from './routes/access.js';
import twilioRoutes from './routes/twilio.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'parkshare-backend' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/access', accessRoutes);
  app.use('/api/twilio', twilioRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((error, req, res, next) => {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }

    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

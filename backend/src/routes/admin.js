import express from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/doors', async (req, res, next) => {
  try {
    const [doors] = await pool.execute(
      'SELECT id, name, location_hint, is_active FROM doors WHERE property_id = ? ORDER BY id DESC',
      [req.user.propertyId]
    );
    res.json({ items: doors });
  } catch (error) {
    next(error);
  }
});

router.post('/guest-codes', async (req, res, next) => {
  try {
    const schema = z.object({
      doorId: z.number().int().positive(),
      code: z.string().min(4).max(12),
      expiresAt: z.string().datetime()
    });
    const payload = schema.parse(req.body);

    await pool.execute(
      `INSERT INTO guest_codes (property_id, door_id, created_by_user_id, code, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.propertyId, payload.doorId, req.user.sub, payload.code, payload.expiresAt]
    );

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get('/access-logs', async (req, res, next) => {
  try {
    const [logs] = await pool.execute(
      `SELECT id, door_id, actor_type, actor_id, channel, status, reason, source_phone, created_at
       FROM access_logs
       WHERE property_id = ?
       ORDER BY id DESC
       LIMIT 500`,
      [req.user.propertyId]
    );

    res.json({ items: logs });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8)
    });
    const { email, password } = schema.parse(req.body);

    const [rows] = await pool.execute('SELECT id, property_id, email, password_hash, role, is_active FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        propertyId: user.property_id,
        role: user.role,
        email: user.email
      },
      env.jwtSecret,
      { expiresIn: '12h' }
    );

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

export default router;

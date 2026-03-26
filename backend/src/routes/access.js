import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { unlockRateLimit } from '../middleware/rateLimit.js';
import { triggerRelay } from '../services/relayService.js';
import {
  getDoorById,
  incrementGuestUse,
  logAccess,
  userCanAccessDoor,
  validateGuestCode
} from '../services/accessService.js';

const router = express.Router();

router.post('/unlock', requireAuth, unlockRateLimit, async (req, res, next) => {
  try {
    const schema = z.object({
      doorId: z.number().int().positive(),
      method: z.enum(['app', 'qr'])
    });
    const { doorId, method } = schema.parse(req.body);

    const door = await getDoorById(doorId);
    if (!door) {
      return res.status(404).json({ error: 'Door not found' });
    }

    const canAccess = await userCanAccessDoor(req.user.sub, doorId);
    if (!canAccess) {
      await logAccess({
        propertyId: req.user.propertyId,
        doorId,
        actorType: 'user',
        actorId: req.user.sub,
        channel: method,
        status: 'denied',
        reason: 'no_permission'
      });
      return res.status(403).json({ error: 'Access denied' });
    }

    const relay = await triggerRelay(door);
    await logAccess({
      propertyId: req.user.propertyId,
      doorId,
      actorType: 'user',
      actorId: req.user.sub,
      channel: method,
      status: 'granted'
    });

    return res.json({ ok: true, relay });
  } catch (error) {
    return next(error);
  }
});

router.post('/guest/unlock', unlockRateLimit, async (req, res, next) => {
  try {
    const schema = z.object({
      doorId: z.number().int().positive(),
      code: z.string().min(4).max(12)
    });

    const { doorId, code } = schema.parse(req.body);
    const door = await getDoorById(doorId);

    if (!door) {
      return res.status(404).json({ error: 'Door not found' });
    }

    const guestCode = await validateGuestCode(code, doorId);
    if (!guestCode) {
      await logAccess({
        propertyId: door.property_id,
        doorId,
        actorType: 'guest',
        actorId: null,
        channel: 'pin',
        status: 'denied',
        reason: 'invalid_or_expired_code'
      });
      return res.status(403).json({ error: 'Invalid or expired code' });
    }

    const relay = await triggerRelay(door);
    await incrementGuestUse(guestCode.id);
    await logAccess({
      propertyId: door.property_id,
      doorId,
      actorType: 'guest',
      actorId: guestCode.id,
      channel: 'pin',
      status: 'granted'
    });

    return res.json({ ok: true, relay });
  } catch (error) {
    return next(error);
  }
});

export default router;

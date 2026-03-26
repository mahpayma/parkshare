import express from 'express';
import { twiml } from 'twilio';
import { z } from 'zod';
import { getDoorById, logAccess } from '../services/accessService.js';
import { triggerRelay } from '../services/relayService.js';
import { pool } from '../config/db.js';

const router = express.Router();

router.post('/voice', async (req, res) => {
  const response = new twiml.VoiceResponse();
  response.gather({
    numDigits: 1,
    action: '/api/twilio/voice/select-door',
    method: 'POST',
    timeout: 6
  }).say('Welcome to Smart Access. Press 1 for main door. Press 2 for garage.', { voice: 'alice' });
  response.redirect('/api/twilio/voice');

  res.type('text/xml');
  res.send(response.toString());
});

router.post('/voice/select-door', async (req, res) => {
  const response = new twiml.VoiceResponse();
  const schema = z.object({
    Digits: z.string().optional(),
    From: z.string().optional()
  });

  const payload = schema.safeParse(req.body);
  if (!payload.success || !payload.data.Digits) {
    response.say('No selection received. Goodbye.');
    response.hangup();
    res.type('text/xml');
    return res.send(response.toString());
  }

  const digit = payload.data.Digits;
  const caller = payload.data.From || null;
  const mapping = { '1': 1, '2': 2 };
  const doorId = mapping[digit];

  if (!doorId) {
    response.say('Invalid selection. Goodbye.');
    response.hangup();
    res.type('text/xml');
    return res.send(response.toString());
  }

  const [users] = await pool.execute(
    `SELECT id, property_id FROM users
     WHERE phone_number = ? AND is_active = 1
     LIMIT 1`,
    [caller]
  );

  const user = users[0];
  const door = await getDoorById(doorId);

  if (!user || !door || user.property_id !== door.property_id) {
    if (door) {
      await logAccess({
        propertyId: door.property_id,
        doorId,
        actorType: 'phone',
        actorId: null,
        channel: 'phone',
        status: 'denied',
        reason: 'unauthorized_phone',
        sourcePhone: caller
      });
    }
    response.say('Access denied.');
    response.hangup();
    res.type('text/xml');
    return res.send(response.toString());
  }

  try {
    await triggerRelay(door);
    await logAccess({
      propertyId: door.property_id,
      doorId,
      actorType: 'phone',
      actorId: user.id,
      channel: 'phone',
      status: 'granted',
      sourcePhone: caller
    });
    response.say('Door unlocked. Welcome.');
  } catch {
    await logAccess({
      propertyId: door.property_id,
      doorId,
      actorType: 'phone',
      actorId: user.id,
      channel: 'phone',
      status: 'error',
      reason: 'relay_failure',
      sourcePhone: caller
    });
    response.say('Unable to unlock at this time.');
  }

  response.hangup();
  res.type('text/xml');
  return res.send(response.toString());
});

export default router;

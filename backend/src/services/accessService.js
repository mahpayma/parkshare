import { pool } from '../config/db.js';

export async function getDoorById(doorId) {
  const [rows] = await pool.execute('SELECT * FROM doors WHERE id = ? AND is_active = 1', [doorId]);
  return rows[0] || null;
}

export async function userCanAccessDoor(userId, doorId) {
  const [rows] = await pool.execute(
    `SELECT udp.id
     FROM user_door_permissions udp
     JOIN doors d ON d.id = udp.door_id
     WHERE udp.user_id = ? AND udp.door_id = ? AND d.is_active = 1`,
    [userId, doorId]
  );
  return rows.length > 0;
}

export async function validateGuestCode(code, doorId) {
  const [rows] = await pool.execute(
    `SELECT gc.*
     FROM guest_codes gc
     WHERE gc.code = ?
       AND gc.door_id = ?
       AND gc.expires_at > NOW()
       AND gc.is_revoked = 0`,
    [code, doorId]
  );
  return rows[0] || null;
}

export async function incrementGuestUse(codeId) {
  await pool.execute('UPDATE guest_codes SET uses = uses + 1 WHERE id = ?', [codeId]);
}

export async function logAccess({ propertyId, doorId, actorType, actorId, channel, status, reason, sourcePhone }) {
  await pool.execute(
    `INSERT INTO access_logs
      (property_id, door_id, actor_type, actor_id, channel, status, reason, source_phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [propertyId, doorId, actorType, actorId, channel, status, reason || null, sourcePhone || null]
  );
}

import type pg from 'pg';
import type { Alarm } from '@awake/shared';

interface AlarmRow {
  id: string;
  puck_id: string;
  time: string;
  recurring_days: number[];
  snooze_enabled: boolean;
  snooze_duration_min: number;
  label: string;
  ringtone_id: string | null;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

function toAlarm(row: AlarmRow): Alarm {
  return {
    id: row.id,
    puckId: row.puck_id,
    time: row.time.slice(0, 5), // PostgreSQL TIME returns HH:mm:ss, we want HH:mm
    recurringDays: row.recurring_days as Alarm['recurringDays'],
    snoozeEnabled: row.snooze_enabled,
    snoozeDurationMin: row.snooze_duration_min,
    label: row.label,
    ringtoneId: row.ringtone_id,
    isEnabled: row.is_enabled,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findByPuckId(
  db: pg.Pool,
  puckId: string
): Promise<Alarm | null> {
  const { rows } = await db.query<AlarmRow>(
    'SELECT * FROM alarms WHERE puck_id = $1',
    [puckId]
  );
  if (rows.length === 0) return null;
  return toAlarm(rows[0]);
}

export async function findById(
  db: pg.Pool,
  id: string
): Promise<Alarm | null> {
  const { rows } = await db.query<AlarmRow>(
    'SELECT * FROM alarms WHERE id = $1',
    [id]
  );
  if (rows.length === 0) return null;
  return toAlarm(rows[0]);
}

export async function findByUserId(
  db: pg.Pool,
  userId: string
): Promise<Alarm[]> {
  const { rows } = await db.query<AlarmRow>(
    `SELECT a.* FROM alarms a
     JOIN pucks p ON a.puck_id = p.id
     WHERE p.user_id = $1
     ORDER BY a.time`,
    [userId]
  );
  return rows.map(toAlarm);
}

export async function create(
  db: pg.Pool,
  data: {
    puckId: string;
    time: string;
    recurringDays?: number[];
    snoozeEnabled?: boolean;
    snoozeDurationMin?: number;
    label?: string;
    ringtoneId?: string | null;
    isEnabled?: boolean;
  }
): Promise<Alarm> {
  const { rows } = await db.query<AlarmRow>(
    `INSERT INTO alarms (puck_id, time, recurring_days, snooze_enabled, snooze_duration_min, label, ringtone_id, is_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.puckId,
      data.time,
      data.recurringDays ?? [],
      data.snoozeEnabled ?? true,
      data.snoozeDurationMin ?? 5,
      data.label ?? '',
      data.ringtoneId ?? null,
      data.isEnabled ?? true,
    ]
  );
  return toAlarm(rows[0]);
}

export async function update(
  db: pg.Pool,
  id: string,
  data: {
    time?: string;
    recurringDays?: number[];
    snoozeEnabled?: boolean;
    snoozeDurationMin?: number;
    label?: string;
    ringtoneId?: string | null;
    isEnabled?: boolean;
  }
): Promise<Alarm | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.time !== undefined) {
    fields.push(`time = $${paramIndex++}`);
    values.push(data.time);
  }
  if (data.recurringDays !== undefined) {
    fields.push(`recurring_days = $${paramIndex++}`);
    values.push(data.recurringDays);
  }
  if (data.snoozeEnabled !== undefined) {
    fields.push(`snooze_enabled = $${paramIndex++}`);
    values.push(data.snoozeEnabled);
  }
  if (data.snoozeDurationMin !== undefined) {
    fields.push(`snooze_duration_min = $${paramIndex++}`);
    values.push(data.snoozeDurationMin);
  }
  if (data.label !== undefined) {
    fields.push(`label = $${paramIndex++}`);
    values.push(data.label);
  }
  if (data.ringtoneId !== undefined) {
    fields.push(`ringtone_id = $${paramIndex++}`);
    values.push(data.ringtoneId);
  }
  if (data.isEnabled !== undefined) {
    fields.push(`is_enabled = $${paramIndex++}`);
    values.push(data.isEnabled);
  }

  if (fields.length === 0) return findById(db, id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await db.query<AlarmRow>(
    `UPDATE alarms SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;
  return toAlarm(rows[0]);
}

export async function remove(db: pg.Pool, id: string): Promise<boolean> {
  const { rowCount } = await db.query('DELETE FROM alarms WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

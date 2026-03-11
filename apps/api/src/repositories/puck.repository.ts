import type pg from 'pg';
import type { Puck } from '@awake/shared';

interface PuckRow {
  id: string;
  user_id: string;
  name: string;
  security_code_hash: string;
  paired_at: Date;
  updated_at: Date;
}

function toPuck(row: PuckRow): Puck {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    pairedAt: row.paired_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findByUserId(
  db: pg.Pool,
  userId: string
): Promise<Puck[]> {
  const { rows } = await db.query<PuckRow>(
    'SELECT * FROM pucks WHERE user_id = $1 ORDER BY paired_at DESC',
    [userId]
  );
  return rows.map(toPuck);
}

export async function findById(
  db: pg.Pool,
  id: string
): Promise<(Puck & { securityCodeHash: string }) | null> {
  const { rows } = await db.query<PuckRow>(
    'SELECT * FROM pucks WHERE id = $1',
    [id]
  );
  if (rows.length === 0) return null;
  return { ...toPuck(rows[0]), securityCodeHash: rows[0].security_code_hash };
}

export async function create(
  db: pg.Pool,
  userId: string,
  name: string,
  securityCodeHash: string
): Promise<Puck> {
  const { rows } = await db.query<PuckRow>(
    'INSERT INTO pucks (user_id, name, security_code_hash) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, securityCodeHash]
  );
  return toPuck(rows[0]);
}

export async function update(
  db: pg.Pool,
  id: string,
  data: { name?: string }
): Promise<Puck | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }

  if (fields.length === 0) return findById(db, id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await db.query<PuckRow>(
    `UPDATE pucks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  if (rows.length === 0) return null;
  return toPuck(rows[0]);
}

export async function updateSecurityCode(
  db: pg.Pool,
  id: string,
  securityCodeHash: string
): Promise<Puck | null> {
  const { rows } = await db.query<PuckRow>(
    'UPDATE pucks SET security_code_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [securityCodeHash, id]
  );
  if (rows.length === 0) return null;
  return toPuck(rows[0]);
}

export async function remove(db: pg.Pool, id: string): Promise<boolean> {
  const { rowCount } = await db.query('DELETE FROM pucks WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

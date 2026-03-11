import type pg from 'pg';
import type { User } from '@awake/shared';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findByEmail(
  db: pg.Pool,
  email: string
): Promise<(User & { passwordHash: string }) | null> {
  const { rows } = await db.query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  if (rows.length === 0) return null;
  return { ...toUser(rows[0]), passwordHash: rows[0].password_hash };
}

export async function findById(
  db: pg.Pool,
  id: string
): Promise<User | null> {
  const { rows } = await db.query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  if (rows.length === 0) return null;
  return toUser(rows[0]);
}

export async function create(
  db: pg.Pool,
  email: string,
  passwordHash: string
): Promise<User> {
  const { rows } = await db.query<UserRow>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [email, passwordHash]
  );
  return toUser(rows[0]);
}

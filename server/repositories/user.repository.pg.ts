// Репозиторий пользователей через прямой SQL (pg) вместо Prisma
import { pool } from '../db/pool.js';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  fullName?: string | null;
  phone?: string | null;
  country: string;
  city?: string | null;
  avatar?: string | null;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepositoryPG {
  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  async create(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    country?: string;
    city?: string;
    avatar?: string;
    role?: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (
        id, email, username, password, "fullName", phone, 
        country, city, avatar, role, "createdAt", "updatedAt"
      )
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        data.email,
        data.username,
        data.password,
        data.fullName || null,
        data.phone || null,
        data.country || 'ru',
        data.city || null,
        data.avatar || null,
        data.role || 'user',
      ]
    );
    return result.rows[0];
  }

  async update(id: string, data: Partial<{
    email: string;
    username: string;
    fullName: string;
    phone: string;
    country: string;
    city: string;
    avatar: string;
    role: string;
  }>): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'fullName' ? '"fullName"' : key;
        updates.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      return this.findById(id) as Promise<User>;
    }

    updates.push(`"updatedAt" = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async updateRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<User> {
    const result = await pool.query(
      'UPDATE users SET role = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [role, userId]
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  async findAll(limit = 100, offset = 0): Promise<User[]> {
    const result = await pool.query(
      'SELECT * FROM users ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count, 10);
  }
}


const pool = require("../config/db");

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, name, email, password_hash, avatar_url
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, email, avatar_url
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser(data) {
  const { name, email, passwordHash, avatarUrl } = data;
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, avatar_url)
     VALUES (?, ?, ?, ?)`,
    [name, email, passwordHash, avatarUrl || null]
  );
  return result.insertId;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser
};

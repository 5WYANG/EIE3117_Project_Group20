const pool = require("../config/db");

async function fetchNotices() {
  const [rows] = await pool.query(
    `SELECT n.*, COALESCE(i.image_url, '') AS image_url
     FROM notices n
     LEFT JOIN notice_images i ON i.notice_id = n.id AND i.sort_order = 1
     ORDER BY n.created_at DESC`
  );
  return rows;
}

async function fetchNoticeById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM notices WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
}

async function fetchNoticeImages(id) {
  const [rows] = await pool.query(
    `SELECT image_url, sort_order FROM notice_images WHERE notice_id = ? ORDER BY sort_order ASC`,
    [id]
  );
  return rows;
}

async function fetchResponses(id) {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name
     FROM responses r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.notice_id = ?
     ORDER BY r.created_at ASC`,
    [id]
  );
  return rows;
}

async function fetchNoticesByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT n.*, COALESCE(i.image_url, '') AS image_url
     FROM notices n
     LEFT JOIN notice_images i ON i.notice_id = n.id AND i.sort_order = 1
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return rows;
}

async function createNotice(data) {
  const {
    user_id,
    type,
    title,
    description,
    category,
    subcategory,
    location_text,
    occurred_at,
    reward_amount
  } = data;
  const [result] = await pool.query(
    `INSERT INTO notices
      (user_id, type, title, description, category, subcategory, location_text, occurred_at, reward_amount, status, view_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)`,
    [
      user_id,
      type,
      title,
      description,
      category,
      subcategory || null,
      location_text,
      occurred_at,
      reward_amount || 0
    ]
  );
  return result.insertId;
}

async function createNoticeImage(noticeId, imageUrl, sortOrder) {
  await pool.query(
    `INSERT INTO notice_images (notice_id, image_url, sort_order) VALUES (?, ?, ?)`,
    [noticeId, imageUrl, sortOrder || 1]
  );
}

async function createResponse(data) {
  const { notice_id, user_id, message } = data;
  const [result] = await pool.query(
    `INSERT INTO responses (notice_id, user_id, message)
     VALUES (?, ?, ?)`,
    [notice_id, user_id, message]
  );
  return result.insertId;
}

module.exports = {
  fetchNotices,
  fetchNoticeById,
  fetchNoticeImages,
  fetchResponses,
  fetchNoticesByUserId,
  createNotice,
  createNoticeImage,
  createResponse
};

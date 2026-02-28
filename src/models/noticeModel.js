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

async function buildActiveFilterWhere(filter, nearLocation) {
    let where = `n.status = 'active'`;
    const params = [];

    if (filter === "lost") {
        where += ` AND n.type = 'lost'`;
    } else if (filter === "found") {
        where += ` AND n.type = 'found'`;
    } else if (filter === "near") {
        where += ` AND n.location_text LIKE ?`;
        params.push(`%${nearLocation}%`);
    }

    return { where, params };
}

async function fetchActiveNoticesFilteredPaged(filter, nearLocation, limit, offset) {
    const { where, params } = await buildActiveFilterWhere(filter, nearLocation);

    const [rows] = await pool.query(
        `SELECT n.*, COALESCE(i.image_url, '') AS image_url
     FROM notices n
     LEFT JOIN notice_images i ON i.notice_id = n.id AND i.sort_order = 1
     WHERE ${where}
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    return rows;
}

async function countActiveNoticesFiltered(filter, nearLocation) {
    const { where, params } = await buildActiveFilterWhere(filter, nearLocation);

    const [rows] = await pool.query(
        `SELECT COUNT(*) AS total
     FROM notices n
     WHERE ${where}`,
        params
    );

    return rows[0] ? Number(rows[0].total) : 0;
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

async function fetchParticipationsByUserId(userId) {
    const [rows] = await pool.query(
        `SELECT
        r.id AS response_id,
        r.message AS response_message,
        r.created_at AS response_created_at,
        n.id AS notice_id,
        n.title,
        n.status,
        n.type,
        n.created_at AS notice_created_at,
        COALESCE(i.image_url, '') AS image_url
     FROM responses r
     JOIN notices n ON n.id = r.notice_id
     LEFT JOIN notice_images i ON i.notice_id = n.id AND i.sort_order = 1
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC`,
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

async function incrementViewCount(noticeId) {
    await pool.query(
        `UPDATE notices SET view_count = view_count + 1 WHERE id = ?`,
        [noticeId]
    );
}

async function updateNoticeStatus(noticeId, status) {
    await pool.query(
        `UPDATE notices SET status = ? WHERE id = ?`,
        [status, noticeId]
    );
}

async function updateNotice(noticeId, data) {
    const {
        type,
        title,
        description,
        category,
        subcategory,
        location_text,
        occurred_at,
        reward_amount,
        status
    } = data;

    await pool.query(
        `UPDATE notices
     SET type = ?, title = ?, description = ?, category = ?, subcategory = ?, location_text = ?, occurred_at = ?, reward_amount = ?, status = ?
     WHERE id = ?`,
        [
            type,
            title,
            description,
            category,
            subcategory || null,
            location_text,
            occurred_at,
            reward_amount || 0,
            status,
            noticeId
        ]
    );
}

async function deleteNoticeImages(noticeId) {
    await pool.query(
        `DELETE FROM notice_images WHERE notice_id = ?`,
        [noticeId]
    );
}

module.exports = {
    fetchNotices,
    fetchActiveNoticesFilteredPaged,
    countActiveNoticesFiltered,
    fetchNoticeById,
    fetchNoticeImages,
    fetchResponses,
    fetchNoticesByUserId,
    fetchParticipationsByUserId,
    createNotice,
    createNoticeImage,
    createResponse,
    incrementViewCount,
    updateNoticeStatus,
    updateNotice,
    deleteNoticeImages
};
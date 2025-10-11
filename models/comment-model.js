// models/comment-model.js
const pool = require('../database/index');

async function createComment({ vehicleId, accountId, rating, commentText }) {
  const sql = `
    INSERT INTO public.comments (vehicle_id, account_id, rating, comment_text)
    VALUES ($1, $2, $3, $4)
    RETURNING comment_id, vehicle_id, account_id, rating, comment_text, created_at
  `;
  const values = [vehicleId, accountId, rating, commentText];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function getCommentsByVehicle(vehicleId) {
  const sql = `
    SELECT c.comment_id, c.vehicle_id, c.account_id, c.rating, c.comment_text, c.created_at,
           a.account_firstname || ' ' || a.account_lastname AS author_name
    FROM public.comments c
    JOIN public.account a ON a.account_id = c.account_id
    WHERE c.vehicle_id = $1
    ORDER BY c.created_at DESC
  `;
  const result = await pool.query(sql, [vehicleId]);
  return result.rows;
}

async function deleteCommentOwned(commentId, accountId) {
  const sql = `
    DELETE FROM public.comments
    WHERE comment_id = $1 AND account_id = $2
    RETURNING comment_id
  `;
  const result = await pool.query(sql, [commentId, accountId]);
  return result.rows[0];
}

async function getAverageRating(vehicleId) {
  const sql = `
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS avg_rating,
           COUNT(*)::int AS total_reviews
    FROM public.comments
    WHERE vehicle_id = $1
  `;
  const result = await pool.query(sql, [vehicleId]);
  return result.rows[0] || { avg_rating: 0, total_reviews: 0 };
}

module.exports = {
  createComment,
  getCommentsByVehicle,
  deleteCommentOwned,
  getAverageRating,
};

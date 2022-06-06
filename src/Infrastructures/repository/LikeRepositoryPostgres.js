const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(payload) {
    const { commentId, owner } = payload;
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async checkLikedComment(payload) {
    const { commentId, owner } = payload;

    const query = {
      text: 'SELECT id FROM likes WHERE owner = $1 AND comment_id = $2',
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async removeLike(payload) {
    const { commentId, owner } = payload;

    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikeCountByThreadId(threadId) {
    const query = {
      text: `SELECT l.comment_id, COUNT(l.id) AS like_count FROM likes l
      JOIN comments_thread c ON c.id = l.comment_id
      JOIN threads t ON t.id = c.thread_id
      WHERE t.id = $1
      GROUP BY l.comment_id`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;

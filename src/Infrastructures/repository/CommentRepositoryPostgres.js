const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedCommentToThread = require('../../Domains/comments/entities/AddedCommentToThread');

const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentToThread(data) {
    const { threadId, content, owner } = data;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments_thread VALUES ($1, $2, $3, $4) RETURNING id, comment, creator_username',
      values: [id, threadId, owner, content],
    };

    const result = await this._pool.query(query);

    return new AddedCommentToThread({
      id: result.rows[0].id,
      content: result.rows[0].comment,
      owner: result.rows[0].creator_username,
    });
  }

  async verifyThreadCommentAccess(data) {
    const { commentId, owner } = data;

    const query = {
      text: 'SELECT creator_username FROM comments_thread WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    const { creator_username: commentOwner } = result.rows[0];

    if (owner !== commentOwner) {
      throw new AuthorizationError('anda tidak dapat menghapus komentar ini');
    }
  }

  async deleteThreadComment(commentId) {
    const query = {
      text: 'UPDATE comments_thread SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async isCommentExist(commentId) {
    const query = {
      text: 'SELECT id FROM comments_thread WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT id, creator_username, comment, created_at, is_delete 
          FROM comments_thread WHERE thread_id = $1 ORDER BY created_at`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((comment) => ({
      ...comment,
      username: comment.creator_username,
      date: comment.created_at,
      content: comment.comment,
    }));
  }
}

module.exports = CommentRepositoryPostgres;

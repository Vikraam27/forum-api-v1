const AddedThread = require('../../Domains/threads/entities/AddedThread');
const AddedCommentToThread = require('../../Domains/threads/entities/AddedCommentToThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(data) {
    const { title, body, owner } = data;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4) RETURNING id, title, creator_username',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({
      id: result.rows[0].id,
      title: result.rows[0].title,
      owner: result.rows[0].creator_username,
    });
  }

  async isTreadExist(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
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
}

module.exports = ThreadRepositoryPostgres;

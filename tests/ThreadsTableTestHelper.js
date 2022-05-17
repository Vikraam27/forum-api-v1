/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123', title = 'Hello new user', body = 'Welcome to new thread', owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2,$3, $4)',
      values: [id, title, body, owner],
    };

    await pool.query(query);
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async addCommentToThread({
    id = 'comment-123', threadId = 'thread-123', owner = 'user-123', comment = 'this is comment',
  }) {
    const query = {
      text: 'INSERT INTO comments_thread VALUES ($1, $2, $3, $4)',
      values: [id, threadId, owner, comment],
    };

    await pool.query(query);
  },

  async findCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments_thread WHERE id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
    await pool.query('DELETE FROM comments_thread WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;

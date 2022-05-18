exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      notNull: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    creator_username: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });
  pgm.addConstraint('replies', 'fk_replies.creator_username_users.username', 'FOREIGN KEY(creator_username) REFERENCES users(username) ON DELETE CASCADE');
  pgm.addConstraint('replies', 'fk_replies.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.addConstraint('replies', 'fk_replies.comment_id_comments_thread.id', 'FOREIGN KEY(comment_id) REFERENCES comments_thread(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('replies', 'fk_replies.creator_username_users.username');
  pgm.dropConstraint('replies', 'fk_replies.thread_id_threads.id');
  pgm.dropConstraint('replies', 'fk_replies.comment_id_comments_thread.id');
  pgm.dropTable('replies');
};

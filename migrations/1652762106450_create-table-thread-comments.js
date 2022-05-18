exports.up = (pgm) => {
  pgm.createTable('comments_thread', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      notNull: true,
    },
    thread_id: {
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
  pgm.addConstraint('comments_thread', 'fk_comments_thread.creator_username_users.username', 'FOREIGN KEY(creator_username) REFERENCES users(username) ON DELETE CASCADE');
  pgm.addConstraint('comments_thread', 'fk_comments_thread.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('comments_thread', 'fk_comments_thread.creator_username_users.username');
  pgm.dropConstraint('comments_thread', 'fk_comments_thread.thread_id_threads.id');
  pgm.dropTable('comments_thread');
};

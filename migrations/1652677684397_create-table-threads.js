exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      notNull: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    creator_username: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.addConstraint('threads', 'fk_threads.creator_username_users.username', 'FOREIGN KEY(creator_username) REFERENCES users(username) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.addConstraint('threads', 'fk_threads.creator_username_users.username');
  pgm.dropTable('threads');
};

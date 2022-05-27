/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

// Add thread
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

// Commons
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      const addThread = new AddThread({
        title: 'Hello new user',
        body: 'Welcome to new thread',
        owner: 'fakeUsername',
      });

      const fakeIdGenerator = () => '123'; // stub!

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return thread property correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      const addThread = new AddThread({
        title: 'Hello new user',
        body: 'Welcome to new thread',
        owner: 'fakeUsername',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Hello new user',
        owner: 'fakeUsername',
      }));
    });
  });

  describe('isTreadExist function', () => {
    it('should throw NotFoundError when thread id is not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.isTreadExist('thread-xxxxxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread id is exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.isTreadExist('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw not found error when thread id not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-xxxxxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return property correcly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const threadDetails = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(threadDetails).toHaveProperty('id', 'thread-123');
      expect(threadDetails).toHaveProperty('title', 'Hello new user');
      expect(threadDetails).toHaveProperty('body', 'Welcome to new thread');
      expect(threadDetails).toHaveProperty('username', 'fakeUsername');
      expect(threadDetails).toHaveProperty('date');
    });
  });
});

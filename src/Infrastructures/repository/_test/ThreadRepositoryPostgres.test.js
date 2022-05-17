/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

// Add thread
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

// Add comment to tread
const AddCommentToThread = require('../../../Domains/threads/entities/AddCommentToThread');
const AddedCommentToThread = require('../../../Domains/threads/entities/AddedCommentToThread');

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

  describe('addCommentToThread function', () => {
    it('should add comment to tread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      const addCommentToThread = new AddCommentToThread({
        threadId: 'thread-123',
        content: 'this is comment from thread',
        owner: 'vikramaja',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedCommentToThread = await threadRepositoryPostgres.addCommentToThread(addCommentToThread);

      // Assert
      expect(addedCommentToThread).toStrictEqual(new AddedCommentToThread({
        id: 'comment-123',
        content: addCommentToThread.content,
        owner: addCommentToThread.owner,
      }));
    });
  });
});

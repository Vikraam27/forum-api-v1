const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

// Add comment to tread
const AddCommentToThread = require('../../../Domains/comments/entities/AddCommentToThread');
const AddedCommentToThread = require('../../../Domains/comments/entities/AddedCommentToThread');

// Commons
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
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
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedCommentToThread = await commentRepositoryPostgres
        .addCommentToThread(addCommentToThread);

      // Assert
      expect(addedCommentToThread).toStrictEqual(new AddedCommentToThread({
        id: 'comment-123',
        content: addCommentToThread.content,
        owner: addCommentToThread.owner,
      }));
    });
  });

  describe('verifyThreadCommentAccess function', () => {
    it('should throw NotFoundError when comment is not exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-xxxxx',
        owner: 'fakeUsername',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThreadCommentAccess(data))
        .rejects.toThrowError(NotFoundError);
    });
    it('should throw AuthorizationError when deleting comment that were not created by that user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'fakeUsername',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThreadCommentAccess(data))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when deleting comment that created by that user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'vikramaja',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThreadCommentAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteThreadComment function', () => {
    it('should update is_delete comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'vikramaja',
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThreadCommentAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
      await commentRepositoryPostgres.deleteThreadComment(data.commentId);

      const checkComment = await ThreadsTableTestHelper.findCommentById(data.commentId);
      expect(checkComment.is_delete).toEqual(true);
    });
  });

  describe('isCommentExsist function', () => {
    it('should throw NotFoundError when comment id is not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.isCommentExist('comment-xxxxxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment id is exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ threadId: 'thread-123', owner: 'fakeUsername' });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.isCommentExist('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return property correcly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const commentDetails = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(commentDetails[0]).toHaveProperty('id', 'comment-123');
      expect(commentDetails[0]).toHaveProperty('content', 'this is comment');
      expect(commentDetails[0]).toHaveProperty('username', 'fakeUsername');
      expect(commentDetails[0]).toHaveProperty('date');
    });
  });
});

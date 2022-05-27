/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

// add replies
const AddedReplies = require('../../../Domains/replies/entities/AddedReplies');

// Commons
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReplies function', () => {
    it('should add replies', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ threadId: 'thread-123', owner: 'fakeUsername' });
      const addReplies = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'this is replies from comment',
        owner: 'vikramaja',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReplies = await replyRepositoryPostgres.addReplies(addReplies);

      // Assert
      expect(addedReplies).toStrictEqual(new AddedReplies({
        id: 'reply-123',
        content: addReplies.content,
        owner: addReplies.owner,
      }));
    });
  });

  describe('verifyRepliesAccess function', () => {
    it('should throw NotFoundError when replies is not exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'fakeUsername',
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyRepliesAccess(data))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when deleting reply that were not created by that user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addReply({ owner: 'vikramaja' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'fakeUsername',
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyRepliesAccess(data))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when deleting reply that created by that user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addReply({ owner: 'vikramaja' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'vikramaja',
      };
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyRepliesAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplies function', () => {
    it('should update is_delete comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'vikramaja' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addReply({ owner: 'vikramaja' });
      const data = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'vikramaja',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThreadCommentAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
      await replyRepositoryPostgres.deleteReplies(data.replyId);

      const checkReply = await ThreadsTableTestHelper.findReplyByid(data.replyId);
      expect(checkReply.is_delete).toEqual(true);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return property correcly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addReply({ owner: 'fakeUsername' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies[0]).toHaveProperty('id', 'reply-123');
      expect(replies[0]).toHaveProperty('creator_username', 'fakeUsername');
      expect(replies[0]).toHaveProperty('comment', 'this is reply');
      expect(replies[0]).toHaveProperty('created_at');
      expect(replies[0]).toHaveProperty('is_delete', false);
      expect(replies[0]).toHaveProperty('comment_id', 'comment-123');
    });
  });
});

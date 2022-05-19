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

// add replies
const AddedReplies = require('../../../Domains/threads/entities/AddedReplies');

// Commons
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadCommentAccess(data))
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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadCommentAccess(data))
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
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadCommentAccess(data))
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
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadCommentAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
      await threadRepositoryPostgres.deleteThreadComment(data.commentId);

      const checkComment = await ThreadsTableTestHelper.findCommentById(data.commentId);
      expect(checkComment.is_delete).toEqual(true);
    });
  });

  describe('isCommentExsist function', () => {
    it('should throw NotFoundError when comment id is not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.isCommentExist('comment-xxxxxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment id is exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ threadId: 'thread-123', owner: 'fakeUsername' });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.isCommentExist('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
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
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReplies = await threadRepositoryPostgres.addReplies(addReplies);

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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyRepliesAccess(data))
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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyRepliesAccess(data))
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
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyRepliesAccess(data))
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
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadCommentAccess(data))
        .resolves.not.toThrowError(AuthorizationError);
      await threadRepositoryPostgres.deleteReplies(data.replyId);

      const checkReply = await ThreadsTableTestHelper.findReplyByid(data.replyId);
      expect(checkReply.is_delete).toEqual(true);
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

  describe('getCommentByThreadId function', () => {
    it('should return property correcly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const commentDetails = await threadRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(commentDetails[0]).toHaveProperty('id', 'comment-123');
      expect(commentDetails[0]).toHaveProperty('content', 'this is comment');
      expect(commentDetails[0]).toHaveProperty('username', 'fakeUsername');
      expect(commentDetails[0]).toHaveProperty('date');
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return property correcly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addReply({ owner: 'fakeUsername' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const replies = await threadRepositoryPostgres.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies[0]).toHaveProperty('id', 'reply-123');
      expect(replies[0]).toHaveProperty('content', 'this is reply');
      expect(replies[0]).toHaveProperty('username', 'fakeUsername');
      expect(replies[0]).toHaveProperty('date');
    });
  });
});

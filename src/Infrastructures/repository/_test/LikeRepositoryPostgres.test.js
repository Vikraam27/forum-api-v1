/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'fakeUsername' });
    await ThreadsTableTestHelper.addThread({ owner: 'fakeUsername' });
    await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should liked comment', async () => {
      // Arrange
      const payload = {
        owner: 'fakeUsername',
        commentId: 'comment-123',
      };

      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(payload);

      // Assert
      const likedComment = await ThreadsTableTestHelper.findLikedComment(payload.owner, payload.commentId);
      expect(likedComment[0].owner).toEqual(payload.owner);
      expect(likedComment[0].comment_id).toEqual(payload.commentId);
    });
  });

  describe('checkLikedComment function', () => {
    it("should return empty array if user doesn't like this comment yet", async () => {
      // Arrange
      const payload = {
        owner: 'fakeUsername',
        commentId: 'comment-123',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      const likedComment = await likeRepositoryPostgres.checkLikedComment(payload);

      // Assert
      expect(likedComment).toHaveLength(0);
    });

    it('should return array if user like this comment', async () => {
      // Arrange
      const payload = {
        owner: 'fakeUsername',
        commentId: 'comment-123',
      };

      await ThreadsTableTestHelper.addLike({ owner: 'fakeUsername' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      const likedComment = await likeRepositoryPostgres.checkLikedComment(payload);

      // Assert
      expect(likedComment).toHaveLength(1);
    });
  });

  describe('removeLike function', () => {
    it('should remove like', async () => {
      // Arrange
      const payload = {
        owner: 'fakeUsername',
        commentId: 'comment-123',
      };

      await ThreadsTableTestHelper.addLike({ owner: 'fakeUsername' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.removeLike(payload);

      // Assert
      const unlikeComment = await ThreadsTableTestHelper.findLikedComment(payload.owner, payload.commentId);
      expect(unlikeComment).toHaveLength(0);
    });
  });

  describe('getLikeCountByThreadId funtion', () => {
    it('should return like count', async () => {
      // Arrange
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addCommentToThread({ id: 'comment-124', owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addLike({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addLike({ id: 'like-124', commentId: 'comment-124', owner: 'fakeUsername' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCountByThreadId(threadId);

      // Assert
      expect(likeCount).toHaveLength(2);
      likeCount.forEach((like) => {
        expect(like.like_count).toEqual('1');
      });
    });

    it('should return empty array when comment no have like', async () => {
      // Arrange
      const threadId = 'thread-123';

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCountByThreadId(threadId);

      // Assert
      expect(likeCount).toHaveLength(0);
    });
  });
});

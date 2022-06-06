const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should throw error when payload does not contain needed property', async () => {
    const payload = {
      owner: 'fakeUsername',
      theadId: 'thread-123',
    };

    const likeCommentUseCase = new LikeCommentUseCase({});

    // Action & Assert
    await expect(likeCommentUseCase.execute(payload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type', async () => {
    const payload = {
      owner: 23455,
      threadId: {},
      commentId: [],
    };

    const likeCommentUseCase = new LikeCommentUseCase({});

    // Action & Assert
    await expect(likeCommentUseCase.execute(payload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating like comment action correctly', async () => {
    // Arrange
    const payload = {
      owner: 'fakeUsername',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.isTreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.isCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkLikedComment = jest.fn(() => Promise.resolve([]));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(payload);

    // Assert
    expect(mockThreadRepository.isTreadExist).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.isCommentExist).toBeCalledWith(payload.commentId);
    expect(mockLikeRepository.checkLikedComment).toBeCalledWith(payload);
    expect(mockLikeRepository.addLike).toBeCalledWith(payload);
  });

  it('should orchestrating unlike comment action correctly', async () => {
    // Arrange
    const payload = {
      owner: 'fakeUsername',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.isTreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.isCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkLikedComment = jest.fn(() => Promise.resolve([{}]));
    mockLikeRepository.removeLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute(payload);

    // Assert
    expect(mockThreadRepository.isTreadExist).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.isCommentExist).toBeCalledWith(payload.commentId);
    expect(mockLikeRepository.checkLikedComment).toBeCalledWith(payload);
    expect(mockLikeRepository.removeLike).toBeCalledWith(payload);
  });
});

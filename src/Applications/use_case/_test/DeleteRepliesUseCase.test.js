const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteRepliesUseCase = require('../DeleteRepliesUseCase');

describe('DeleteRepliesUseCase', () => {
  it('should throw error when payload does not contain needed property', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const deleteCommentFromThreadUseCase = new DeleteRepliesUseCase({});

    // Action & Assert
    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLIES_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type', async () => {
    const useCasePayload = {
      threadId: {},
      commentId: [],
      replyId: 23334,
      owner: 133,
    };
    const deleteCommentFromThreadUseCase = new DeleteRepliesUseCase({});

    // Action & Assert
    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete replies action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'vikramaja',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.isTreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.isCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepliesRepository.verifyRepliesAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepliesRepository.deleteReplies = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteRepliesUseCase = new DeleteRepliesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    // Action
    await deleteRepliesUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.isTreadExist)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.isCommentExist)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockRepliesRepository.verifyRepliesAccess)
      .toHaveBeenCalledWith(useCasePayload);
    expect(mockRepliesRepository.deleteReplies)
      .toHaveBeenCalledWith(useCasePayload.replyId);
  });
});

const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentFromThreadUseCase = require('../DeleteCommentFromThreadUseCase');

describe('DeleteCommentFromThreadUseCase', () => {
  it('should throw error when payload does not contain needed property', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const deleteCommentFromThreadUseCase = new DeleteCommentFromThreadUseCase({});

    // Action & Assert
    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: [],
      owner: 133,
    };
    const deleteCommentFromThreadUseCase = new DeleteCommentFromThreadUseCase({});

    // Action & Assert
    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment from thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'vikramaja',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.isTreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyThreadCommentAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteThreadComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentFromThreadUseCase = new DeleteCommentFromThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentFromThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.isTreadExist)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyThreadCommentAccess)
      .toHaveBeenCalledWith(useCasePayload);
    expect(mockCommentRepository.deleteThreadComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
  });
});

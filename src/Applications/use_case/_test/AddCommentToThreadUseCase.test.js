const AddCommentToThread = require('../../../Domains/comments/entities/AddCommentToThread');
const AddedCommentToThread = require('../../../Domains/comments/entities/AddedCommentToThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentToThreadUseCase = require('../AddCommentToThreadUseCase');

describe('AddCommentToThreadUseCase', () => {
  it('should orchestrating the add comment to thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'This is comment from new thread',
      owner: 'vikramaja',
    };

    const expectedAddedCommentToThread = new AddedCommentToThread({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.isTreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addCommentToThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedCommentToThread({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })));
    /** creating use case instance */
    const getThreadUseCase = new AddCommentToThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedCommentToThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedCommentToThread).toStrictEqual(expectedAddedCommentToThread);
    expect(mockThreadRepository.isTreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addCommentToThread)
      .toBeCalledWith(new AddCommentToThread(useCasePayload));
  });
});

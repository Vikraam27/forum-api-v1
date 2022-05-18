const AddCommentToThread = require('../../../Domains/threads/entities/AddCommentToThread');
const AddedCommentToThread = require('../../../Domains/threads/entities/AddedCommentToThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
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

    /** mocking needed function */
    mockThreadRepository.isTreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.addCommentToThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedCommentToThread));

    /** creating use case instance */
    const getThreadUseCase = new AddCommentToThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedCommentToThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedCommentToThread).toStrictEqual(expectedAddedCommentToThread);
    expect(mockThreadRepository.isTreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.addCommentToThread)
      .toBeCalledWith(new AddCommentToThread(useCasePayload));
  });
});

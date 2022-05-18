const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddRepliesUseCase = require('../AddRepliesUseCase');
const AddedReplies = require('../../../Domains/threads/entities/AddedReplies');

describe('AddRepliesUseCase', () => {
  it('should throw error when payload does not contain needed property', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const deleteCommentFromThreadUseCase = new AddRepliesUseCase({});

    // Action & Assert
    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: [],
      content: 123,
      owner: 133,
    };
    const deleteCommentFromThreadUseCase = new AddRepliesUseCase({});

    // Action & Assert
    await expect(deleteCommentFromThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLIES.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add replies action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'this is replies',
      owner: 'vikramaja',
    };
    const expectedAddedReplies = new AddedReplies({
      id: 'thread-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.isTreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.isCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.addReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReplies));

    /** creating use case instance */
    const addReplies = new AddRepliesUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReplies = await addReplies.execute(useCasePayload);

    expect(mockThreadRepository.isTreadExist)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.isCommentExist)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockThreadRepository.addReplies)
      .toHaveBeenCalledWith(useCasePayload);
    expect(addedReplies).toStrictEqual(expectedAddedReplies);
  });
});

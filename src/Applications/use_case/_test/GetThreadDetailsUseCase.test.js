const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/threads/entities/CommentDetails');
const RepliesDetails = require('../../../Domains/threads/entities/RepliesDetails');

describe('GetThreadDetailsUseCase', () => {
  it('should throw error when payload does not contain needed property', async () => {
    const threadId = '';
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({});

    // Action & Assert
    await expect(getThreadDetailsUseCase.execute(threadId))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type', async () => {
    const threadId = 12356;
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({});

    // Action & Assert
    await expect(getThreadDetailsUseCase.execute(threadId))
      .rejects
      .toThrowError('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get replies action correctly', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const expectedThreadDetails = new ThreadDetails({
      id: 'thread-123',
      title: 'this is new thread',
      body: 'welcome to new thread',
      date: new Date('2022-05-18 20:05:10.376458'),
      username: 'fakeUsername',
    });
    const expectedCommentDetail = [
      new CommentDetails({
        id: 'comment-123',
        username: 'dicoding',
        date: new Date('2022-05-18 20:05:12.000967'),
        content: 'NewComment content',
        is_delete: false,
      }),
    ];
    const expectedRepliesDetails = [
      new RepliesDetails({
        id: 'reply-123',
        username: 'dicoding',
        date: new Date('2022-05-18 20:05:12.000967'),
        content: 'NewReply content',
        is_delete: false,
      }),
    ];
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThreadDetails));
    mockThreadRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedCommentDetail));
    mockThreadRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedRepliesDetails));

    /** creating use case instance */
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    await getThreadDetailsUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getCommentByThreadId)
      .toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getRepliesByCommentId)
      .toHaveBeenCalledWith(commentId);
  });
});

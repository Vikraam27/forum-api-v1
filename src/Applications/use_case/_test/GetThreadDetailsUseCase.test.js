const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const RepliesDetails = require('../../../Domains/replies/entities/RepliesDetails');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

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

  it('should orchestrating the get thread action correctly', async () => {
    const threadId = 'thread-123';
    const expectedThreadDetailss = new ThreadDetails({
      id: 'thread-123',
      title: 'this is new thread',
      body: 'welcome to new thread',
      date: new Date('2022-05-18 20:05:10.376458'),
      username: 'fakeUsername',
      comments: [
        new CommentDetails({
          id: 'comment-123',
          username: 'dicoding',
          date: new Date('2022-05-18 20:05:12.000967'),
          content: 'NewComment content',
          is_delete: false,
          replies: [
            new RepliesDetails({
              id: 'reply-123',
              username: 'dicoding',
              date: new Date('2022-05-18 20:05:12.000967'),
              content: 'NewReply content',
              is_delete: false,
            }),
          ],
        }),
      ],
    });
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'this is new thread',
        body: 'welcome to new thread',
        date: new Date('2022-05-18 20:05:10.376458'),
        username: 'fakeUsername',
      }));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: new Date('2022-05-18 20:05:12.000967'),
          content: 'NewComment content',
          is_delete: false,
        },
      ]));
    mockRepliesRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new RepliesDetails({
          id: 'reply-123',
          username: 'dicoding',
          date: new Date('2022-05-18 20:05:12.000967'),
          content: 'NewReply content',
          is_delete: false,
        }),
      ]));

    /** creating use case instance */
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    // Action
    const thread = await getThreadDetailsUseCase.execute(threadId);

    // Assert
    console.log(thread);
    expect(thread).toStrictEqual(expectedThreadDetailss);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId)
      .toHaveBeenCalledWith(threadId);
    expect(mockRepliesRepository.getRepliesByThreadId)
      .toHaveBeenCalledWith(threadId);
  });
});

const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');
const RepliesDetails = require('../../Domains/replies/entities/RepliesDetails');

class GetThreadDetailsUseCase {
  constructor({
    threadRepository, commentRepository, repliesRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesRepository = repliesRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    this._validatePayload(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const threadComments = await this._commentRepository.getCommentByThreadId(threadId);
    const replyByThreadId = await this._repliesRepository.getRepliesByThreadId(threadId);
    const likeCount = await this._likeRepository.getLikeCountByThreadId(threadId);

    const replyByCommentId = threadComments.map((data) => {
      const like = likeCount.find((count) => count.comment_id === data.id);
      const replies = replyByThreadId.filter((reply) => reply.comment_id === data.id)
        .map((reply) => (new RepliesDetails({
          id: reply.id,
          username: reply.creator_username,
          date: reply.created_at,
          content: reply.comment,
          is_delete: reply.is_delete,
        })));

      return new CommentDetails({
        ...data,
        likeCount: like !== undefined ? like.like_count : 0,
        replies,
      });
    });

    return new ThreadDetails({
      ...thread,
      comments: replyByCommentId,
    });
  }

  _validatePayload(threadId) {
    if (!threadId) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThreadDetailsUseCase;

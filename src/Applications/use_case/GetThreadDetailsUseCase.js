const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');
const RepliesDetails = require('../../Domains/replies/entities/RepliesDetails');

class GetThreadDetailsUseCase {
  constructor({ threadRepository, commentRepository, repliesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesRepository = repliesRepository;
  }

  async execute(threadId) {
    this._validatePayload(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const threadComments = await this._commentRepository.getCommentByThreadId(threadId);
    const replyByThreadId = await this._repliesRepository.getRepliesByThreadId(threadId);
    console.log(replyByThreadId);
    const replyByCommentId = threadComments.map((data) => {
      const replies = replyByThreadId.filter((reply) => reply.comment_id === data.id)
        .map((reply) => (new RepliesDetails({
          id: reply.id,
          username: reply.creator_username,
          date: reply.created_at,
          content: reply.comment,
          is_delete: reply.is_delete,
        })));
      console.log(replies);
      return new CommentDetails({
        ...data,
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

class GetThreadDetailsUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    this._validatePayload(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const threadComments = await this._threadRepository.getCommentByThreadId(threadId);
    const replyByCommentId = await Promise.all(threadComments.map(async (data) => {
      const replies = await this._threadRepository.getRepliesByCommentId(data.id);

      return { ...data, replies };
    }));

    return {
      ...thread,
      comments: replyByCommentId,
    };
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

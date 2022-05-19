class AddRepliesUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.isTreadExist(useCasePayload.threadId);
    await this._threadRepository.isCommentExist(useCasePayload.commentId);
    return this._threadRepository.addReplies(useCasePayload);
  }

  _validatePayload(payload) {
    const {
      threadId, commentId, content, owner,
    } = payload;
    if (!threadId || !commentId || !content || !owner) {
      throw new Error('ADD_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_REPLIES.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddRepliesUseCase;
class DeleteRepliesUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.isTreadExist(useCasePayload.threadId);
    await this._threadRepository.isCommentExist(useCasePayload.commentId);
    await this._threadRepository.verifyRepliesAccess(useCasePayload);
    await this._threadRepository.deleteReplies(useCasePayload.replyId);
  }

  _validatePayload(payload) {
    const {
      threadId, commentId, replyId, owner,
    } = payload;
    if (!threadId || !commentId || !replyId || !owner) {
      throw new Error('DELETE_REPLIES_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof replyId !== 'string' || typeof owner !== 'string') {
      throw new Error('DELETE_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteRepliesUseCase;

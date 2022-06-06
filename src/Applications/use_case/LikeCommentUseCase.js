class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(payload) {
    this._validatePayload(payload);
    await this._threadRepository.isTreadExist(payload.threadId);
    await this._commentRepository.isCommentExist(payload.commentId);
    const likedComment = await this._likeRepository.checkLikedComment(payload);

    if (likedComment.length === 0) {
      await this._likeRepository.addLike(payload);
    } else {
      await this._likeRepository.removeLike(payload);
    }
  }

  _validatePayload(payload) {
    const { owner, threadId, commentId } = payload;
    if (!owner || !threadId || !commentId) {
      throw new Error('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikeCommentUseCase;

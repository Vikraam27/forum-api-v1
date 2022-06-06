const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.likeCommentHandler = this.likeCommentHandler.bind(this);
  }

  async likeCommentHandler(request) {
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);

    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      owner: request.auth.credentials.username,
    };

    await likeCommentUseCase.execute(payload);

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;

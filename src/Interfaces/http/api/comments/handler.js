const AddCommentToThreadUseCase = require('../../../../Applications/use_case/AddCommentToThreadUseCase');
const DeleteCommentFromThreadUseCase = require('../../../../Applications/use_case/DeleteCommentFromThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentToThreadHandler = this.postCommentToThreadHandler.bind(this);
    this.deleteCommentFromThreadHandler = this.deleteCommentFromThreadHandler.bind(this);
  }

  async postCommentToThreadHandler(request, h) {
    const addCommentToThreadUseCase = this._container.getInstance(AddCommentToThreadUseCase.name);
    const payload = {
      threadId: request.params.threadId,
      content: request.payload.content,
      owner: request.auth.credentials.username,
    };

    const addedComment = await addCommentToThreadUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentFromThreadHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentFromThreadUseCase.name);
    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      owner: request.auth.credentials.username,
    };

    await deleteCommentUseCase.execute(payload);

    return {
      status: 'success',
    };
  }
}

module.exports = ThreadsHandler;

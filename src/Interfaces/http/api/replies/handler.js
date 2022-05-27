const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteRepliesUseCase = require('../../../../Applications/use_case/DeleteRepliesUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.addRepliesHandler = this.addRepliesHandler.bind(this);
    this.deleteRepliesHandler = this.deleteRepliesHandler.bind(this);
  }

  async addRepliesHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      content: request.payload.content,
      owner: request.auth.credentials.username,
    };

    const addedReply = await addReplyUseCase.execute(payload);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteRepliesHandler(request) {
    const deleteRepliesUseCase = this._container.getInstance(DeleteRepliesUseCase.name);
    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      replyId: request.params.replyId,
      owner: request.auth.credentials.username,
    };

    await deleteRepliesUseCase.execute(payload);

    return {
      status: 'success',
    };
  }
}

module.exports = ThreadsHandler;

const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddCommentToThreadUseCase = require('../../../../Applications/use_case/AddCommentToThreadUseCase');
const DeleteCommentFromThreadUseCase = require('../../../../Applications/use_case/DeleteCommentFromThreadUseCase');
const AddRepliesUseCase = require('../../../../Applications/use_case/AddRepliesUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentToThreadHandler = this.postCommentToThreadHandler.bind(this);
    this.deleteCommentFromThreadHandler = this.deleteCommentFromThreadHandler.bind(this);
    this.addRepliesHandler = this.addRepliesHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const payload = {
      title: request.payload.title,
      body: request.payload.body,
      owner: request.auth.credentials.username,
    };

    const addedThread = await addThreadUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
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

  async addRepliesHandler(request, h) {
    const addRepliesUseCase = this._container.getInstance(AddRepliesUseCase.name);
    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      content: request.payload.content,
      owner: request.auth.credentials.username,
    };

    const addedReply = await addRepliesUseCase.execute(payload);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;

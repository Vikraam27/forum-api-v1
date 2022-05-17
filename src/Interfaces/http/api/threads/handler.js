const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddCommentToThreadUseCase = require('../../../../Applications/use_case/AddCommentToThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentToThreadHandler = this.postCommentToThreadHandler.bind(this);
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
}

module.exports = ThreadsHandler;

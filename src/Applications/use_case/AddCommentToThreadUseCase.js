const AddCommentToThread = require('../../Domains/comments/entities/AddCommentToThread');

class AddCommentToThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const addCommentToThread = new AddCommentToThread(useCasePayload);
    await this._threadRepository.isTreadExist(useCasePayload.threadId);
    return this._commentRepository.addCommentToThread(addCommentToThread);
  }
}

module.exports = AddCommentToThreadUseCase;

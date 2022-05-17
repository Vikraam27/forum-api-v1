const AddCommentToThread = require('../../Domains/threads/entities/AddCommentToThread');

class AddCommentToThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addCommentToThread = new AddCommentToThread(useCasePayload);
    await this._threadRepository.isTreadExist(useCasePayload.threadId);
    return this._threadRepository.addCommentToThread(addCommentToThread);
  }
}

module.exports = AddCommentToThreadUseCase;

/* eslint-disable no-unused-vars */
class ThreadRepository {
  async addThread(data) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async isTreadExist(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async addCommentToThread(data) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyThreadCommentAccess(commentId, owner) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteThreadComment(commentId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async isCommentExist(commentId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async addReplies(payload) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadRepository;

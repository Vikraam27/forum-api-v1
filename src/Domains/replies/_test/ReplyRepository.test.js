const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action and Assert
    await expect(replyRepository.addReplies({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.verifyRepliesAccess('')).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.deleteReplies('')).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.getRepliesByThreadId('')).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});

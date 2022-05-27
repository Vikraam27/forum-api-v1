const AddCommentToThread = require('../AddCommentToThread');

describe('AddCommentToThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 1234,
      content: 'this is comment from new thread',
    };

    // Action & Assert
    expect(() => new AddCommentToThread(payload)).toThrowError('ADD_COMMENT_TO_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 1234,
      content: [],
      owner: {},
    };

    // Action & Assert
    expect(() => new AddCommentToThread(payload)).toThrowError('ADD_COMMENT_TO_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should add Comment to Thread entities correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'this is comment',
      owner: 'vikram',
    };

    // Action
    const addCommentToThread = new AddCommentToThread(payload);

    // Assert
    expect(addCommentToThread.content).toEqual(payload.content);
  });
});

const AddedCommentToThread = require('../AddedCommentToThread');

describe('a AddedCommentToThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'This is comment from new thread',
    };

    // Action and Assert
    expect(() => new AddedCommentToThread(payload)).toThrowError('ADDED_COMMENT_TO_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1245,
      content: 'This is comment from thread',
      owner: [],
    };

    // Action and Assert
    expect(() => new AddedCommentToThread(payload)).toThrowError('ADDED_COMMENT_TO_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'This is comment from thread',
      owner: 'vikramaja',
    };

    // Action
    const addedThread = new AddedCommentToThread(payload);

    // Assert
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.content).toEqual(payload.content);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});

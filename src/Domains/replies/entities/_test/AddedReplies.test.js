const AddedReplies = require('../AddedReplies');

describe('AddedReplies entitiy', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'replies-123',
      content: 'This is comment from comment',
    };

    // Action and Assert
    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1245,
      content: 'This is replies from comment',
      owner: [],
    };

    // Action and Assert
    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReplies object correctly', () => {
    // Arrange
    const payload = {
      id: 'replies-123',
      content: 'This is replies from comment',
      owner: 'vikramaja',
    };

    // Action
    const addedReplies = new AddedReplies(payload);

    // Assert
    expect(addedReplies.id).toEqual(payload.id);
    expect(addedReplies.content).toEqual(payload.content);
    expect(addedReplies.owner).toEqual(payload.owner);
  });
});

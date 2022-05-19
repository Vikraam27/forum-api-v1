const CommentDetails = require('../CommentDetails');

describe('CommentDetails entitiy', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'fakeUsername',
      date: new Date('2022-05-18 20:05:12.000967'),
    };

    // Action and Assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: [],
      date: {},
      content: 'this is comment from thread',
      is_delete: 12455,
    };

    // Action and Assert
    expect(() => new CommentDetails(payload)).toThrowError('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return CommentDetails object correctly when comment is deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'fakeUsername',
      date: new Date('2022-05-18 20:05:12.000967'),
      content: 'this is comment from thread',
      is_delete: true,
    };
    // Action
    const commentDetails = new CommentDetails(payload);

    // Assert
    expect(commentDetails.id).toEqual(payload.id);
    expect(commentDetails.username).toEqual(payload.username);
    expect(commentDetails.date).toEqual(new Date(payload.date).toISOString());
    expect(commentDetails.content).toEqual('**komentar telah dihapus**');
  });

  it('should return CommentDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'fakeUsername',
      date: new Date('2022-05-18 20:05:12.000967'),
      content: 'this is comment from thread',
      is_delete: false,
    };
    // Action

    const commentDetails = new CommentDetails(payload);
    // Assert
    expect(commentDetails.id).toEqual(payload.id);
    expect(commentDetails.username).toEqual(payload.username);
    expect(commentDetails.date).toEqual(new Date(payload.date).toISOString());
    expect(commentDetails.content).toEqual(payload.content);
  });
});

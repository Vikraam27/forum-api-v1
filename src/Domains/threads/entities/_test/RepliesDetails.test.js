const RepliesDetails = require('../RepliesDetails');

describe('RepliesDetails entitiy', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'replies-123',
      username: 'fakeUsername',
      date: new Date('2022-05-18 20:05:12.000967'),
    };

    // Action and Assert
    expect(() => new RepliesDetails(payload)).toThrowError('REPLIES_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: [],
      date: {},
      content: 'this is replies from comment',
      is_delete: 12455,
    };

    // Action and Assert
    expect(() => new RepliesDetails(payload)).toThrowError('REPLIES_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return RepliesDetails object correctly when comment is deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'fakeUsername',
      date: new Date('2022-05-18 20:05:12.000967'),
      content: 'this is replies from comment',
      is_delete: true,
    };
    // Action
    const repliesDetails = new RepliesDetails(payload);

    // Assert
    expect(repliesDetails.id).toEqual(payload.id);
    expect(repliesDetails.username).toEqual(payload.username);
    expect(repliesDetails.date).toEqual(new Date(payload.date).toISOString());
    expect(repliesDetails.content).toEqual('**balasan telah dihapus**');
  });

  it('should return RepliesDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'relpy-123',
      username: 'fakeUsername',
      date: new Date('2022-05-18 20:05:12.000967'),
      content: 'this is relies from comment',
      is_delete: false,
    };
    // Action

    const repliesDetails = new RepliesDetails(payload);
    // Assert
    expect(repliesDetails.id).toEqual(payload.id);
    expect(repliesDetails.username).toEqual(payload.username);
    expect(repliesDetails.date).toEqual(new Date(payload.date).toISOString());
    expect(repliesDetails.content).toEqual(payload.content);
  });
});

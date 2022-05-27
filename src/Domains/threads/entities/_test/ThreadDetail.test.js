const ThreadDetails = require('../ThreadDetails');

describe('ThreadDetails entitiy', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'this is thread',
      body: 'welcome to this thread',
      date: '2022-05-18 20:05:12.000967',
    };

    // Action and Assert
    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 2431,
      title: [],
      body: {},
      date: 2332344,
      username: [],
      comments: 'string',
    };

    // Action and Assert
    expect(() => new ThreadDetails(payload)).toThrowError('THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return ThreadDetails object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'this is thread',
      body: 'welcome to this thread',
      date: new Date('2022-05-18 20:05:12.000967'),
      username: 'fakeUsername',
      comments: [],
    };
    // Action
    const threadDetails = new ThreadDetails(payload);

    // Assert
    expect(threadDetails.id).toEqual(payload.id);
    expect(threadDetails.title).toEqual(payload.title);
    expect(threadDetails.body).toEqual(payload.body);
    expect(threadDetails.date).toEqual(new Date(payload.date).toISOString());
    expect(threadDetails.username).toEqual(payload.username);
    expect(threadDetails.comments).toStrictEqual(payload.comments);
  });
});

const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes', () => {
  let accessToken;
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // add user
    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'vikramaja',
        password: 'secret',
        fullname: 'Vikram',
      },
    });

    // get authentication
    const requestAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'vikramaja',
        password: 'secret',
      },
    });
    const authResponse = JSON.parse(requestAuth.payload);

    accessToken = authResponse.data.accessToken;
    await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
    await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should like comment and return status success', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should unlike comment and return status success', async () => {
      // Arrange
      const server = await createServer(container);

      await ThreadsTableTestHelper.addLike({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should throw error when not passing access token', async () => {
      // Arrange
      const server = await createServer(container);

      await ThreadsTableTestHelper.addLike({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw not found error when thread not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-xxx/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should throw not found error when comment not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-xxx/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });
});

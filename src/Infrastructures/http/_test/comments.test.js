const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
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
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when post /threads/{threadId}/comments', () => {
    it('should add comment to thread with status code 201', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is comment from thread',
      };

      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should throw an Unauthorized error with status code 401', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is comment from thread',
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw an not found error when thread not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is comment from thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-xxxxxx/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should throw error with bad payload', async () => {
      // Arrange
      const requestPayload = {};

      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar pada thread karena properti yang di butuhkan tidak ada');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should be delete comment with status code 200', async () => {
      // Arrange
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should throw error when not passing access token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw error when deleting comments that are not created by that user', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fakeUsername',
          password: 'secret',
          fullname: 'fake user',
        },
      });

      await ThreadsTableTestHelper.addThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak dapat menghapus komentar ini');
    });
    it('should throw not found error when thread not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-xxx/comments/comment-xxxx',
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
      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-xxxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });
});

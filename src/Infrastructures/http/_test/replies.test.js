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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should be add replies with status code 201', async () => {
      // Arrange
      const payload = {
        content: 'this is replies',
      };
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/replies',
        payload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });

    it('should throw error when not passing access token', async () => {
      // Arrange
      const payload = {
        content: 'this is replies',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should be throw NotFoundError when thread is not exist', async () => {
      // Arrange
      const payload = {
        content: 'this is replies',
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/replies',
        payload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should be throw NotFoundError when comment is not exist', async () => {
      // Arrange
      const payload = {
        content: 'this is replies',
      };
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/replies',
        payload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should throw error with bad payload', async () => {
      // Arrange
      const payload = {
        content: 123,
      };
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/replies',
        payload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan reply pada komentar karena tipe data tidak sesuai');
    });
  });
  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should be delete replies with status code 200', async () => {
      // Arrange
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addReply({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
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
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw error when deleting reply that are not created by that user', async () => {
      // Arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fakeUsername',
          password: 'secret',
          fullname: 'Fake account',
        },
      });

      await ThreadsTableTestHelper.addThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addReply({ owner: 'fakeUsername' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak dapat menghapus resoucre ini');
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
        url: '/threads/thread-xxx/comments/comment-xxx/replies/reply-xxx',
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
        url: '/threads/thread-123/comments/comment-xxx/replies/reply-xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should throw not found error when reply not exist', async () => {
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
        url: '/threads/thread-123/comments/comment-123/replies/reply-xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });
  });
});

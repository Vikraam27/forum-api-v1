const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when post /threads', () => {
    it('should be add threads with response 201', async () => {
      // Arrange
      const requestPayload = {
        title: 'a new thread',
        body: 'this is new thread',
      };

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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should throw an Unauthorized error with status code 401', async () => {
      // Arrange
      const requestPayload = {
        title: 'a new thread',
        body: 'this is new thread',
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should throw error with bad payload', async () => {
      // Arrange
      const requestPayload = {
        title: 'a new thread',
      };

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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread karena properti yang di butuhkan tidak ada');
    });
  });

  describe('when post /threads/{threadId}/comments', () => {
    it('should add comment to thread with status code 201', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is comment from thread',
      };

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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
          username: 'vikramaja',
          password: 'secret',
          fullname: 'Vikram',
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fakeUsername',
          password: 'secret',
          fullname: 'Fake account',
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
        },
        url: '/threads/thread-123/comments/comment-123',
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should be add replies with status code 201', async () => {
      // Arrange
      const payload = {
        content: 'this is replies',
      };
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);
      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addReply({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'fakeUsername',
          password: 'secret',
          fullname: 'Fake account',
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'fakeUsername' });
      await ThreadsTableTestHelper.addReply({ owner: 'fakeUsername' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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
      const requestAuthJSON = JSON.parse(requestAuth.payload);

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${requestAuthJSON.data.accessToken}`,
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

  describe('GET /threads/{threadId}', () => {
    it('should be GET thread details with status code 200', async () => {
      // Arrange
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

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addReply({ owner: 'vikramaja' });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual('thread-123');
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments[0].id).toEqual('comment-123');
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].date).toBeDefined();
    });

    it('should be show "**komentar telah dihapus**" and "**balasan telah dihapus**" when deleting reply and comment', async () => {
      // Arrange
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

      await ThreadsTableTestHelper.addThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addCommentToThread({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.addReply({ owner: 'vikramaja' });
      await ThreadsTableTestHelper.deleteComment('comment-123');
      await ThreadsTableTestHelper.deleteReply('reply-123');

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
    });
  });
});

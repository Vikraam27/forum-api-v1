class CommentDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, is_delete: isDelete, replies, likeCount,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date.toISOString();
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.replies = replies;
    this.likeCount = parseInt(likeCount, 10);
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, is_delete: isDelete, replies, likeCount,
    } = payload;

    if (!id
       || !username
        || !date
        || !content
        || !replies
        || likeCount === undefined
        || likeCount === null) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || !(date instanceof Date)
    || typeof content !== 'string'
    || typeof isDelete !== 'boolean'
    || !(replies instanceof Array)
    || Number.isNaN(likeCount)
    ) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetails;

class CommentDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, is_delete: isDelete, replies,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date.toISOString();
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.replies = replies;
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, is_delete: isDelete, replies,
    } = payload;

    if (!id || !username || !date || !content || !replies) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || !(date instanceof Date)
    || typeof content !== 'string'
    || typeof isDelete !== 'boolean'
    || !(replies instanceof Array)
    ) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetails;

const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread karena properti yang di butuhkan tidak ada'),
  'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread karena tipe data tidak sesuai'),
  'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread karena properti yang di butuhkan tidak ada'),
  'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread karena tipe data tidak sesuai'),
  'ADD_COMMENT_TO_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan komentar pada thread karena properti yang di butuhkan tidak ada'),
  'ADD_COMMENT_TO_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambahkan komentar pada thread karena tipe data tidak sesuai'),
  'ADDED_COMMENT_TO_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan komentar pada thread karena properti yang di butuhkan tidak ada'),
  'ADDED_COMMENT_TO_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambahkan komentar pada thread karena tipe data tidak sesuai'),
  'DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menghapus komentar pada thread karena properti yang di butuhkan tidak ada'),
  'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menghapus komentar pada thread karena tipe data tidak sesuai'),
  'ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan reply pada komentar karena properti yang di butuhkan tidak ada'),
  'ADDED_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambahkan reply pada komentar karena tipe data tidak sesuai'),
  'ADD_REPLIES.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambahkan reply pada komentar karena tipe data tidak sesuai'),
  'ADD_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan reply pada komentar karena properti yang di butuhkan tidak ada'),
  'DELETE_REPLIES_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menghapus reply  karena properti yang di butuhkan tidak ada'),
  'DELETE_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menghapus relpy karena tipe data tidak sesuai'),
  'GET_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menampilkan detail thread karena properti yang di butuhkan tidak ada'),
  'GET_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detail thread karena tipe data tidak sesuai'),
  'THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menampilkan detail thread karena properti yang di butuhkan tidak ada'),
  'THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detail thread karena tipe data tidak sesuai'),
  'COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menampilkan detail thread karena properti yang di butuhkan tidak ada'),
  'COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detail thread karena tipe data tidak sesuai'),
  'REPLIES_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menampilkan detail thread karena properti yang di butuhkan tidak ada'),
  'REPLIES_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detail thread karena tipe data tidak sesuai'),
  'LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menampilkan detail thread karena properti yang di butuhkan tidak ada'),
  'LIKE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detail thread karena tipe data tidak sesuai'),

};

module.exports = DomainErrorTranslator;

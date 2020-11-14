const { Schema } = require('mongoose');

const UserSchema = new Schema({
  userId: String,
  username: String,
  passwordHash: String
});

function createUser(mongooseConnection) {
  return mongooseConnection.model('User', UserSchema);
}

module.exports = createUser;
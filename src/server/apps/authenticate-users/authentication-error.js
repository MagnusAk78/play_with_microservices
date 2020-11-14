function AuthenticationError (message) {
  Error.captureStackTrace(this, this.constructor)
  this.message = message
  this.name = 'AuthenticationError'
}

AuthenticationError.prototype = Object.create(Error.prototype)
AuthenticationError.prototype.constructor = AuthenticationError

module.exports = AuthenticationError

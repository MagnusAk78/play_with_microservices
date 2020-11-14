function ValidationError (errors, options, attributes, constraints) {
  Error.captureStackTrace(this, this.constructor)
  this.message = `Validation error**${JSON.stringify(errors)}`
  this.errors = errors
  this.options = options
  this.attributes = attributes
  this.constraints = constraints
  this.name = 'ValidationError'
}

ValidationError.prototype = Object.create(Error.prototype)
ValidationError.prototype.constructor = ValidationError

module.exports = ValidationError

const { StatusCodes } = require('http-status-codes')

const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true })
  if (error) {
    const details = error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: 'Validation failed', errors: details })
  }
  req[property] = value
  next()
}

module.exports = { validate }

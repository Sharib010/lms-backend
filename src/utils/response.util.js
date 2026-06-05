const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data })

const paginated = (res, data, pagination, message = 'Success') =>
  res.json({ success: true, message, data, pagination })

const error = (res, message = 'Error', statusCode = 400, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) })

module.exports = { success, paginated, error }

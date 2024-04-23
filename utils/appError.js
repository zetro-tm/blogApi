class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // this calls the Error class constructor. message is the only parameter that Error accepts

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); //gets the line number and file name where the error is generated from
  }
}

module.exports = AppError;

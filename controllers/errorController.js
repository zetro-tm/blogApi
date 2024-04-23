const AppError = require('../utils/appError');
require('dotenv').config({ path: `${process.cwd()}/.env` });

const handleSequelizeUniqueConstraintError = (err) => {
  const message = err.errors[0].message;
  return new AppError(message, 400);
};

const handleSequelizeValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired', 401);
};

const sendErrorDev = (err, res) => {
  console.error('ERROR!', err);
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Errors that we know about
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //1)LOG ERROR
    console.error('ERROR!', err);

    //2) Send Generic message
    res.status(500).json({
      //Unknown Errors.Don't leak details
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err); //copy of err
    if (err.name === 'SequelizeUniqueConstraintError')
      error = handleSequelizeUniqueConstraintError(err);
    if (err.name === 'SequelizeValidationError')
      error = handleSequelizeValidationError(err);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
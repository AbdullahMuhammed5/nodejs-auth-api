const AppError = require("../../utils/appError");

exports.handleValidationErrorDB = err => {
  const errors = Object.values(err.errors)
    .map(error => {
      switch(error.name){
        case 'ValidatorError':
          return { field: error.properties.path, message: error.properties.message }
        case 'CastError':
          return { field: error.path, message: error.message }
        default:
          return "unhandeled validation error"
      }
    });
  return new AppError("Invalid Data", 422, errors);
};

exports.handleDuplicateFieldsDB = err => {
  const message = `Duplicate field value: ${JSON.stringify(err.keyValue)}. Please use another value!`;
  return new AppError(message, 400);
};

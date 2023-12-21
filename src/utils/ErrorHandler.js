class ErrorHandler extends Error {
  constructor(message = "something wrong", statusCode, error = [], stack = "") {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = null;
    this.error = error;
    this.success = false;

    if (stack) {
        this.stack= stack
    } else {
        Error.captureStackTrace(this, this.Constructor)
    }
  }
}

export default ErrorHandler
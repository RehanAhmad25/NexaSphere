class AppError extends Error {
  constructor(message, { code = 'ERROR', status = 500, details = undefined } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details) {
    super(message, { code: 'VALIDATION_ERROR', status: 400, details });
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, { code: 'UNAUTHORIZED', status: 401 });
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, { code: 'NOT_FOUND', status: 404 });
  }
}

class DependencyError extends AppError {
  constructor(message = 'Dependency error') {
    super(message, { code: 'DEPENDENCY_ERROR', status: 502 });
  }
}

export { AppError, ValidationError, UnauthorizedError, NotFoundError, DependencyError };

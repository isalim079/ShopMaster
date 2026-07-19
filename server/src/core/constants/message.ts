export const MESSAGE = {
  // Common
  SUCCESS: 'Success',
  FAILED: 'Failed',

  // Authentication
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logout successful.',
  UNAUTHORIZED: 'Unauthorized.',
  FORBIDDEN: 'Forbidden.',
  INVALID_CREDENTIALS: 'Invalid credentials.',

  // Validation
  VALIDATION_FAILED: 'Validation failed.',

  // Resource
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  FETCHED: 'Fetched successfully.',
  NOT_FOUND: 'Resource not found.',

  // Server
  INTERNAL_SERVER_ERROR: 'Internal server error.',
} as const;
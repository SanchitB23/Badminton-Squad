/**
 * Enhanced error handling utilities for the application
 */

export type AppError = {
  type: 'auth' | 'validation' | 'network' | 'server' | 'unknown'
  message: string
  field?: string
  code?: string
}

/**
 * Parse Supabase auth errors into user-friendly messages
 */
export function parseAuthError(error: any): AppError {
  if (!error) {
    return { type: 'unknown', message: 'An unexpected error occurred' }
  }

  const message = error.message || error.error_description || 'Authentication failed'
  const code = error.error || error.code

  // Common Supabase auth error codes
  switch (code) {
    case 'invalid_credentials':
    case 'invalid_grant':
      return { type: 'auth', message: 'Invalid email or password', code }
    
    case 'email_not_confirmed':
      return { type: 'auth', message: 'Please check your email and click the confirmation link', code }
    
    case 'too_many_requests':
      return { type: 'auth', message: 'Too many requests. Please wait a moment before trying again', code }
    
    case 'signup_disabled':
      return { type: 'auth', message: 'Account registration is currently disabled', code }
    
    case 'weak_password':
      return { type: 'validation', message: 'Password is too weak. Please choose a stronger password', field: 'password', code }
    
    case 'email_address_invalid':
      return { type: 'validation', message: 'Please enter a valid email address', field: 'email', code }
    
    case 'email_address_not_authorized':
      return { type: 'auth', message: 'This email address is not authorized to create an account', code }
    
    case 'user_already_registered':
      return { type: 'validation', message: 'An account with this email already exists', field: 'email', code }
    
    default:
      // Check for specific message patterns
      if (message.includes('password')) {
        return { type: 'validation', message: 'Password requirements not met', field: 'password', code }
      }
      if (message.includes('email')) {
        return { type: 'validation', message: 'Please check your email address', field: 'email', code }
      }
      if (message.includes('network') || message.includes('fetch')) {
        return { type: 'network', message: 'Network error. Please check your connection', code }
      }
      
      return { type: 'auth', message, code }
  }
}

/**
 * Parse API errors into user-friendly messages
 */
export function parseApiError(error: any): AppError {
  if (!error) {
    return { type: 'unknown', message: 'An unexpected error occurred' }
  }

  // Handle fetch errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return { type: 'network', message: 'Unable to connect to the server. Please check your internet connection.' }
  }

  // Handle HTTP response errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return { type: 'validation', message: error.message || 'Invalid request data' }
      case 401:
        return { type: 'auth', message: 'You need to sign in to continue' }
      case 403:
        return { type: 'auth', message: 'You don\'t have permission to perform this action' }
      case 404:
        return { type: 'server', message: 'The requested resource was not found' }
      case 429:
        return { type: 'server', message: 'Too many requests. Please try again later' }
      case 500:
        return { type: 'server', message: 'Server error. Please try again later' }
      default:
        return { type: 'server', message: error.message || 'Something went wrong on the server' }
    }
  }

  return { type: 'unknown', message: error.message || 'An unexpected error occurred' }
}

/**
 * Format error for display to user
 */
export function formatErrorMessage(error: AppError): string {
  return error.message
}

/**
 * Check if error should trigger a retry suggestion
 */
export function shouldRetry(error: AppError): boolean {
  return ['network', 'server'].includes(error.type)
}

/**
 * Check if error should redirect to login
 */
export function shouldRedirectToLogin(error: AppError): boolean {
  return error.type === 'auth' && (
    error.code === 'invalid_credentials' || 
    error.message.includes('sign in') ||
    error.message.includes('unauthorized')
  )
}
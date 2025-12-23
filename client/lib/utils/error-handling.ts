export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function handleApiError(error: unknown): string {
  console.error('API Error:', error);
  return parseApiError(error);
}
export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

export function handleApiError(error: unknown): void {
  console.error('API Error:', error);
  // You can extend this to add toast notifications, analytics, etc.
}
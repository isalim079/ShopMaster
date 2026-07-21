export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (!error || typeof error !== 'object') return fallback;

  const err = error as {
    data?: { message?: string };
    message?: string;
    error?: string;
  };

  return err.data?.message ?? err.message ?? err.error ?? fallback;
}

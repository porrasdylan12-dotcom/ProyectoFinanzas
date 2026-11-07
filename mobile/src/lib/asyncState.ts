export type LoadStatus = 'loading' | 'success' | 'error';

export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Ocurrió un error inesperado.');
}

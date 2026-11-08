import { ApiError } from './apiClient';

export type LoadStatus = 'loading' | 'success' | 'error';

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.isNetworkError;
}

export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Ocurrió un error inesperado.');
}

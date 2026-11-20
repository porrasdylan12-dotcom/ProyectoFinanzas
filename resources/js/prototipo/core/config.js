const apiUrl = import.meta.env?.VITE_API_URL;

export const API_BASE_URL = apiUrl || '/api';

export const TOKEN_KEY = 'finanzas.token';

export const USER_KEY = 'finanzas.user';

export const TIMEOUT_MS = 15000;

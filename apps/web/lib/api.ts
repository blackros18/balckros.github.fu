const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.message ?? 'Request failed', body);
  return body as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body: Record<string, unknown> = {}) {
    super(message);
  }
}

export type LoginResult =
  | { success: true; token: string; user: AuthUser }
  | { requiresMfa: true; mfaType: 'email_otp'; pendingToken: string }
  | { requiresMfa: true; mfaType: 'totp_enroll'; pendingToken: string }
  | { requiresMfa: true; mfaType: 'totp_verify'; pendingToken: string };

export interface AuthUser {
  id: string; email: string; role: string;
  firstName: string; lastName: string; displayName: string;
}

export const auth = {
  login: (identifier: string, password: string) =>
    request<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  verifyOtp: (pendingToken: string, otp: string) =>
    request<{ success: true; token: string; user: AuthUser }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ pendingToken, otp }) }),
  resendOtp: (pendingToken: string) =>
    request<{ message: string }>('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ pendingToken }) }),
  getTotpEnrollment: (pendingToken: string) =>
    request<{ qrDataUrl: string; secret: string }>(`/auth/totp-enrollment?pendingToken=${pendingToken}`),
  verifyTotpEnrollment: (pendingToken: string, code: string) =>
    request<{ success: true; token: string; user: AuthUser }>('/auth/verify-totp-enrollment', { method: 'POST', body: JSON.stringify({ pendingToken, code }) }),
  verifyTotp: (pendingToken: string, code: string) =>
    request<{ success: true; token: string; user: AuthUser }>('/auth/verify-totp', { method: 'POST', body: JSON.stringify({ pendingToken, code }) }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string, confirmPassword: string) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password, confirmPassword }) }),
  me: () => request<AuthUser>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
};

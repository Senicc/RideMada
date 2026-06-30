const API = import.meta.env.VITE_API_URL ?? '/api';

export type AuthUser = { id: string; name: string; role: string; phone: string };

export function getToken() {
  return localStorage.getItem('admin_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Erreur ${res.status}`);
  return data as T;
}

export const api = {
  login: (phone: string, password: string) =>
    request<{ success: boolean; accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  getStats: () => request<{ success: boolean; stats: Record<string, number> }>('/admin/statistics'),

  getUsers: () =>
    request<{ success: boolean; users: Array<Record<string, unknown>> }>('/admin/users'),

  getPendingDrivers: () =>
    request<{ success: boolean; drivers: Array<Record<string, unknown>> }>('/admin/drivers/pending'),

  approveDriver: (id: string) =>
    request(`/admin/drivers/${id}/approve`, { method: 'PUT' }),

  rejectDriver: (id: string) =>
    request(`/admin/drivers/${id}/reject`, { method: 'PUT' }),

  blockUser: (id: string) =>
    request(`/admin/block-user/${id}`, { method: 'POST' }),

  unblockUser: (id: string) =>
    request(`/admin/unblock-user/${id}`, { method: 'POST' }),

  getActiveRides: () =>
    request<{ success: boolean; rides: Array<Record<string, unknown>> }>('/admin/rides/active'),

  getPayments: () =>
    request<{ success: boolean; payments: Array<Record<string, unknown>> }>('/admin/payments'),

  getReports: () =>
    request<{ success: boolean; reports: Array<Record<string, unknown>> }>('/admin/reports'),

  resolveReport: (id: string) =>
    request(`/admin/reports/${id}/resolve`, { method: 'PUT' }),

  downloadExport: async (path: string, filename: string) => {
    const token = getToken();
    const res = await fetch(`${API}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message ?? `Erreur ${res.status}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
};

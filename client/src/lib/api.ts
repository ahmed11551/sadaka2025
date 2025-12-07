// API Configuration
// For Vercel deployment: use direct API URL or set VITE_API_BASE_URL env variable
// For local development with backend: use '/api/external' for proxy
const getDefaultApiUrl = () => {
  // In production on Vercel, use direct API (no backend proxy available)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://bot.e-replika.ru/api/v1';
  }
  // For local development, try proxy first, fallback to direct
  return '/api/external';
};

const API_BASE_URL = typeof window !== 'undefined' 
  ? (import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl())
  : (process.env.VITE_API_BASE_URL || 'https://bot.e-replika.ru/api/v1');
// Security: токен должен быть в env переменных, не захардкожен в коде
// Для тестирования используется дефолтное значение, но в production это должно быть в Vercel env vars
const API_TOKEN = import.meta.env.VITE_API_TOKEN || process.env.VITE_API_TOKEN || 'test_token_123';

export class ApiError extends Error {
  constructor(
    public status: number, 
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error messages mapping
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Неверный запрос. Проверьте введенные данные.',
  401: 'Требуется авторизация. Пожалуйста, войдите в систему.',
  403: 'Доступ запрещен. У вас нет прав для выполнения этого действия.',
  404: 'Ресурс не найден.',
  409: 'Конфликт данных. Возможно, запись уже существует.',
  422: 'Ошибка валидации данных.',
  429: 'Слишком много запросов. Попробуйте позже.',
  500: 'Внутренняя ошибка сервера. Попробуйте позже.',
  502: 'Ошибка шлюза. Сервер временно недоступен.',
  503: 'Сервис временно недоступен. Попробуйте позже.',
  504: 'Превышено время ожидания ответа сервера.',
};

function getErrorMessage(status: number, defaultMessage?: string): string {
  return ERROR_MESSAGES[status] || defaultMessage || 'Произошла ошибка. Попробуйте позже.';
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // For proxy requests, we don't need to add Authorization header
  // as the backend proxy will handle it
  const isProxyRequest = typeof window !== 'undefined' && API_BASE_URL === '/api/external';
  const url = `${API_BASE_URL}${endpoint}`;
  
  let response: Response;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };
    
    if (!isProxyRequest) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }
    
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error: any) {
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      throw new ApiError(
        0,
        'Ошибка сети. Проверьте подключение к интернету.',
        'NETWORK_ERROR',
        error
      );
    }
    throw error;
  }

  // Handle non-OK responses
  if (!response.ok) {
    // For 404, return empty data instead of throwing error
    // This allows components to show empty states gracefully
    if (response.status === 404) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          await response.json();
        } catch {
          // Ignore JSON parse errors
        }
      }
      
      // Return empty structure based on endpoint pattern
      if (endpoint.includes('/campaigns')) {
        return { data: { items: [], total: 0 }, success: true } as T;
      }
      if (endpoint.includes('/partners')) {
        return { data: { items: [], total: 0 }, success: true } as T;
      }
      if (endpoint.includes('/auth/me') || endpoint.includes('/auth/profile')) {
        return null as T;
      }
      if (endpoint.includes('/subscriptions')) {
        return { data: [], success: true } as T;
      }
      if (endpoint.includes('/history') || endpoint.includes('/reports')) {
        return { data: { items: [], total: 0 }, success: true } as T;
      }
      return { data: null, success: true } as T;
    }
    
    let errorData: any;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        const text = await response.text();
        errorData = text ? { message: text } : {};
      }
    } catch {
      errorData = {};
    }

    const errorMessage = errorData?.message || 
                        errorData?.error || 
                        getErrorMessage(response.status);
    
    const apiError = new ApiError(
      response.status,
      errorMessage,
      errorData?.code,
        errorData
      );

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    throw apiError;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    country?: string;
    city?: string;
  }) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { email: string; password: string }) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchApi('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () => fetchApi('/auth/me'),

  getProfile: () => fetchApi('/auth/profile'),

  updateProfile: (data: {
    fullName?: string;
    phone?: string;
    city?: string;
    avatar?: string;
  }) =>
    fetchApi('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) =>
    fetchApi('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Campaign API
export const campaignApi = {
  getCampaigns: (params?: {
    type?: string;
    status?: string;
    category?: string;
    urgent?: boolean;
    partnerId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      });
    }
    return fetchApi(`/campaigns?${query.toString()}`);
  },

  getCampaign: (id: string) => fetchApi(`/campaigns/${id}`),

  getCampaignBySlug: (slug: string) => fetchApi(`/campaigns/slug/${slug}`),

  createCampaign: (data: {
    title: string;
    description: string;
    fullDescription?: string;
    category: string;
    goal: number;
    type: string;
    partnerId?: string;
    deadline?: string;
    urgent?: boolean;
    image?: string;
  }) =>
    fetchApi('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCampaign: (id: string, data: Partial<{
    title: string;
    description: string;
    fullDescription: string;
    image: string;
  }>) =>
    fetchApi(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCampaign: (id: string) =>
    fetchApi(`/campaigns/${id}`, {
      method: 'DELETE',
    }),

  getUserFavorites: (page = 1, limit = 10) =>
    fetchApi(`/campaigns/favorites?page=${page}&limit=${limit}`),
};

// Donation API
export const donationApi = {
  createDonation: (data: {
    amount: number;
    currency?: string;
    type: string;
    category: string;
    anonymous?: boolean;
    comment?: string;
    paymentMethod: string;
    campaignId?: string;
    partnerId?: string;
  }) =>
    fetchApi('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUserDonations: (page = 1, limit = 10) =>
    fetchApi(`/donations/my?page=${page}&limit=${limit}`),

  getCampaignDonations: (campaignId: string, page = 1, limit = 10) =>
    fetchApi(`/donations/campaign/${campaignId}?page=${page}&limit=${limit}`),

  getUserStats: () => fetchApi('/donations/stats'),
};

// Partner API
export const partnerApi = {
  getPartners: (params?: {
    country?: string;
    city?: string;
    type?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      });
    }
    return fetchApi(`/partners?${query.toString()}`);
  },

  getPartner: (id: string) => fetchApi(`/partners/${id}`),

  getPartnerBySlug: (slug: string) => fetchApi(`/partners/slug/${slug}`),

  getPartnerCampaigns: (partnerId: string, page = 1, limit = 10) =>
    fetchApi(`/partners/${partnerId}/campaigns?page=${page}&limit=${limit}`),

  createApplication: (data: {
    orgName: string;
    country: string;
    website: string;
    email: string;
    description?: string;
    categories: string[];
    telegram: string;
  }) =>
    fetchApi('/partners/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Favorite API
export const favoriteApi = {
  toggleFavorite: (campaignId: string) =>
    fetchApi('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ campaignId }),
    }),

  getUserFavorites: () => fetchApi('/favorites'),

  checkFavorite: (campaignId: string) => fetchApi(`/favorites/${campaignId}`),
};

// Comment API
export const commentApi = {
  createComment: (data: { campaignId: string; content: string }) =>
    fetchApi('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCampaignComments: (campaignId: string, page = 1, limit = 20) =>
    fetchApi(`/comments/campaign/${campaignId}?page=${page}&limit=${limit}`),

  deleteComment: (id: string) =>
    fetchApi(`/comments/${id}`, {
      method: 'DELETE',
    }),
};

// Subscription API
export const subscriptionApi = {
  getMySubscriptions: () => fetchApi('/subscriptions/me'),

  checkout: (data: { tier: string }) =>
    fetchApi('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSubscription: (id: string, data: { action: 'pause' | 'resume' | 'cancel' }) =>
    fetchApi(`/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Zakat API
export const zakatApi = {
  calculate: (data: {
    assets: {
      cash_total?: number;
      gold_g?: number;
      silver_g?: number;
      business_goods_value?: number;
      investments?: number;
      receivables_collectible?: number;
    };
    debts_short_term?: number;
    nisab_currency?: string;
    nisab_value?: number;
    rate_percent?: number;
  }) =>
    fetchApi('/zakat/calc', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  pay: (data: {
    amount: number;
    currency?: string;
    fundId?: string;
    campaignId?: string;
  }) =>
    fetchApi('/zakat/pay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: (page = 1, limit = 10) =>
    fetchApi(`/zakat/history?page=${page}&limit=${limit}`),
};

// Funds API
export const fundsApi = {
  getFunds: (params?: {
    country?: string;
    purpose?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      });
    }
    return fetchApi(`/funds?${query.toString()}`);
  },

  getFund: (id: string) => fetchApi(`/funds/${id}`),
};

// Reports API
export const reportsApi = {
  getSummary: (params?: { period?: string }) => {
    const query = new URLSearchParams();
    if (params?.period) {
      query.append('period', params.period);
    }
    return fetchApi(`/reports/summary?${query.toString()}`);
  },

  getMyHistory: (params?: {
    type?: 'donation' | 'subscription' | 'zakat' | 'campaign';
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      });
    }
    return fetchApi(`/me/history?${query.toString()}`);
  },

  getFundReports: (params?: {
    fund_id?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      });
    }
    return fetchApi(`/reports/funds?${query.toString()}`);
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new ApiError(response.status, error.message || 'Upload failed');
    }

    const result = await response.json();
    if (result.data) {
      return result.data;
    }
    if (result.url) {
      return { url: result.url, filename: result.filename || file.name };
    }
    return result;
  },
};

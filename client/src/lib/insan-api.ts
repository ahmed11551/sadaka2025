// API клиент для работы с API фонда "Инсан"
// Документация: https://fondinsan.ru/api/v1/programs

// Use proxy in browser to avoid CORS, direct URL in SSR
const INSAN_API_BASE_URL = typeof window !== 'undefined'
  ? '/api/insan'  // Use server proxy in browser
  : (import.meta.env.VITE_INSAN_API_URL || 'https://fondinsan.ru/api/v1');  // Direct in SSR
const INSAN_ACCESS_TOKEN = import.meta.env.VITE_INSAN_ACCESS_TOKEN || '0xRs6obpvPOx4lkGLYxepBOcMju';

export interface InsanProgram {
  id: number;
  title: string;
  url: string;
  short: string;
  description: string;
  created: string;
  image: string;
  default_amount: number;
}

export interface InsanFundraising {
  id: number;
  title: string;
  description: string;
  city: string;
  location_id: string;
  category_name: string | null;
  url: string;
  short: string;
  share_text: string;
  created: string;
  unixtime: number;
  done: string;
  collect_money: number;
  end_money: number;
  default_amount: number;
  default_amount_web: number;
  collection_closing_date: string | null;
  name: string;
  sick: string;
  finish: number;
  in_priority: number; // 1 = срочно, 0 = обычный
  event_participation: boolean;
  use_of_funds: Array<{ id: string; title: string; iconUrl: string | null }>;
  files: Array<{ title: string; file: string }>;
  og_image: string;
  preview: string;
  video_url: string;
  number_of_people_helping: number;
  images: string[];
}

export interface InsanApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
}

export class InsanApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'InsanApiError';
  }
}

async function fetchInsanApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Check if token is configured
  if (!INSAN_ACCESS_TOKEN) {
    console.warn('[Insan API] VITE_INSAN_ACCESS_TOKEN not configured, skipping fetch');
    throw new InsanApiError(
      0,
      'Токен доступа к API Инсан не настроен. Проверьте переменную окружения VITE_INSAN_ACCESS_TOKEN.',
      { endpoint }
    );
  }

  // When using proxy, token is added by server
  // When direct, add token as query parameter
  const isProxyRequest = typeof window !== 'undefined' && INSAN_API_BASE_URL === '/api/insan';
  const baseUrl = isProxyRequest 
    ? `${INSAN_API_BASE_URL}${endpoint}`  // Proxy adds token automatically
    : `${INSAN_API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}access-token=${INSAN_ACCESS_TOKEN}`;
  const url = baseUrl;
  
  // Add timeout to prevent hanging (10 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  let response: Response;
  
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle timeout
    if (error.name === 'AbortError') {
      throw new InsanApiError(
        0,
        'Превышено время ожидания ответа API Инсан (10 секунд). Попробуйте позже.',
        { endpoint, error: 'TIMEOUT' }
      );
    }
    
    // Network error
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      throw new InsanApiError(
        0,
        'Ошибка сети. Проверьте подключение к интернету.',
        { endpoint, error }
      );
    }
    throw error;
  }

  // Handle non-OK responses
  if (!response.ok) {
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
                        `Ошибка API Инсан: ${response.status}`;
    
    throw new InsanApiError(
      response.status,
      errorMessage,
      { endpoint, errorData }
    );
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as T;
  }

  return response.json();
}

export const insanApi = {
  /**
   * Получить список всех программ фонда Инсан
   */
  getPrograms: async (): Promise<InsanProgram[]> => {
    try {
      const response = await fetchInsanApi<InsanApiResponse<InsanProgram[]>>('/programs');
      
      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log('[Insan API] Response:', response);
      }
      
      // Check if response has success field (expected format)
      if (response && typeof response === 'object' && 'success' in response) {
        if (!response.success) {
          console.error('[Insan API] API returned success: false', response);
          return [];
        }
        return Array.isArray(response.data) ? response.data : [];
      }
      
      // If response is directly an array (unexpected but handle gracefully)
      if (Array.isArray(response)) {
        console.warn('[Insan API] Response is array instead of object, returning directly');
        return response;
      }
      
      // If response has data field that is array
      if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        return (response as any).data;
      }
      
      console.warn('[Insan API] Unexpected response format:', response);
      return [];
    } catch (error) {
      // Log error but return empty array for graceful degradation
      console.error('[Insan API] Error fetching programs:', error);
      
      // Return empty array instead of throwing - allows UI to show empty state
      return [];
    }
  },

  /**
   * Получить программу по ID
   */
  getProgramById: async (id: number): Promise<InsanProgram | null> => {
    try {
      const response = await fetchInsanApi<InsanApiResponse<InsanProgram>>(`/program/by-id/${id}`);
      
      if (!response || typeof response !== 'object') {
        console.error('[Insan API] Invalid response format for program by ID:', response);
        return null;
      }
      
      // Check if response has success field
      if ('success' in response) {
        if (!response.success || !response.data) {
          console.error('[Insan API] API returned success: false or no data for program ID:', id);
          return null;
        }
        return response.data;
      }
      
      // If response is directly the program object
      if ('id' in response && 'title' in response) {
        return response as InsanProgram;
      }
      
      console.warn('[Insan API] Unexpected response format for program by ID:', response);
      return null;
    } catch (error) {
      // Log error but return null for graceful degradation
      console.error(`[Insan API] Error fetching program ${id}:`, error);
      return null;
    }
  },

  /**
   * Получить список активных сборов фонда Инсан
   */
  getActiveFundraisings: async (): Promise<InsanFundraising[]> => {
    try {
      const response = await fetchInsanApi<{ fundraisings: InsanFundraising[] }>('/help/active');
      
      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log('[Insan API] Active fundraisings response:', response);
      }
      
      // Check if response has fundraisings field
      if (response && typeof response === 'object' && 'fundraisings' in response) {
        return Array.isArray(response.fundraisings) ? response.fundraisings : [];
      }
      
      // If response is directly an array (unexpected but handle gracefully)
      if (Array.isArray(response)) {
        console.warn('[Insan API] Response is array instead of object, returning directly');
        return response;
      }
      
      console.warn('[Insan API] Unexpected response format for active fundraisings:', response);
      return [];
    } catch (error) {
      // Log error but return empty array for graceful degradation
      console.error('[Insan API] Error fetching active fundraisings:', error);
      
      // Return empty array instead of throwing - allows UI to show empty state
      return [];
    }
  },
};


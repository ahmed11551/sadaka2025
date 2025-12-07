// API клиент для работы с API фонда "Инсан"
// Документация: https://fondinsan.ru/api/v1/programs

const INSAN_API_BASE_URL = 'https://fondinsan.ru/api/v1';
const INSAN_ACCESS_TOKEN = '0xRs6obpvPOx4lkGLYxepBOcMju';

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
  const url = `${INSAN_API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}access-token=${INSAN_ACCESS_TOKEN}`;
  
  let response: Response;
  
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch (error: any) {
    // Network error
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      throw new InsanApiError(
        0,
        'Ошибка сети. Проверьте подключение к интернету.',
        error
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
      errorData
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
    const response = await fetchInsanApi<InsanApiResponse<InsanProgram[]>>('/programs');
    if (!response.success) {
      throw new InsanApiError(response.status, 'Не удалось получить список программ');
    }
    return response.data || [];
  },

  /**
   * Получить программу по ID
   */
  getProgramById: async (id: number): Promise<InsanProgram> => {
    const response = await fetchInsanApi<InsanApiResponse<InsanProgram>>(`/program/by-id/${id}`);
    if (!response.success) {
      throw new InsanApiError(response.status, `Не удалось получить программу с ID ${id}`);
    }
    return response.data;
  },
};


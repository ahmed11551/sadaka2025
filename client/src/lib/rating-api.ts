// Rating API - пытается получить данные из bot.e-replika.ru, если нет - использует fallback
import { fetchApi } from './api';

export interface RatingDonor {
  id: string;
  name: string;
  amount: number;
  donations: number;
  country: string;
  avatar?: string;
}

export interface RatingStats {
  totalCollected: number;
  activeDonors: number;
  totalCampaigns: number;
  completedCampaigns: number;
}

export interface TopCampaign {
  id: string;
  title: string;
  collected: number;
  goal: number;
  image?: string;
  partner?: {
    id: string;
    name: string;
  };
}

// Fallback данные (используются если API не возвращает данные)
const FALLBACK_DONORS: RatingDonor[] = [
  { id: '1', name: "Абдуллах М.", amount: 150000, donations: 12, country: "ru" },
  { id: '2', name: "Фатима К.", amount: 125000, donations: 8, country: "ru" },
  { id: '3', name: "Умар С.", amount: 98000, donations: 15, country: "uz" },
  { id: '4', name: "Аиша Б.", amount: 75000, donations: 5, country: "ru" },
  { id: '5', name: "Мухаммад А.", amount: 60000, donations: 9, country: "tr" },
];

const FALLBACK_STATS: RatingStats = {
  totalCollected: 12500000,
  activeDonors: 1240,
  totalCampaigns: 0,
  completedCampaigns: 0,
};

const FALLBACK_TOP_CAMPAIGNS: TopCampaign[] = [
  { id: '1', title: "Строительство Исламского центра в Москве", collected: 15400000, goal: 20000000 },
  { id: '2', title: "Помощь пострадавшим при землетрясении", collected: 8500000, goal: 10000000 },
  { id: '3', title: "Реконструкция исторической мечети", collected: 5200000, goal: 6000000 },
];

export const ratingApi = {
  /**
   * Получить топ доноров
   * Пытается получить из API, если нет - возвращает fallback данные
   */
  getTopDonors: async (country?: string): Promise<RatingDonor[]> => {
    try {
      const query = country ? `?country=${country}` : '';
      const response = await fetchApi<{ data: RatingDonor[] }>(`/rating/donors${query}`);
      
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error: any) {
      // 404 - это нормально, endpoint не существует, используем fallback
      if (error?.status !== 404) {
        console.warn('[Rating API] Error loading donors:', error);
      }
    }
    
    // Fallback: фильтруем по стране если указана
    if (country) {
      return FALLBACK_DONORS.filter(d => d.country === country);
    }
    return FALLBACK_DONORS;
  },

  /**
   * Получить статистику платформы
   * Пытается получить из API, если нет - возвращает fallback данные
   */
  getStats: async (): Promise<RatingStats> => {
    try {
      const response = await fetchApi<{ data: RatingStats }>('/rating/stats');
      
      if (response?.data) {
        return response.data;
      }
    } catch (error: any) {
      // 404 - это нормально, endpoint не существует, используем fallback
      if (error?.status !== 404) {
        console.warn('[Rating API] Error loading stats:', error);
      }
    }
    
    return FALLBACK_STATS;
  },

  /**
   * Получить топ сборы
   * Пытается получить из API, если нет - возвращает fallback данные
   */
  getTopCampaigns: async (country?: string): Promise<TopCampaign[]> => {
    try {
      const query = country ? `?country=${country}` : '';
      const response = await fetchApi<{ data: TopCampaign[] }>(`/rating/top-campaigns${query}`);
      
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error: any) {
      // 404 - это нормально, endpoint не существует, используем fallback
      if (error?.status !== 404) {
        console.warn('[Rating API] Error loading top campaigns:', error);
      }
    }
    
    return FALLBACK_TOP_CAMPAIGNS;
  },

  /**
   * Получить завершенные сборы
   * Пытается получить из API, если нет - возвращает fallback данные
   */
  getCompletedCampaigns: async (country?: string): Promise<TopCampaign[]> => {
    try {
      const query = country ? `?country=${country}` : '';
      const response = await fetchApi<{ data: TopCampaign[] }>(`/rating/completed-campaigns${query}`);
      
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (error: any) {
      // 404 - это нормально, endpoint не существует, используем fallback
      if (error?.status !== 404) {
        console.warn('[Rating API] Error loading completed campaigns:', error);
      }
    }
    
    // Fallback для завершенных сборов
    const fallback = [
      { id: '101', title: "Ифтар Рамадан 2024 (Казань)", collected: 500000, goal: 500000 },
      { id: '102', title: "Помощь школе №5 (Грозный)", collected: 120000, goal: 120000 },
      { id: '103', title: "Колодец в селе (Дагестан)", collected: 85000, goal: 85000 },
    ];
    
    return fallback;
  },
};

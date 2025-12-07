// Утилиты для работы с Telegram WebApp

// Расширение типов Window для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        setBackButton: (callback: () => void) => void;
        showBackButton: () => void;
        hideBackButton: () => void;
        showMainButton: () => void;
        hideMainButton: () => void;
        setMainButton: (params: {
          text: string;
          onClick: () => void;
        }) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId?: string) => void) => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
      };
    };
  }
}

/**
 * Инициализация Telegram WebApp
 * Вызывается при загрузке приложения
 */
export function initTelegramWebApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Инициализация
    tg.ready();
    tg.expand();
    
    // Включить подтверждение закрытия
    tg.enableClosingConfirmation();
    
    // Настроить цвета (цвета вашего бренда)
    tg.setHeaderColor('#3E5F43'); // Основной цвет
    tg.setBackgroundColor('#ffffff'); // Белый фон
    
    return tg;
  }
  return null;
}

/**
 * Получить данные пользователя из Telegram
 */
export function getTelegramUser() {
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }
  return null;
}

/**
 * Получить initData для проверки на сервере
 */
export function getTelegramInitData() {
  const tg = window.Telegram?.WebApp;
  return tg?.initData || '';
}

/**
 * Проверка, запущено ли приложение в Telegram
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

/**
 * Получить тему Telegram (light/dark)
 */
export function getTelegramTheme(): 'light' | 'dark' {
  const tg = window.Telegram?.WebApp;
  return tg?.colorScheme || 'light';
}

/**
 * Показать главную кнопку Telegram
 */
export function showMainButton(text: string, onClick: () => void) {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.setMainButton({
      text,
      onClick,
    });
    tg.showMainButton();
  }
}

/**
 * Скрыть главную кнопку Telegram
 */
export function hideMainButton() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.hideMainButton();
  }
}

/**
 * Показать кнопку "Назад"
 */
export function showBackButton(onClick: () => void) {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.setBackButton(onClick);
    tg.showBackButton();
  }
}

/**
 * Скрыть кнопку "Назад"
 */
export function hideBackButton() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.hideBackButton();
  }
}

/**
 * Показать алерт Telegram
 */
export function showAlert(message: string, callback?: () => void) {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.showAlert(message, callback);
  } else {
    // Fallback для браузера
    alert(message);
    if (callback) callback();
  }
}

/**
 * Показать подтверждение Telegram
 */
export function showConfirm(message: string, callback?: (confirmed: boolean) => void) {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    // Fallback для браузера
    const confirmed = confirm(message);
    if (callback) callback(confirmed);
  }
}

/**
 * Закрыть приложение
 */
export function closeTelegramWebApp() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.close();
  }
}

/**
 * Отправить данные на сервер для авторизации через Telegram
 */
export async function authenticateWithTelegram(initData: string) {
  try {
    const response = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка авторизации');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка авторизации через Telegram:', error);
    throw error;
  }
}


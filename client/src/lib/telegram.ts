declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy") => void;
        };
      };
    };
  }
}

export const getTelegramWebApp = () => {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

export const getTelegramInitData = () => {
  const webApp = getTelegramWebApp();
  return webApp?.initData || "";
};

export const getReferrerId = () => {
  const webApp = getTelegramWebApp();
  const startParam = webApp?.initDataUnsafe?.start_param;
  if (startParam) {
    const parsed = parseInt(startParam, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

export const triggerHaptic = (style: "light" | "medium" | "heavy" = "light") => {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    webApp.HapticFeedback.impactOccurred(style);
  }
};

export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
};

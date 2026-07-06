export const APP_CONFIG = {
  appName: 'AgriGrow Africa',
  version: '1.0.0',
  apiUrl: '/api',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'sw', 'fr', 'pt', 'ar'],
  currency: 'ZAR',
} as const;

export type AppConfig = typeof APP_CONFIG;

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/landing-layout/landing-layout.component').then(m => m.LandingLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
  },
  {
    path: 'app',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'farm', loadComponent: () => import('./features/my-farm/my-farm.component').then(m => m.MyFarmComponent) },
      { path: 'ai-assistant', loadComponent: () => import('./features/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent) },
      { path: 'disease-detection', loadComponent: () => import('./features/disease-detection/disease-detection.component').then(m => m.DiseaseDetectionComponent) },
      { path: 'weather', loadComponent: () => import('./features/weather/weather.component').then(m => m.WeatherComponent) },
      { path: 'crop-advisor', loadComponent: () => import('./features/crop-advisor/crop-advisor.component').then(m => m.CropAdvisorComponent) },
      { path: 'yield-forecast', loadComponent: () => import('./features/yield-forecast/yield-forecast.component').then(m => m.YieldForecastComponent) },
      { path: 'market-prices', loadComponent: () => import('./features/market-prices/market-prices.component').then(m => m.MarketPricesComponent) },
      { path: 'marketplace', loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent) },
      { path: 'planner', loadComponent: () => import('./features/planner/planner.component').then(m => m.PlannerComponent) },
      { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'community', loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'admin', loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];

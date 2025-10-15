/**
 * Route constants for the application
 * 
 * Using these constants helps prevent typos and ensures consistency
 * across the codebase when navigating between routes.
 */

export const ROUTES = {
  AUTH: '/auth',
  ONBOARDING_CHAT: '/onboarding-chat',
  CHAT: '/chat',
  DASHBOARD: '/dashboard',
  PLANNER: '/planner',
  EMAIL_VERIFICATION: '/email-verification',
  AUTH_REDIRECT: '/auth-redirect',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];

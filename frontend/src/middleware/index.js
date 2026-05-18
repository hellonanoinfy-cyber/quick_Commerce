// ===================================================
// MIDDLEWARE INDEX
// ===================================================

export {
  AuthGuard,
  GuestGuard,
  AdminGuard,
  withAuth,
  isProtectedRoute,
  isAuthRequired,
  isGuestRoute,
  isAdminRoute,
  ROUTE_CONFIG,
} from './auth-guard';

export { default as AuthGuardComponent } from './auth-guard';

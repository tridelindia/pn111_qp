import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const requiredPage = route.data['permission'];
  const requiredAction = route.data['action'];

  let permissions: any = {};
  try {
    permissions = JSON.parse(localStorage.getItem('permissions') || '{}');
  } catch (err) {
    permissions = {};
  }

  const isAuth = !!localStorage.getItem('loginTime') && !!localStorage.getItem('username');

  // If permissions is empty but user is authenticated, permit navigation
  if (isAuth && (!permissions || Object.keys(permissions).length === 0)) {
    return true;
  }

  if (permissions[requiredPage] && permissions[requiredPage].includes(requiredAction)) {
    return true;
  }

  // Handle Analysis vs Analytics synonyms
  if (requiredPage === 'Analytics' && permissions['Analysis']?.includes(requiredAction)) {
    return true;
  }
  if (requiredPage === 'Analysis' && permissions['Analytics']?.includes(requiredAction)) {
    return true;
  }

  console.warn(`Access denied to ${requiredPage}: missing ${requiredAction} permission.`);
  if (isAuth && requiredPage !== 'Home') {
    return router.parseUrl('/base/home');
  }
  return router.parseUrl('/login');
};
 
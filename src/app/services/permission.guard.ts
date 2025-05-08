import { CanActivateFn, Router } from '@angular/router';

export const permissionGuard: CanActivateFn = (route, state) => {
  const requiredPage = route.data['permission'];
  const requiredAction = route.data['action'];

  const permissions = JSON.parse(localStorage.getItem('permissions') || '{}');

  if (permissions[requiredPage] && permissions[requiredPage].includes(requiredAction)) {
    return true;
  }

  return false;
};


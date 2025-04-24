import { CanActivateFn, Router } from '@angular/router';

export const permissionGuard: CanActivateFn = (route, state) => {
  
  const requiredPermission = route.data['permission'];
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  return permissions.includes(requiredPermission);
  
};

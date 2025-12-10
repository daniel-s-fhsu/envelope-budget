import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuthUser } from './firebase-implementation';

export const authGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const user = await getAuthUser();
  if (user) return true;
  await router.navigate(['/login'], { queryParams: { redirect: state.url } });
  return false;
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingServiceService } from '../_services/loading-service.service';
import { delay, finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingServiceService);
  loadingService.showLoader();
  return next(req).pipe(
    delay(1000),
    finalize(() => {
      loadingService.hideLoader();
    })
  );
};

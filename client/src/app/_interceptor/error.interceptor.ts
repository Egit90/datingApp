import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toaster = inject(ToastrService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err) {
        switch (err.status) {
          case 400:
            if (err.error.errors) {
              const modelStateErrors = [];

              for (const key in err.error.errors) {
                if (err.error.errors[key]) {
                  modelStateErrors.push(err.error.errors[key]);
                }
              }
              throw modelStateErrors.flat();
            } else {
              toaster.error(err.error, err.status.toString());
            }
            break;

          case 401:
            toaster.error('unauthorized', err.status.toString());
            break;

          case 404:
            router.navigateByUrl('/not-found');
            break;

          case 500:
            const navigationExtras: NavigationExtras = {
              state: { error: err.error },
            };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            toaster.error('Something went wrong');
            console.log(err);
            break;
        }
      }
      throw err;
    })
  );
};

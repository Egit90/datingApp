import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';

export function getPaginatedResults<T>(url: string, params: HttpParams, http: HttpClient) {
  const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();

  return http.get<T>(url, { observe: 'response', params }).pipe(
    map((resp) => {
      if (resp.body) {
        paginatedResult.result = resp.body;
      }
      const pagination = resp.headers.get('Pagination');
      if (pagination) {
        paginatedResult.pagination = JSON.parse(pagination);
      }
      return paginatedResult;
    })
  );
}

export function getPaginationHeaders(page: number, itemsPerPage: number) {
  let params = new HttpParams();
  params = params.append('pageNumber', page);
  params = params.append('pageSize', itemsPerPage);
  return params;
}

import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Member } from '../_models/member';
import { map, of, take } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { User } from '../_models/user';
import { getPaginatedResults, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private http: HttpClient = inject(HttpClient);
  private accountService = inject(AccountService);
  private baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User | undefined;
  userParams: UserParams | undefined;

  constructor() {
    this.accountService.currentUser$.pipe().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.userParams = new UserParams(user);
        }
      },
    });
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    return (this.userParams = params);
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMembers(userParams: UserParams) {
    const response = this.memberCache.get(Object.values(userParams).join('-'));

    if (response) {
      return of(response);
    }

    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
    // if (this.members.length > 0) return of(this.members);
    return getPaginatedResults<Member[]>(this.baseUrl + 'users', params, this.http).pipe(
      map((response) => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        return response;
      })
    );
  }

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicates: string, pageNumbe: number, pageSize: number) {
    let params = getPaginationHeaders(pageNumbe, pageSize);
    params = params.append('predicate', predicates);

    return getPaginatedResults<Member[]>(this.baseUrl + 'likes', params, this.http);
  }

  getMember(name: string) {
    const member = [...this.memberCache.values()].reduce((arr, elem) => arr.concat(elem.result), []).find((mem: Member) => mem.username === name);
    if (member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + name);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = { ...this.members[index], ...member };
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + `${photoId}`, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + `${photoId}`);
  }
}

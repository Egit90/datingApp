import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_models/user';
import { LoginModel } from '../_models/loginModel';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {}

  login(modle: LoginModel) {
    return this.http.post<User>(this.baseUrl + 'account/login', modle).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  register(model: LoginModel) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map((res: User) => {
        if (res) {
          this.setCurrentUser(res);
        }
      })
    );
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedTocken(user.token).role;

    Array.isArray(roles) ? (user.roles = roles) : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  getDecodedTocken(token: string) {
    let userToken = token.split('.')[1];
    let role = atob(userToken);
    return JSON.parse(role);
  }
}

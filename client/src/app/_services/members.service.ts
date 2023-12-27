import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '../_models/member';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  members: Member[] = [];
  constructor() {}

  getMembers() {
    if (this.members.length > 0) return of(this.members);
    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
      map((member) => {
        this.members = member;
        return this.members;
      })
    );
  }

  getMember(name: string) {
    const member = this.members.find((x) => (x.username = name));
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
}

import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private toaster = inject(ToastrService);
  private router = inject(Router);

  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  public onlineUsers$ = this.onlineUsersSource.asObservable();

  createHubConnection(user: User) {
    debugger;
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', { accessTokenFactory: () => user.token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((err) => {
      console.log(err);
    });

    this.hubConnection.on('UserIsOnline', (usename) => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: (usernames) => this.onlineUsersSource.next([...usernames, usename]),
      });
    });

    this.hubConnection.on('UserIsOffline', (usename) => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: (usernames) => this.onlineUsersSource.next(usernames.filter((x) => x !== usename)),
      });
    });

    this.hubConnection.on('GetOnlineUser', (usenames) => {
      this.onlineUsersSource.next(usenames);
    });

    this.hubConnection.on('NewMessageReceived', ({ username, knownAs }) => {
      this.toaster
        .info(knownAs + ' has sent you a new message')
        .onTap.pipe(take(1))
        .subscribe({
          next: () => this.router.navigateByUrl('/messages/' + username),
        });
    });
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch((err) => console.log(err));
  }
}

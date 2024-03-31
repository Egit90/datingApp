import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { getPaginatedResults, getPaginationHeaders } from './paginationHelper';
import { Message } from '../_models/messages';
import { MessagesUsers } from '../_models/MessagesUsers';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private hubUrl = environment.hubUrl;
  private hubConntion?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  public messageThread$ = this.messageThreadSource.asObservable();

  createHubConnection(user: User, otherUserName: string) {
    this.hubConntion = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUserName, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConntion.start().catch((err) => console.log(err));

    this.hubConntion.on('ReceiveMessageThread', (messages) => {
      this.messageThreadSource.next(messages);
    });

    this.hubConntion.on('NewMessaage', (message) => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: (messages) => {
          this.messageThreadSource.next([...messages, message]);
        },
      });
    });
  }

  stopHubConnection() {
    if (this.hubConntion) {
      this.hubConntion.stop();
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResults<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessagesUsers(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    return getPaginatedResults<MessagesUsers[]>(this.baseUrl + 'messages/summary', params, this.http);
  }

  getMessageThread(pageNumber: number, pageSize: number, username: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    return getPaginatedResults<Message[]>(this.baseUrl + 'messages/thread/' + username, params, this.http);
  }

  async sendMessage(RecipientUserName: string, Content: string) {
    return this.hubConntion?.invoke('SendMessage', { RecipientUserName, Content }).catch((err) => console.log(err));
  }
}

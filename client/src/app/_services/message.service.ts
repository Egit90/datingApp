import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { getPaginatedResults, getPaginationHeaders } from './paginationHelper';
import { Message } from '../_models/messages';
import { MessagesUsers } from '../_models/MessagesUsers';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() {}

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

  sendMessage(RecipientUserName: string, Content: string) {
    const rt = { RecipientUserName: RecipientUserName.toLowerCase(), Content };
    return this.http.post(this.baseUrl + 'messages', rt);
  }
}

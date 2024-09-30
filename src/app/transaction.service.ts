// src/app/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Transaction } from './models/transaction.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = environment.apiUrl;
  private transacaoAdicionadaSource = new BehaviorSubject<boolean>(false);
  transacaoAdicionada$ = this.transacaoAdicionadaSource.asObservable();

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/list`);
  }

  cadastraTransaction(transacao: Transaction): Observable<Transaction[]> {
    return this.http.post<Transaction[]>(`${this.apiUrl}/add`, transacao);
  }

  notificarTransacaoAdicionada() {
    this.transacaoAdicionadaSource.next(true);
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

}
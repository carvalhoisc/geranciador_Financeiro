import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonLabel, IonAccordion, IonItem, IonAccordionGroup, IonIcon, IonFabButton, IonFab, IonRefresherContent, IonInput, IonList, IonSpinner, IonLoading, IonButton, IonDatetimeButton, IonModal, IonDatetime } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TransactionService } from '../transaction.service';
import { add, saveOutline, heart, returnDownBackOutline } from 'ionicons/icons';
import { BaseComponent } from '../base.component';
import { addIcons } from 'ionicons';
import { Transaction } from '../models/transaction.model';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Platform } from '@ionic/angular';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  providers: [
  ],
  imports: [IonDatetime, IonModal, IonDatetimeButton, IonButton, IonLoading, IonSpinner, IonList, IonInput, IonRefresherContent, IonFab, IonFabButton, IonIcon, IonAccordionGroup, IonItem, IonAccordion, IonLabel, IonRefresher, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, FormsModule, CommonModule,MatSlideToggleModule],
})
export class Tab1Page extends BaseComponent {
  transacoes: Transaction[] = [];
  telaCadastro: Boolean = false;
  isLoading: boolean = false;
  backButtonSubscription: any;
  novaTransacao: Transaction = {
    _id: '',
    descricao: '',
    valor: 0,
    tipo: 0,
    data: ''
  };

  constructor(private transactionService: TransactionService, private platform: Platform, spinner: NgxSpinnerService) {
    addIcons({add,saveOutline,returnDownBackOutline,heart});
    super(spinner);
  }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.isTelaCadastro(false);
    });

    this.buscaTransacoes();
  }

  onDateChange(event: any) {
    const selectedDate = new Date(event.detail.value); 
    
    selectedDate.setHours(selectedDate.getHours() - 3);
  
    this.novaTransacao.data = selectedDate.toISOString();
  }

  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      this.isTelaCadastro(false);  
    });
  }

  ionViewWillLeave() {
    this.backButtonSubscription.unsubscribe();
  }

  handleRefresh(event: any) {
    this.buscaTransacoes().then(() => {
      event.target.complete();
    }).catch(() => {
      event.target.complete();
    });
  }
  
  async buscaTransacoes() {
    this.bloqueiaTela();
    return new Promise<void>((resolve, reject) => {
      this.transactionService.getTransactions().subscribe({
        next: (data) => {
          this.desbloqueiaTela();
          this.transacoes = data.filter((transacao) => transacao.tipo === 0);
          resolve(); 
        },
        error: (error) => {
          this.desbloqueiaTela();
          console.error('Erro ao buscar transações', error);
          reject(error);  
        }
      });
    });
  }
  
  async cadastraTransacao() {  
    this.bloqueiaTela();
    this.transactionService.cadastraTransaction(this.novaTransacao).subscribe({
      next: (response) => {
        this.desbloqueiaTela();
        this.novaTransacao = { _id: '', descricao: '', valor: 0, tipo: 0, data: '' }; 
        this.buscaTransacoes();
        this.isTelaCadastro(false);
      },
      error: (error) => {
        this.desbloqueiaTela();
        console.error('Erro ao cadastrar transação:', error.message);
      }
    });
  }  
  
  isTelaCadastro(condicao: Boolean){
    this.telaCadastro = condicao;
    if(condicao){
      this.novaTransacao.descricao = '',
      this.novaTransacao.valor = 0
    }
  }
}
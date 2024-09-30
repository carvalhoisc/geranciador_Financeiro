import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAccordionGroup, IonAccordion, IonItem, IonFabButton, IonLabel, IonFab, IonIcon, IonList, IonInput, IonRefresherContent, IonRefresher, IonDatetimeButton, IonModal, IonDatetime } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TransactionService } from '../transaction.service';
import { addIcons } from 'ionicons';
import { add, saveOutline, returnDownBackOutline } from 'ionicons/icons';
import { BaseComponent } from '../base.component';
import { Transaction } from '../models/transaction.model';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonModal, IonDatetimeButton, IonRefresher, IonRefresherContent, IonInput, IonList, IonIcon, IonFab, IonLabel, IonFabButton, IonItem, IonAccordion, IonAccordionGroup, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, FormsModule, CommonModule]
})
export class Tab2Page extends BaseComponent {
  transacoes: Transaction[] = [];
  telaCadastro: Boolean = false;
  loading: HTMLIonLoadingElement | null = null;
  backButtonSubscription: any;
  novaTransacao: Transaction = {
    _id: '',
    descricao: '',
    valor: 0,
    tipo: 1,
    data: ''
  };

  constructor(
    private transactionService: TransactionService, 
    private loadingCtrl: LoadingController, 
    private platform: Platform,
    spinner: NgxSpinnerService) {
    addIcons({add,saveOutline,returnDownBackOutline});
    super(spinner)
  }

  ngOnInit() {
    this.buscaTransacoes();
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
          this.transacoes = data.filter((transacao) => transacao.tipo === 1);
          this.transactionService.notificarTransacaoAdicionada(); 
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

  onDateChange(event: any) {
    const selectedDate = new Date(event.detail.value); 
    
    selectedDate.setHours(selectedDate.getHours() - 3);
  
    this.novaTransacao.data = selectedDate.toISOString();
  }

  async cadastraTransacao() { 
    this.bloqueiaTela(); 
    this.transactionService.cadastraTransaction(this.novaTransacao).subscribe({
      next: (response) => {
        this.desbloqueiaTela();
        this.novaTransacao = { _id: '', descricao: '', valor: 0, tipo: 1, data: '' }; 
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
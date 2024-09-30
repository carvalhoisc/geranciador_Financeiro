import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonRefresher, IonRefresherContent, IonIcon, IonButton, IonActionSheet, IonInput, IonDatetimeButton, IonDatetime, IonModal } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../transaction.service';
import { BaseComponent } from '../base.component';
import { Transaction } from '../models/transaction.model';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonModal, IonDatetime, IonDatetimeButton, IonInput, IonActionSheet, IonButton, IonIcon, IonRefresherContent, IonRefresher, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonAccordion, IonItem, IonLabel, IonAccordionGroup, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, CommonModule],
})
export class Tab3Page extends BaseComponent{
  transacoes: Transaction[] = [];
  transacoesFiltradas: Transaction[] = []; // Lista de transações filtradas
  isActionSheetOpen = false;
  idTransacaoAremover: string = '';
  filtroIsSelected = false;
  public actionSheetButtons = [
    {
      text: 'Sim',
      role: 'destructive',
      data: {
        action: 'delete',
      },
      handler: () => {
        this.deletarTransacao(this.idTransacaoAremover); 
      }
    },
    {
      text: 'Não',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(
    private transactionService: TransactionService,
    spinner: NgxSpinnerService) {
      super(spinner);
      addIcons({trashOutline});
  }

  ngOnInit() {
    this.buscaTransacoes().then(() => {
      this.filtrarTransacoesPorMes({ detail: { value: moment().format('YYYY-MM') } });
    });
  
    this.transactionService.transacaoAdicionada$.subscribe((novaTransacaoAdicionada) => {
      if (novaTransacaoAdicionada) {
        this.buscaTransacoes().then(() => {
          this.filtrarTransacoesPorMes({ detail: { value: moment().format('YYYY-MM') } });
        });
      }
    });
  }

  handleRefresh(event: any) {
    this.buscaTransacoes().then(() => {
      event.target.complete();
    }).catch(() => {
      event.target.complete();
    });
  }
  
  changeButtonFilter(condition: any){
    this.filtroIsSelected = condition;
  }

  setOpen(isOpen: boolean, transacaoId: string) {
    this.isActionSheetOpen = isOpen;
    this.idTransacaoAremover = transacaoId;
    console.log(this.idTransacaoAremover)
  }

  async deletarTransacao(transcaoId: string) {
    try {
      this.bloqueiaTela();
      await this.transactionService.deleteTransaction(transcaoId).toPromise();
      this.desbloqueiaTela();
      this.buscaTransacoes();
    } catch (error) {
      this.desbloqueiaTela();
      console.error('Erro ao deletar transação', error);
    }
  }

  async buscaTransacoes() {
    this.bloqueiaTela();
    return new Promise<void>((resolve, reject) => {
      this.transactionService.getTransactions().subscribe({
        next: (data) => {
          this.desbloqueiaTela();
          this.transacoes = data;
          this.transacoesFiltradas = data; 
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

  filtrarTransacoesPorMes(event: any) {
    const dataSelecionada = event.detail.value;
    const mesSelecionado = moment(dataSelecionada);

    this.transacoesFiltradas = this.transacoes.filter(transacao => {
      const dataTransacao = moment(transacao.data);
      return (
        dataTransacao.year() === mesSelecionado.year() && 
        dataTransacao.month() === mesSelecionado.month()
      );
    });
  }

  somaEntradas(): number {
    let valorTotal = 0; 
    this.transacoesFiltradas.forEach((transacao) => {
      if (transacao.tipo === 0) {
        valorTotal += transacao.valor; 
      }
    });
    return valorTotal; 
  }

  somaSaidas(): number {
    let valorTotal = 0; 
    this.transacoesFiltradas.forEach((transacao) => {
      if (transacao.tipo === 1) {
        valorTotal += transacao.valor; 
      }
    });
    return valorTotal; 
  }

  somaSaldoLiquido(): number {
    let entradas = 0;
    let saidas = 0;
    let saldoLiquido = 0;

    this.transacoesFiltradas.forEach((transacao) => {
      if (transacao.tipo === 0) entradas += Math.round(transacao.valor * 100); 
      else saidas += Math.round(transacao.valor * 100);
    });

    saldoLiquido = entradas - saidas;
    return saldoLiquido / 100;
  }
}
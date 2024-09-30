import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NgxSpinnerModule } from "ngx-spinner";
import { provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NgxSpinnerModule],
  providers: [provideNgxMask()]
})
export class AppComponent {
  constructor() {}
}

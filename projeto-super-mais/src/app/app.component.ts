
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LoginPopupComponent } from './components/login-popup/login-popup.component';
import { LoginPopupService } from './services/login-popup.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoginPopupComponent
  ],
  template: `
    <router-outlet />

    @if (loginPopup.aberto()) {
      <app-login-popup
        (fechar)="loginPopup.fechar()"
      />
    }
  `,
})
export class AppComponent {

  loginPopup = inject(LoginPopupService);

}

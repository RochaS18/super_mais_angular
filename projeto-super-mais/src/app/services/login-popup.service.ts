
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginPopupService {

  aberto = signal(false);

  abrir(): void {
    this.aberto.set(true);
  }

  fechar(): void {
    this.aberto.set(false);
  }

}

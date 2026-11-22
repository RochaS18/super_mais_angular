
import { Component, inject, computed, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';
import { LoginPopupService } from '../../services/login-popup.service';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
  selector: 'app-cabecalho',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cabecalho.component.html',
  styleUrl: './cabecalho.component.css',
})
export class CabecalhoComponent {

  private carrinho = inject(CarrinhoService);
  private loginPopup = inject(LoginPopupService);
  private auth = inject(AutenticacaoService);
  private router = inject(Router);

  // Usuário logado (null = ninguém) e se ele é administrador
  usuario = this.auth.usuarioLogado;
  ehAdmin = this.auth.ehAdmin;
  primeiroNome = computed(() => (this.usuario()?.nome ?? '').split(' ')[0]);

  // Envia o texto pesquisado para a página atual.
  buscaAlterada = output<string>();

  quantidadeCarrinho = computed(() =>
    this.carrinho.itens().reduce(
      (total, item) => total + item.quantidade,
      0
    )
  );

  totalCarrinho = computed(() =>
    this.carrinho.itens().reduce(
      (total, item) => total + item.preco * item.quantidade,
      0
    )
  );

  pesquisar(evento: Event, termo: string): void {
    evento.preventDefault();
    this.buscaAlterada.emit(termo.trim());
  }

  // Sem login: abre o pop-up global de Login. Logado: encerra a sessão.
  acaoUsuario(evento: Event): void {
    evento.preventDefault();
    if (this.usuario()) {
      this.auth.sair();
      this.router.navigate(['/']);
    } else {
      this.loginPopup.abrir();
    }
  }

}


import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
  selector: 'app-login-popup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-popup.component.html',
  styleUrl: './login-popup.component.css'
})
export class LoginPopupComponent {

  private auth = inject(AutenticacaoService);
  private router = inject(Router);

  @Output() fechar = new EventEmitter<void>();

  // Controle das telas
  mostrarCadastro = false;

  // Controle da senha
  mostrarSenha = false;

  // Dados do Login
  email = '';
  senha = '';

  // Dados do Cadastro
  nome = '';
  emailCadastro = '';
  senhaCadastro = '';
  confirmarSenha = '';

  // Fecha o pop-up
  fecharPopup(): void {
    this.fechar.emit();
  }

  // Fecha ao pressionar ESC
  @HostListener('document:keydown.escape')
  pressionarEsc(): void {
    this.fecharPopup();
  }

  // Alterna entre Login e Cadastro
  abrirCadastro(evento: Event): void {
    evento.preventDefault();
    this.mostrarCadastro = true;
  }

  voltarLogin(evento: Event): void {
    evento.preventDefault();
    this.mostrarCadastro = false;
  }

  // Mostra ou oculta a senha
  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  // Recuperação de senha (sem funcionalidade no PI)
  esqueciSenha(evento: Event): void {
    evento.preventDefault();
  }

  // Realiza o Login
  fazerLogin(): void {

    const emailDigitado = this.email.trim();
    const senhaDigitada = this.senha.trim();

    if (!emailDigitado || !senhaDigitada) {
      alert('Preencha o e-mail e a senha.');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(emailDigitado)) {
      alert('Digite um e-mail válido.');
      return;
    }

    // A API confere o e-mail e a senha (inclusive os do administrador)
    this.auth.login(emailDigitado, senhaDigitada).subscribe({
      next: (sessao) => {
        alert('Login realizado com sucesso!');
        this.fecharPopup();

        // Administrador vai para o painel; usuário comum continua na área normal
        if (sessao.usuario.perfil === 'admin') {
          this.router.navigate(['/administracao']);
        }
      },
      error: (erro: HttpErrorResponse) => alert(this.mensagemDeErro(erro))
    });
  }

  // Realiza o Cadastro
  criarConta(): void {

    const nomeDigitado = this.nome.trim();
    const emailDigitado = this.emailCadastro.trim();

    if (!nomeDigitado) {
      alert('Digite seu nome completo.');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(emailDigitado)) {
      alert('Digite um e-mail válido.');
      return;
    }

    if (this.senhaCadastro.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (this.senhaCadastro !== this.confirmarSenha) {
      alert('As senhas não são iguais.');
      return;
    }

    // A API grava o novo usuário em db.json
    this.auth.cadastrar(nomeDigitado, emailDigitado, this.senhaCadastro).subscribe({
      next: () => {
        alert('Conta criada com sucesso!');

        // Leva o e-mail para a tela de Login
        this.email = emailDigitado;

        // Limpa os campos do cadastro
        this.nome = '';
        this.emailCadastro = '';
        this.senhaCadastro = '';
        this.confirmarSenha = '';

        this.mostrarCadastro = false;
      },
      error: (erro: HttpErrorResponse) => alert(this.mensagemDeErro(erro))
    });
  }

  // Texto do alerta quando a API devolve erro
  private mensagemDeErro(erro: HttpErrorResponse): string {
    if (erro.status === 0) {
      return 'Não foi possível conectar à API. Verifique se ela está rodando (npm run api).';
    }
    return erro.error?.mensagem ?? 'Ocorreu um erro. Tente novamente.';
  }

}

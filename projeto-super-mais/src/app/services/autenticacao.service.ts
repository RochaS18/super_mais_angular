import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Sessao, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {

  private http = inject(HttpClient);

  private readonly API = 'http://localhost:3000';
  private readonly CHAVE = 'supermais_sessao';

  // Quem está logado (null = ninguém). Começa lendo o que ficou salvo no navegador.
  sessao = signal<Sessao | null>(this.lerSessaoSalva());

  usuarioLogado = computed(() => this.sessao()?.usuario ?? null);
  ehAdmin = computed(() => this.sessao()?.usuario.perfil === 'admin');

  // POST /login -> a API confere e-mail e senha e devolve o token
  login(email: string, senha: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.API}/login`, { email, senha }).pipe(
      tap(sessao => this.guardarSessao(sessao))
    );
  }

  // POST /usuarios -> cadastro de um usuário comum
  cadastrar(nome: string, email: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.API}/usuarios`, { nome, email, senha });
  }

  // Avisa a API e limpa a sessão do navegador
  sair(): void {
    if (this.sessao()) {
      this.http.post(`${this.API}/logout`, {}, { headers: this.cabecalhos() }).subscribe({
        error: () => { }
      });
    }
    this.encerrarSessaoLocal();
  }

  encerrarSessaoLocal(): void {
    this.sessao.set(null);
    try {
      localStorage.removeItem(this.CHAVE);
    } catch { }
  }

  // Cabeçalho "Authorization: Bearer <token>" que a API exige nas rotas do administrador
  cabecalhos(): HttpHeaders {
    const token = this.sessao()?.token;
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private guardarSessao(sessao: Sessao): void {
    this.sessao.set(sessao);
    try {
      localStorage.setItem(this.CHAVE, JSON.stringify(sessao));
    } catch { }
  }

  private lerSessaoSalva(): Sessao | null {
    try {
      const texto = localStorage.getItem(this.CHAVE);
      if (!texto) {
        return null;
      }
      const sessao = JSON.parse(texto);
      return sessao?.token && sessao?.usuario ? sessao : null;
    } catch {
      return null;
    }
  }
}

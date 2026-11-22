import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto.model';
import { AutenticacaoService } from './autenticacao.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {

  // Endereço da API (json-server rodando na porta 3000)
  private readonly API = 'http://localhost:3000/produtos';

  // Injeção do cliente HTTP e do serviço de autenticação (fornece o token do administrador)
  constructor(private http: HttpClient, private auth: AutenticacaoService) { }

  // GET /produtos
  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.API);
  }

  // GET /produtos?secao=Doces
  listarPorSecao(secao: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.API}?secao=${encodeURIComponent(secao)}`);
  }

  // Mantido com o mesmo nome de antes, mas agora vem da API (retorna Observable)
  listarDoces(): Observable<Produto[]> {
    return this.listarPorSecao('Doces');
  }

  // GET /produtos/:id
  buscarPorId(id: number | string): Observable<Produto> {
    return this.http.get<Produto>(`${this.API}/${id}`);
  }

  // POST /produtos (somente administrador)
  incluir(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.API, produto, { headers: this.auth.cabecalhos() });
  }

  // PUT /produtos/:id (somente administrador)
  editar(produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.API}/${produto.id}`, produto, { headers: this.auth.cabecalhos() });
  }

  // DELETE /produtos/:id (somente administrador)
  excluir(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`, { headers: this.auth.cabecalhos() });
  }

}

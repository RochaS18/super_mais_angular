import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { AutenticacaoService } from './autenticacao.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private readonly API = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient, private auth: AutenticacaoService) { }

  // GET /usuarios (somente administrador)
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API, { headers: this.auth.cabecalhos() });
  }

  // DELETE /usuarios/:id (somente administrador)
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`, { headers: this.auth.cabecalhos() });
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AutenticacaoService } from './autenticacao.service';
export interface ItemCarrinho { id: string; nome: string; preco: number; imagem: string; quantidade: number; }
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private http = inject(HttpClient);
  private auth = inject(AutenticacaoService);
  readonly itens = signal<ItemCarrinho[]>(this.carregar());
  private carregar(): ItemCarrinho[] { try { return JSON.parse(localStorage.getItem('supermais-carrinho-angular') || '[]'); } catch { return []; } }
  adicionar(item: Omit<ItemCarrinho, 'quantidade'>) {
    const atual = this.itens(); const existente = atual.find(x => x.id === item.id);
    this.salvar(existente ? atual.map(x => x.id === item.id ? { ...x, quantidade: x.quantidade + 1 } : x) : [...atual, { ...item, quantidade: 1 }]);
    this.registrarNaApi(item.id);
  }

  // Avisa a API que o usuário logado colocou mais 1 unidade deste produto no carrinho.
  // A API guarda o nome do usuário e do produto em backend/dados/historicos/historico-carrinho.json.
  // Se o visitante não estiver logado, ou a API estiver fora do ar, o carrinho continua funcionando normalmente.
  private registrarNaApi(produtoId: string) {
    if (!this.auth.usuarioLogado()) { return; }
    this.http.post('http://localhost:3000/historico-carrinho', { produtoId, quantidade: 1 }, { headers: this.auth.cabecalhos() })
      .subscribe({ error: (erro) => { if (erro.status === 401) { this.auth.encerrarSessaoLocal(); } } });
  }

  remover(id: string) { this.salvar(this.itens().filter(x => x.id !== id)); }
  private salvar(itens: ItemCarrinho[]) { this.itens.set(itens); localStorage.setItem('supermais-carrinho-angular', JSON.stringify(itens)); }
  aumentar(id: string) {
    const atualizados = this.itens().map(item =>
      item.id === id
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    );

    this.salvar(atualizados);
    this.registrarNaApi(id);
  }

  diminuir(id: string) {
    const atualizados = this.itens().map(item =>
      item.id === id
        ? { ...item, quantidade: Math.max(1, item.quantidade - 1) }
        : item
    );

    this.salvar(atualizados);
  }

  limpar() {
    this.salvar([]);
  }


}

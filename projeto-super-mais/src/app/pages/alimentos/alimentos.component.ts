
import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { BarraSuperiorComponent } from '../../components/barra-superior/barra-superior.component';
import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { SecaoProdutosComponent } from '../../components/secao-produtos/secao-produtos.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';

import { ProdutosService } from '../../services/produtos.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-page-alimentos',
  standalone: true,
  imports: [
    BarraSuperiorComponent,
    CabecalhoComponent,
    MenuComponent,
    BannerComponent,
    SecaoProdutosComponent,
    RodapeComponent
  ],
  templateUrl: './alimentos.component.html'
})
export class AlimentosPageComponent implements OnInit {

  private produtosService = inject(ProdutosService);

  // Lista de produtos vinda da API (começa vazia e é preenchida no ngOnInit)
  produtos = signal<Produto[]>([]);

  // Guarda o texto digitado na pesquisa.
  busca = signal('');

  // Filtra os alimentos conforme o texto digitado.
  produtosFiltrados = computed(() => {

    const termo = this.busca().toLocaleLowerCase('pt-BR');

    if (!termo) {
      return this.produtos();
    }

    return this.produtos().filter(produto =>
      produto.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
      produto.marca.toLocaleLowerCase('pt-BR').includes(termo)
    );

  });

  // Ao abrir a página, busca os produtos na API de forma assíncrona
  ngOnInit(): void {
    this.produtosService.listarPorSecao('Alimentos').subscribe({
      next: (lista) => this.produtos.set(lista),
      error: () => alert('Não foi possível carregar os produtos. Verifique se a API (json-server) está rodando.')
    });
  }

  // Recebe o texto enviado pelo cabeçalho.
  pesquisar(termo: string): void {
    this.busca.set(termo);
  }

}

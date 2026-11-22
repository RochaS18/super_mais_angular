import { Component, Input } from '@angular/core';
import { Produto } from '../../models/produto.model';
import { ProdutoComponent } from '../produto/produto.component';
@Component({ selector: 'app-secao-produtos', standalone: true, imports: [ProdutoComponent], templateUrl: './secao-produtos.component.html', styleUrl: './secao-produtos.component.css' })
export class SecaoProdutosComponent {
    @Input() categoria = "doces";
    @Input({ required: true }) titulo!: string;
    @Input() produtos: Produto[] = [];
    ordenacao = 'geral';
    get produtosExibidos(): Produto[] {
        let itens = [...this.produtos];
        if (this.categoria === 'doces' && this.ordenacao !== 'geral') {
            itens = itens.filter(p => {
                const nome = p.nome.toLocaleLowerCase('pt-BR');
                if (this.ordenacao === 'sobremesas') return /bolo|brownie|confeito|granulado/.test(nome);
                if (this.ordenacao === 'guloseimas') return /bala|fini|mentos|halls|marshmallow|chiclete|pirulito/.test(nome);
                if (this.ordenacao === 'doces') return !/bolo|brownie|confeito|granulado|bala|fini|mentos|halls|marshmallow|chiclete|pirulito/.test(nome);
                return true;
            });
        }
        if (this.ordenacao === 'menor') return itens.sort((a, b) => a.preco - b.preco);
        if (this.ordenacao === 'maior') return itens.sort((a, b) => b.preco - a.preco);
        return itens;
    }
    alterarOrdenacao(event: Event) { this.ordenacao = (event.target as HTMLSelectElement).value; }
}

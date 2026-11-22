import { ProdutosService } from '../../services/produtos.service';
import { ProdutoComponent } from '../produto/produto.component';
import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { Produto } from '../../models/produto.model';
import { CurrencyPipe } from '@angular/common';
import { CarrinhoService } from '../../services/carrinho.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
    selector: 'app-carrinho-main',
    standalone: true,
    imports: [CurrencyPipe, RouterLink, ProdutoComponent],
    templateUrl: './carrinho-main.component.html',
    styleUrl: './carrinho-main.component.css'
})
export class CarrinhoMainComponent implements OnInit {

    carrinho = inject(CarrinhoService);

    produtosService = inject(ProdutosService);

    // Sugestões de doces: começa vazia e é preenchida com os dados da API
    sugestoes: Produto[] = [];

    ngOnInit(): void {
        this.produtosService.listarDoces().subscribe({
            next: (lista) => this.sugestoes = lista.slice(0, 4)
        });
    }

    itens = this.carrinho.itens;

    private router = inject(Router);

    quantidadeTotal = computed(() =>
        this.itens().reduce(
            (total, item) => total + item.quantidade,
            0
        )
    );

    subtotal = computed(() =>
        this.itens().reduce(
            (total, item) => total + item.preco * item.quantidade,
            0
        )
    );

    frete = computed(() => {
        if (this.subtotal() === 0 || this.subtotal() >= 200) {
            return 0;
        }

        return 12.90;
    });

    // CUPOM DE DESCONTO
    cupomDigitado = signal('');

    desconto = computed(() => {
        return this.cupomDigitado().trim().toUpperCase() === 'MERCADO6'
            && this.subtotal() >= 50
            ? 6
            : 0;
    });

    // TOTAL DO PEDIDO
    total = computed(() =>
        this.subtotal() - this.desconto() + this.frete()
    );

    // MÉTODOS DO CARRINHO
    removerProduto(id: string) {
        this.carrinho.remover(id);
    }

    aumentarQuantidade(id: string) {
        this.carrinho.aumentar(id);
    }

    diminuirQuantidade(id: string) {
        this.carrinho.diminuir(id);
    }

    limparCarrinho() {
        this.carrinho.limpar();
        this.cupomDigitado.set('');
    }

    // APLICAR CUPOM
    aplicarCupom(codigo: string) {
        this.cupomDigitado.set(codigo);
    }

    irParaPagamento() {
  this.router.navigate(['/pagamento']);
}

}

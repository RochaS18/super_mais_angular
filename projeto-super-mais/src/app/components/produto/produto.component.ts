
import { Component, Input, inject, OnDestroy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Produto } from '../../models/produto.model';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-produto',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './produto.component.html',
  styleUrl: './produto.component.css',
})
export class ProdutoComponent implements OnDestroy {
  @Input() categoria = 'doces';
  @Input({ required: true }) produto!: Produto;

  private carrinhoService = inject(CarrinhoService);

  produtoAdicionado = false;
  private temporizador?: ReturnType<typeof setTimeout>;

  adicionarAoCarrinho(): void {
    if (this.produtoAdicionado) return;

    this.carrinhoService.adicionar({
      id: String(this.produto.id),
      nome: this.produto.nome,
      preco: this.produto.preco,
      imagem: this.produto.imagem
    });

    this.produtoAdicionado = true;

    this.temporizador = setTimeout(() => {
      this.produtoAdicionado = false;
      this.temporizador = undefined;
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }
  }
}

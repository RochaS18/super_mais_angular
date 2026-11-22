import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface ItemMenu {
  rotulo: string;
  rota: string;
  icone: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  itens: ItemMenu[] = [
    { rotulo: 'Início',     rota: '/inicio',     icone: '/original/icone/inicio_icone.png' },
    { rotulo: 'Ofertas',    rota: '/ofertas',    icone: '/original/icone/oferta_icone.png' },
    { rotulo: 'Categorias', rota: '/inicio',     icone: '/original/icone/categoria_icone.png' },
    { rotulo: 'Cartões',    rota: '/cartoes',    icone: '/original/icone/cartao_icone.png' },
    { rotulo: 'Contato',    rota: '/contato',    icone: '/original/icone/contato_icone.png' },
  ];
}

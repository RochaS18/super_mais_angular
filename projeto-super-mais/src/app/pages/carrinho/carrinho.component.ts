import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../../components/barra-superior/barra-superior.component';
import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { CarrinhoTopoAvisoComponent } from '../../components/carrinho-topo-aviso/carrinho-topo-aviso.component';
import { CarrinhoMainComponent } from '../../components/carrinho-main/carrinho-main.component';
import { CarrinhoRodapeComponent } from '../../components/carrinho-rodape/carrinho-rodape.component';
@Component({selector:'app-page-carrinho',standalone:true,imports:[BarraSuperiorComponent,CabecalhoComponent,MenuComponent,RodapeComponent,CarrinhoTopoAvisoComponent,CarrinhoMainComponent,CarrinhoRodapeComponent],templateUrl:'./carrinho.component.html'})
export class CarrinhoPageComponent {}

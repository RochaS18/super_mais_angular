import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../../components/barra-superior/barra-superior.component';
import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { ContatoPaginaContatoComponent } from '../../components/contato-pagina-contato/contato-pagina-contato.component';
import { ContatoBottomSectionComponent } from '../../components/contato-bottom-section/contato-bottom-section.component';
import { ContatoCarrinhoFundoComponent } from '../../components/contato-carrinho-fundo/contato-carrinho-fundo.component';
@Component({selector:'app-page-contato',standalone:true,imports:[BarraSuperiorComponent,CabecalhoComponent,MenuComponent,RodapeComponent,ContatoPaginaContatoComponent,ContatoBottomSectionComponent,ContatoCarrinhoFundoComponent],templateUrl:'./contato.component.html',styleUrl:'./contato.component.css'})
export class ContatoPageComponent {}

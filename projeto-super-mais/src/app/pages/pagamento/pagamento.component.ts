import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../../components/barra-superior/barra-superior.component';
import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { PagamentoPaginaPagamentoComponent } from '../../components/pagamento-pagina-pagamento/pagamento-pagina-pagamento.component';
import { PagamentoBottomSectionComponent } from '../../components/pagamento-bottom-section/pagamento-bottom-section.component';
import { PagamentoModalPagamentoComponent } from '../../components/pagamento-modal-pagamento/pagamento-modal-pagamento.component';
@Component({selector:'app-page-pagamento',standalone:true,imports:[BarraSuperiorComponent,CabecalhoComponent,MenuComponent,RodapeComponent,PagamentoPaginaPagamentoComponent,PagamentoBottomSectionComponent,PagamentoModalPagamentoComponent],templateUrl:'./pagamento.component.html',styleUrl:'./pagamento.component.css'})
export class PagamentoPageComponent {}

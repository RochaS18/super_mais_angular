import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../../components/barra-superior/barra-superior.component';
import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { AdministracaoAdmShellComponent } from '../../components/administracao-adm-shell/administracao-adm-shell.component';
@Component({selector:'app-page-administracao',standalone:true,imports:[BarraSuperiorComponent,CabecalhoComponent,MenuComponent,RodapeComponent,AdministracaoAdmShellComponent],templateUrl:'./administracao.component.html',styleUrl:'./administracao.component.css'})
export class AdministracaoPageComponent {}

import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../../components/barra-superior/barra-superior.component';
import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { InicioCategoriesComponent } from '../../components/inicio-categories/inicio-categories.component';
import { InicioBottomSectionComponent } from '../../components/inicio-bottom-section/inicio-bottom-section.component';
import { InicioProductsComponent } from '../../components/inicio-products/inicio-products.component';
@Component({selector:'app-page-inicio',standalone:true,imports:[BarraSuperiorComponent,CabecalhoComponent,MenuComponent,RodapeComponent,InicioCategoriesComponent,InicioBottomSectionComponent,InicioProductsComponent],templateUrl:'./inicio.component.html',styleUrl:'./inicio.component.css'})
export class InicioPageComponent {}

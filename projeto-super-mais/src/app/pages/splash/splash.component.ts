import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../../components/barra-superior/barra-superior.component';
import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { SplashHeroSectionComponent } from '../../components/splash-hero-section/splash-hero-section.component';
import { SplashCategoriesComponent } from '../../components/splash-categories/splash-categories.component';
import { SplashBottomSectionComponent } from '../../components/splash-bottom-section/splash-bottom-section.component';
import { SplashProductsComponent } from '../../components/splash-products/splash-products.component';
@Component({selector:'app-page-splash',standalone:true,imports:[BarraSuperiorComponent,CabecalhoComponent,MenuComponent,RodapeComponent,SplashHeroSectionComponent,SplashCategoriesComponent,SplashBottomSectionComponent,SplashProductsComponent],templateUrl:'./splash.component.html',styleUrl:'./splash.component.css'})
export class SplashPageComponent {}

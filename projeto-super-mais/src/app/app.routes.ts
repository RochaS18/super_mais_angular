import { Routes } from '@angular/router';
import { PaginaDocesComponent } from './pages/doces/doces.component';
import { InicioPageComponent } from './pages/inicio/inicio.component';
import { AlimentosPageComponent } from './pages/alimentos/alimentos.component';
import { FerramentasPageComponent } from './pages/ferramentas/ferramentas.component';
import { HigienePageComponent } from './pages/higiene/higiene.component';
import { CarrinhoPageComponent } from './pages/carrinho/carrinho.component';
import { PagamentoPageComponent } from './pages/pagamento/pagamento.component';
import { ContatoPageComponent } from './pages/contato/contato.component';
import { AdministracaoPageComponent } from './pages/administracao/administracao.component';
import { SplashPageComponent } from './pages/splash/splash.component';



export const routes: Routes = [
  {path:'',component:InicioPageComponent},
  {path:'alimentos',component:AlimentosPageComponent},
  {path:'ferramentas',component:FerramentasPageComponent},
  {path:'higiene',component:HigienePageComponent},
  {path:'carrinho',component:CarrinhoPageComponent},
  {path:'pagamento',component:PagamentoPageComponent},
  {path:'contato',component:ContatoPageComponent},
  {path:'administracao',component:AdministracaoPageComponent},
  {path:'splash',component:SplashPageComponent},
  {path:'doces',component:PaginaDocesComponent},
  {path:'**',redirectTo:''}
  
];

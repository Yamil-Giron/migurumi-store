import { Routes } from '@angular/router';
import { Inicio } from './paginas/inicio/inicio';
import { Catalogo } from './paginas/catalogo/catalogo';
import { Contacto } from './paginas/contacto/contacto';
import { SobreNosotros } from './paginas/sobre-nosotros/sobre-nosotros';
import { CarritoDeCompras } from './paginas/carrito-de-compras/carrito-de-compras';
import { PerfilUsuario } from './paginas/perfil-usuario/perfil-usuario';
import { Login } from './paginas/login/login';
import { Registro } from './paginas/registro/registro';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'tienda', component: Catalogo },
  { path: 'contacto', component: Contacto },
  { path: 'nosotros', component: SobreNosotros },
  { path: 'carrito', component: CarritoDeCompras },
  { path: 'perfil', component: PerfilUsuario },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: '**', redirectTo: '' },
];
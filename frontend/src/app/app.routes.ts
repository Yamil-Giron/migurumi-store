import { Routes } from '@angular/router';
import { Inicio } from './paginas/inicio/inicio';
import { Catalogo } from './paginas/catalogo/catalogo';
import { Contacto } from './paginas/contacto/contacto';
import { SobreNosotros } from './paginas/sobre-nosotros/sobre-nosotros';
import { CarritoDeCompras } from './paginas/carrito-de-compras/carrito-de-compras';
import { PerfilUsuario } from './paginas/perfil-usuario/perfil-usuario';
import { Login } from './paginas/login/login';
import { Registro } from './paginas/registro/registro';
import { GestionProductos } from './administracion/gestion-productos/gestion-productos';
import { adminGuard } from './guards/admin.guard';
import { ProductoDetalle } from './paginas/producto-detalle/producto-detalle';
import { GestionCategorias } from './administracion/gestion-categorias/gestion-categorias';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'tienda', component: Catalogo },
  { path: 'contacto', component: Contacto },
  { path: 'producto/:slug', component: ProductoDetalle },
  { path: 'nosotros', component: SobreNosotros },
  { path: 'carrito', component: CarritoDeCompras },
  { path: 'perfil', component: PerfilUsuario },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  {
    path: 'admin/gestion-productos',
    component: GestionProductos,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/gestion-categorias',
    component: GestionCategorias,
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '' },
];
import { Routes } from '@angular/router';
import { Inicio } from './paginas/inicio/inicio';
import { Catalogo } from './paginas/catalogo/catalogo';
import { Contacto } from './paginas/contacto/contacto';
import { SobreNosotros } from './paginas/sobre-nosotros/sobre-nosotros';
import { CarritoDeCompras } from './paginas/carrito-de-compras/carrito-de-compras';
import { PerfilUsuario } from './paginas/perfil-usuario/perfil-usuario';

export const routes: Routes = [
  { path: '', component: Inicio },                // Página principal
  { path: 'tienda', component: Catalogo },        // Catálogo de productos
  { path: 'contacto', component: Contacto },      // Página de contacto
  { path: 'nosotros', component: SobreNosotros }, // Sobre nosotros
  { path: 'carrito', component: CarritoDeCompras }, // Carrito de compras
  { path: 'perfil', component: PerfilUsuario },   // Perfil de usuario
  { path: '**', redirectTo: '' }                 // Ruta comodín (404 → Inicio)
];
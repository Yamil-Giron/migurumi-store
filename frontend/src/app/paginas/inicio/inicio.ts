import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../servicios/producto.model';
import { ProductoCard } from '../../nucleo/producto-card/producto-card';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductoCard],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
export class Inicio implements OnInit {
  private productoService = inject(ProductoService);

  productosDestacados = signal<Producto[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  galeriaClientes = [
    { nombre: 'Amigurumi 1', img: 'assets/galeria/personalizado1.png' },
    { nombre: 'Amigurumi 2', img: 'assets/galeria/personalizado2.png' },
    { nombre: 'Amigurumi 3', img: 'assets/galeria/personalizado3.jpg' },
    { nombre: 'Amigurumi 4', img: 'assets/galeria/personalizado4.jpg' },
    { nombre: 'Amigurumi 5', img: 'assets/galeria/personalizado5.jpg' },
    { nombre: 'Amigurumi 6', img: 'assets/galeria/personalizado6.png' },
  ];

  ngOnInit(): void {
    this.productoService.getProductos({ destacado: true }).subscribe({
      next: (productos) => {
        this.productosDestacados.set(productos.slice(0, 4));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando destacados:', err);
        this.productoService.getProductos().subscribe({
          next: (todos) => {
            this.productosDestacados.set(todos.slice(0, 4));
            this.cargando.set(false);
          },
          error: () => {
            this.error.set('No se pudieron cargar los productos');
            this.cargando.set(false);
          },
        });
      },
    });
  }

  getCategoriaNombre(p: Producto): string {
    if (typeof p.categoriaId === 'object' && p.categoriaId !== null) {
      return p.categoriaId.nombre;
    }
    return '';
  }
}
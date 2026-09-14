import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../servicios/producto.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
export class Inicio implements OnInit {
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  productosDestacados: Producto[] = [];
  cargando = true;
  error: string | null = null;

  galeriaClientes = [
    { nombre: 'Conejita', img: 'assets/galeria/coneja.png' },
    { nombre: 'Rana', img: 'assets/galeria/rana.png' },
    { nombre: 'León', img: 'assets/galeria/leon.png' },
    { nombre: 'Elefante', img: 'assets/galeria/elefante.png' },
    { nombre: 'Perrito', img: 'assets/galeria/perrito.png' },
    { nombre: 'Cerdito', img: 'assets/galeria/cerdito.png' }
  ];

  ngOnInit(): void {
    this.productoService.getProductos({ destacado: true }).subscribe({
      next: (productos) => {
        this.productosDestacados = productos.slice(0, 4);
        this.cargando = false;
        this.cdr.detectChanges();  // ← Forzar re-render
      },
      error: (err) => {
        console.error('Error cargando destacados:', err);
        // Fallback: cargar todos
        this.productoService.getProductos().subscribe({
          next: (todos) => {
            this.productosDestacados = todos.slice(0, 4);
            this.cargando = false;
            this.cdr.detectChanges();  // ← Forzar re-render
          },
          error: () => {
            this.error = 'No se pudieron cargar los productos';
            this.cargando = false;
            this.cdr.detectChanges();  // ← Forzar re-render
          }
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
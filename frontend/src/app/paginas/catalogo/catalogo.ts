import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../servicios/producto.model';
import { CarritoService } from '../../servicios/carrito.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
})
export class Catalogo implements OnInit {
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);

  productos = signal<Producto[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  cargando = signal(true);
  error = signal('');
  terminoBusqueda = signal('');

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando.set(true);
    this.error.set('');

    this.productoService.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos.set(data);
        this.productosFiltrados.set(data);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('[Catalogo] Error:', err);
        this.error.set('Error al cargar los productos. Intenta nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  buscar(): void {
    const termino = this.terminoBusqueda().toLowerCase().trim();

    if (!termino) {
      this.productosFiltrados.set(this.productos());
      return;
    }

    const filtrados = this.productos().filter((p) => {
      const nombre = p.nombre?.toLowerCase() ?? '';
      const descripcion = p.descripcion?.toLowerCase() ?? '';
      const categoria =
        typeof p.categoriaId === 'object'
          ? (p.categoriaId?.nombre?.toLowerCase() ?? '')
          : '';

      return (
        nombre.includes(termino) ||
        descripcion.includes(termino) ||
        categoria.includes(termino)
      );
    });

    this.productosFiltrados.set(filtrados);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
    this.productosFiltrados.set(this.productos());
  }

  nombreCategoria(producto: Producto): string {
    if (!producto.categoriaId) return '—';
    if (typeof producto.categoriaId === 'object') {
      return producto.categoriaId.nombre ?? '—';
    }
    return '—';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio ?? 0);
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto);
    console.log('Producto agregado al carrito:', producto.nombre);
  }
}
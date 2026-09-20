import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../servicios/producto.model';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
})
export class Catalogo implements OnInit {
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  cargando = true;
  error = '';
  terminoBusqueda = '';

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';

    this.productoService.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.productosFiltrados = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('[Catalogo] Error:', err);
        this.error = 'Error al cargar los productos. Intenta nuevamente.';
        this.cargando = false;
      },
    });
  }

  buscar(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();

    if (!termino) {
      this.productosFiltrados = this.productos;
      return;
    }

    this.productosFiltrados = this.productos.filter((p) => {
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
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.productosFiltrados = this.productos;
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
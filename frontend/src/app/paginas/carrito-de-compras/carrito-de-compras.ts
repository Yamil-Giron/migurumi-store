import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../servicios/carrito.service';

@Component({
  selector: 'app-carrito-de-compras',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito-de-compras.html',
  styleUrls: ['./carrito-de-compras.css'],
})
export class CarritoDeCompras {
  private carritoService = inject(CarritoService);

  items = this.carritoService.items;
  subtotal = this.carritoService.subtotal;
  cantidadTotal = this.carritoService.cantidadTotal;

  // Envío gratis a partir de $20.000, si no $1.500
  costoEnvio = computed(() => {
    const sub = this.subtotal();
    if (sub === 0) return 0;
    return sub >= 20000 ? 0 : 1500;
  });

  total = computed(() => this.subtotal() + this.costoEnvio());

  aumentar(item: ItemCarrito): void {
    this.carritoService.actualizarCantidad(item.id, item.cantidad + 1);
  }

  disminuir(item: ItemCarrito): void {
    this.carritoService.actualizarCantidad(item.id, item.cantidad - 1);
  }

  quitar(item: ItemCarrito): void {
    if (!confirm(`¿Quitar "${item.nombre}" del carrito?`)) return;
    this.carritoService.eliminarItem(item.id);
  }

  vaciar(): void {
    if (!confirm('¿Vaciar todo el carrito?')) return;
    this.carritoService.vaciarCarrito();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio ?? 0);
  }
}
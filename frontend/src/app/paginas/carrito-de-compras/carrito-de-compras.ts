import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../servicios/carrito.service';
import { PedidoService } from '../../servicios/pedido.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-carrito-de-compras',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito-de-compras.html',
  styleUrls: ['./carrito-de-compras.css'],
})
export class CarritoDeCompras {
  private carritoService = inject(CarritoService);
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  items = this.carritoService.items;
  subtotal = this.carritoService.subtotal;
  cantidadTotal = this.carritoService.cantidadTotal;

  procesando = signal(false);
  errorPedido = signal<string | null>(null);
  pedidoConfirmado = signal<{ numeroPedido: string } | null>(null);

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

  hacerPedido(): void {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.errorPedido.set(null);
    this.procesando.set(true);

    const payload = {
      items: this.items().map((i) => ({
        productoId: i.productoId,
        varianteId: i.variante?.varianteId ?? null,
        nombre: i.nombre,
        precioUnitario: i.precioUnitario,
        cantidad: i.cantidad,
      })),
      subtotal: this.subtotal(),
      costoEnvio: this.costoEnvio(),
      total: this.total(),
    };

    this.pedidoService.crearPedido(payload as any).subscribe({
      next: (pedido) => {
        this.procesando.set(false);
        this.pedidoConfirmado.set({ numeroPedido: pedido.numeroPedido! });
        this.carritoService.vaciarCarrito();
      },
      error: (err) => {
        this.procesando.set(false);
        this.errorPedido.set(err.error?.error ?? 'No se pudo realizar el pedido');
      },
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio ?? 0);
  }
}
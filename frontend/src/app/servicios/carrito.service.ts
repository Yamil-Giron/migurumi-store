// src/app/servicios/carrito.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from './producto.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private platformId = inject(PLATFORM_ID);

  private items: Producto[] = [];
  private carritoSubject = new BehaviorSubject<Producto[]>([]);

  /** Observable del carrito (compatibilidad) */
  getCarrito(): Observable<Producto[]> {
    return this.carritoSubject.asObservable();
  }

  /** Cantidad total de items (para el badge del header) */
  get cantidadTotal(): number {
    return this.items.length;
  }

  /** Alias de agregarProducto (compatibilidad con producto-card) */
  agregar(producto: Producto, cantidad = 1): void {
    this.agregarProducto(producto);
  }

  agregarProducto(producto: Producto): void {
    this.items.push(producto);
    this.carritoSubject.next([...this.items]);
    this.guardarLocal();
  }

  eliminarProducto(index: number): void {
    this.items.splice(index, 1);
    this.carritoSubject.next([...this.items]);
    this.guardarLocal();
  }

  quitar(productoId: string): void {
    this.items = this.items.filter((p) => p._id !== productoId);
    this.carritoSubject.next([...this.items]);
    this.guardarLocal();
  }

  vaciarCarrito(): void {
    this.items = [];
    this.carritoSubject.next([]);
    this.guardarLocal();
  }

  getTotal(): number {
    return this.items.reduce((total, p) => total + p.precio, 0);
  }

  private guardarLocal(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('migurumi_carrito', JSON.stringify(this.items));
    }
  }
}
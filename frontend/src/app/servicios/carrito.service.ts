// src/app/servicios/carrito.service.ts
import { Injectable } from '@angular/core';
import { Producto } from './producto.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: Producto[] = [];
  private carritoSubject = new BehaviorSubject<Producto[]>([]);

  getCarrito(): Observable<Producto[]> {
    return this.carritoSubject.asObservable();
  }

  agregarProducto(producto: Producto): void {
    this.items.push(producto);
    this.carritoSubject.next(this.items);
  }

  eliminarProducto(index: number): void {
    this.items.splice(index, 1);
    this.carritoSubject.next(this.items);
  }

  vaciarCarrito(): void {
    this.items = [];
    this.carritoSubject.next(this.items);
  }

  getTotal(): number {
    return this.items.reduce((total, p) => total + p.precio, 0);
  }
}
import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from './producto.model';

export interface VarianteSeleccionada {
  varianteId: string;
  color: string;
  medida: string;
  precioExtra: number;
}

export interface ItemCarrito {
  id: string;
  productoId: string;
  nombre: string;
  slug: string;
  imagenUrl: string;
  precioUnitario: number;
  cantidad: number;
  variante?: VarianteSeleccionada;
  stockDisponible: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private platformId = inject(PLATFORM_ID);
  private storageKey = 'migurumi_carrito';

  items = signal<ItemCarrito[]>(this.leerStorage());

  cantidadTotal = computed(() =>
    this.items().reduce((acc, i) => acc + i.cantidad, 0)
  );

  subtotal = computed(() =>
    this.items().reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  );

  agregarProducto(
    producto: Producto,
    cantidad: number = 1,
    variante?: VarianteSeleccionada
  ): void {
    if (!producto._id) return;

    const precioUnitario = producto.precio + (variante?.precioExtra ?? 0);
    const stockDisponible = this.getStockDisponible(producto, variante);
    if (stockDisponible <= 0) return;

    const actuales = this.items();
    const indexExistente = actuales.findIndex(
      (item) =>
        item.productoId === producto._id &&
        (item.variante?.varianteId ?? null) === (variante?.varianteId ?? null)
    );

    if (indexExistente >= 0) {
      const existente = actuales[indexExistente];
      const nuevaCantidad = Math.min(
        existente.cantidad + cantidad,
        existente.stockDisponible
      );
      const nuevos = [...actuales];
      nuevos[indexExistente] = { ...existente, cantidad: nuevaCantidad };
      this.items.set(nuevos);
    } else {
      const nuevoItem: ItemCarrito = {
        id: this.generarId(),
        productoId: producto._id,
        nombre: producto.nombre,
        slug: producto.slug,
        imagenUrl: producto.imagenesUrl?.[0] ?? 'assets/placeholder.png',
        precioUnitario,
        cantidad: Math.min(cantidad, stockDisponible),
        variante,
        stockDisponible,
      };
      this.items.set([...actuales, nuevoItem]);
    }

    this.guardarStorage();
  }

  actualizarCantidad(itemId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminarItem(itemId);
      return;
    }
    const nuevos = this.items().map((item) =>
      item.id === itemId
        ? { ...item, cantidad: Math.min(cantidad, item.stockDisponible) }
        : item
    );
    this.items.set(nuevos);
    this.guardarStorage();
  }

  eliminarItem(itemId: string): void {
    this.items.set(this.items().filter((i) => i.id !== itemId));
    this.guardarStorage();
  }

  vaciarCarrito(): void {
    this.items.set([]);
    this.guardarStorage();
  }

  private getStockDisponible(
    producto: Producto,
    variante?: VarianteSeleccionada
  ): number {
    if (variante) {
      const v = producto.variantes?.find((x) => x._id === variante.varianteId);
      return v?.stock ?? 0;
    }
    return producto.stock ?? 0;
  }

  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private guardarStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
  }

  private leerStorage(): ItemCarrito[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
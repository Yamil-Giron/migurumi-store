import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Producto } from '../../servicios/producto.model';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './producto-card.html',
  styleUrls: ['./producto-card.css'],
})
export class ProductoCard {
  @Input({ required: true }) producto!: Producto;
  @Input() variante: 'compacto' | 'completo' = 'completo';
  @Input() mostrarBoton = true;

  private carrito = inject(CarritoService);
  private cdr = inject(ChangeDetectorRef);

  get categoriaNombre(): string {
    const c = this.producto.categoriaId;
    if (typeof c === 'object' && c !== null) {
      return c.nombre;
    }
    return '';
  }

  get imagenPortada(): string {
    return this.producto.imagenesUrl?.[0] || 'assets/placeholder.png';
  }

  get precioFormateado(): string {
    return '$' + this.producto.precio.toLocaleString('es-CL');
  }

  onImagenError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholder.png';
  }

  agregarAlCarrito(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.carrito.agregar(this.producto);
    this.cdr.detectChanges();
  }
}
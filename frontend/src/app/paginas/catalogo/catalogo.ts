import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService, Producto } from '../../servicios/producto.service';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css']
})
export class Catalogo implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  error = '';

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef   // ← NUEVO
  ) { }

  ngOnInit(): void {
    console.log('[Catalogo] ngOnInit ejecutado');
    this.productoService.getProductos().subscribe({
      next: (data: Producto[]) => {
        console.log('[Catalogo] NEXT recibido. Cantidad:', data?.length);
        this.productos = data;
        this.cargando = false;
        console.log('[Catalogo] cargando =', this.cargando, '| productos =', this.productos.length);
        this.cdr.detectChanges();   // ← fuerza redibujado inmediato
      },
      error: (err: any) => {
        console.error('[Catalogo] ERROR:', err);
        this.error = 'Error al cargar los productos. Intenta nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto);
    console.log('Producto agregado al carrito:', producto.nombre);
  }
}
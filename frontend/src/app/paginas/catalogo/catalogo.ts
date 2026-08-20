import { Component, OnInit } from '@angular/core';
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
    private carritoService: CarritoService  // ← Inyecta el servicio
  ) { }

  ngOnInit(): void {
    this.productoService.getProductos().subscribe({
      next: (data: Producto[]) => {  // ← Añadir tipo
        this.productos = data;
        this.cargando = false;
      },
      error: (err: any) => {        // ← Añadir tipo
        this.error = 'Error al cargar los productos. Intenta nuevamente.';
        this.cargando = false;
        console.error('Error:', err);
      }
    });
  }

  // 🆕 Método agregar al carrito
  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto);
    console.log('Producto agregado al carrito:', producto.nombre);
    // Opcional: mostrar un mensaje o notificación
    // alert(`¡${producto.nombre} agregado al carrito!`);
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../servicios/producto.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  private productoService = inject(ProductoService);
  productos: Producto[] = [];
  cargando = true;
  error: string | null = null;

  ngOnInit(): void {
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        console.log('✅ Productos recibidos:', productos);
        this.productos = productos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error = 'No se pudieron cargar los productos';
        this.cargando = false;
      }
    });
  }
}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-encabezado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './encabezado.componente.html',
  styleUrls: ['./encabezado.componente.css'],
})
export class EncabezadoComponente {
  auth = inject(AuthService);
  carrito = inject(CarritoService);
}
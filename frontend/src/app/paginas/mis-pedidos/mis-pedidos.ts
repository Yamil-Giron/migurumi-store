import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../servicios/pedido.service';
import { EnvioService } from '../../servicios/envio.service';
import { Pedido } from '../../servicios/pedido.model';
import { Envio } from '../../servicios/envio.model';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-pedidos.html',
  styleUrls: ['./mis-pedidos.css'],
})
export class MisPedidos implements OnInit {
  private pedidoService = inject(PedidoService);
  private envioService = inject(EnvioService);

  pedidos = signal<Pedido[]>([]);
  enviosPorPedido = signal<Record<string, Envio>>({});
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.pedidoService.getMisPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.envioService.getMisEnvios().subscribe({
          next: (envios) => {
            const mapa: Record<string, Envio> = {};
            envios.forEach((e) => (mapa[e.pedidoId] = e));
            this.enviosPorPedido.set(mapa);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false),
        });
      },
      error: () => {
        this.error.set('No se pudieron cargar tus pedidos');
        this.cargando.set(false);
      },
    });
  }

  envioDe(pedido: Pedido): Envio | null {
    return pedido._id ? this.enviosPorPedido()[pedido._id] ?? null : null;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio ?? 0);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  claseEstado(estado?: string): string {
    return `estado-badge estado-${estado ?? 'pendiente'}`;
  }
}
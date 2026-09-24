import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../servicios/pedido.service';
import { EnvioService } from '../../servicios/envio.service';
import { Pedido } from '../../servicios/pedido.model';
import { Envio } from '../../servicios/envio.model';
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminNav],
  templateUrl: './gestion-pedidos.html',
  styleUrls: ['./gestion-pedidos.css'],
})
export class GestionPedidos implements OnInit {
  private pedidoService = inject(PedidoService);
  private envioService = inject(EnvioService);

  pedidos = signal<Pedido[]>([]);
  enviosPorPedido = signal<Record<string, Envio>>({});
  cargando = signal(false);
  error = signal('');
  actualizandoId = signal<string | null>(null);

  transportistas = ['Bluexpress', 'Starken', 'Chilexpress', 'Correos de Chile'];

  estadosPedido = [
    { valor: 'pendiente', label: 'Pendiente' },
    { valor: 'confirmado', label: 'Confirmado' },
    { valor: 'en_preparacion', label: 'En preparación' },
    { valor: 'cancelado', label: 'Cancelado' },
  ];

  estadosEnvio = [
    { valor: 'preparando', label: 'Preparando' },
    { valor: 'despachado', label: 'Despachado' },
    { valor: 'en_transito', label: 'En tránsito' },
    { valor: 'entregado', label: 'Entregado' },
  ];

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.cargando.set(true);
    this.error.set('');

    this.pedidoService.getPedidosAdmin().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.envioService.getTodos().subscribe({
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
        this.error.set('No se pudieron cargar los pedidos');
        this.cargando.set(false);
      },
    });
  }

  envioDe(pedido: Pedido): Envio | null {
    return pedido._id ? this.enviosPorPedido()[pedido._id] ?? null : null;
  }

  cambiarEstadoPedido(pedido: Pedido, nuevoEstado: string): void {
    if (!pedido._id || nuevoEstado === pedido.estado) return;
    this.actualizandoId.set(pedido._id);
    this.pedidoService.actualizarEstado(pedido._id, nuevoEstado).subscribe({
      next: (actualizado) => {
        this.pedidos.update((lista) => lista.map((p) => (p._id === actualizado._id ? actualizado : p)));
        this.actualizandoId.set(null);
      },
      error: () => {
        alert('No se pudo actualizar el estado');
        this.actualizandoId.set(null);
      },
    });
  }

  crearEnvio(pedido: Pedido, transportista: string, numeroSeguimiento: string): void {
    if (!pedido._id || !transportista || !numeroSeguimiento) {
      alert('Completa transportista y número de seguimiento');
      return;
    }
    this.actualizandoId.set(pedido._id);
    this.envioService.crearEnvio(pedido._id, transportista, numeroSeguimiento).subscribe({
      next: (envio) => {
        this.enviosPorPedido.update((mapa) => ({ ...mapa, [envio.pedidoId]: envio }));
        this.pedidos.update((lista) =>
          lista.map((p) => (p._id === pedido._id ? { ...p, estado: 'enviado' } : p))
        );
        this.actualizandoId.set(null);
      },
      error: (err) => {
        alert(err.error?.error ?? 'No se pudo crear el envío');
        this.actualizandoId.set(null);
      },
    });
  }

  cambiarEstadoEnvio(envio: Envio, nuevoEstado: string): void {
    if (!envio._id) return;
    this.actualizandoId.set(envio._id);
    this.envioService.actualizarEstado(envio._id, nuevoEstado).subscribe({
      next: (actualizado) => {
        this.enviosPorPedido.update((mapa) => ({ ...mapa, [actualizado.pedidoId]: actualizado }));
        if (nuevoEstado === 'entregado') {
          this.pedidos.update((lista) =>
            lista.map((p) => (p._id === actualizado.pedidoId ? { ...p, estado: 'entregado' } : p))
          );
        }
        this.actualizandoId.set(null);
      },
      error: () => {
        alert('No se pudo actualizar el envío');
        this.actualizandoId.set(null);
      },
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio ?? 0);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  claseEstado(estado?: string): string {
    return `estado-badge estado-${estado ?? 'pendiente'}`;
  }
}
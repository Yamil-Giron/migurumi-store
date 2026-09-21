import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PedidoPersonalizadoService } from '../../servicios/pedido-personalizado.service';
import { PedidoPersonalizado as PedidoPersonalizadoModel } from '../../servicios/pedido-personalizado.model';
import { AuthService } from '../../servicios/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pedido-personalizado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pedido-personalizado.html',
  styleUrls: ['./pedido-personalizado.css'],
})
export class PedidoPersonalizado implements OnInit {
  private fb = inject(FormBuilder);
  private pedidoService = inject(PedidoPersonalizadoService);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  // Cloudinary
  private cloudName = (environment as any).cloudinaryCloudName || '';
  private uploadPreset = (environment as any).cloudinaryUploadPreset || '';

  // Estado
  enviando = signal(false);
  exito = signal(false);
  numeroPedidoCreado = signal<string>('');
  error = signal('');

  // Imágenes subidas
  imagenes = signal<string[]>([]);
  maxImagenes = 5;

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    coloresInput: [''],
    colores: [[] as string[]],
    tamanosInput: [''],
    tamanos: [[] as string[]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    presupuestoCliente: [null],
    envioTipo: ['cotizar', Validators.required],
    calle: [''],
    ciudad: [''],
    region: [''],
    codigoPostal: [''],
  });

  ngOnInit(): void {
    // Pre-llenar datos si está logueado
    const usuario = this.auth.getUsuarioActual();
    if (usuario) {
      this.form.patchValue({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono ?? '',
        calle: usuario.direccion?.calle ?? '',
        ciudad: usuario.direccion?.ciudad ?? '',
        region: usuario.direccion?.region ?? '',
        codigoPostal: usuario.direccion?.codigoPostal ?? '',
      });
    }
  }

  // ===== Chips de colores =====
  get colores(): string[] {
    return this.form.get('colores')?.value ?? [];
  }

  get tamanos(): string[] {
    return this.form.get('tamanos')?.value ?? [];
  }

  agregarColor(): void {
    const input = (this.form.get('coloresInput')?.value ?? '').trim();
    if (!input) return;
    const actuales = this.colores;
    if (!actuales.includes(input)) {
      this.form.patchValue({ colores: [...actuales, input], coloresInput: '' });
    } else {
      this.form.patchValue({ coloresInput: '' });
    }
  }

  quitarColor(color: string): void {
    this.form.patchValue({
      colores: this.colores.filter((c) => c !== color),
    });
  }

  agregarTamano(): void {
    const input = (this.form.get('tamanosInput')?.value ?? '').trim();
    if (!input) return;
    const actuales = this.tamanos;
    if (!actuales.includes(input)) {
      this.form.patchValue({ tamanos: [...actuales, input], tamanosInput: '' });
    } else {
      this.form.patchValue({ tamanosInput: '' });
    }
  }

  quitarTamano(tamano: string): void {
    this.form.patchValue({
      tamanos: this.tamanos.filter((t) => t !== tamano),
    });
  }

  // ===== Cloudinary =====
  subirImagenes(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const w = window as any;
    if (!w.cloudinary) {
      this.error.set('El widget de imágenes no está disponible. Recargá la página.');
      return;
    }

    if (this.imagenes().length >= this.maxImagenes) {
      this.error.set(`Máximo ${this.maxImagenes} imágenes.`);
      return;
    }

    const widget = w.cloudinary.createUploadWidget(
      {
        cloudName: this.cloudName,
        uploadPreset: this.uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: this.maxImagenes - this.imagenes().length,
        maxFileSize: 5000000,
        folder: 'personalizados',
      },
      (err: any, result: any) => {
        if (!err && result?.event === 'success') {
          const url = result.info.secure_url;
          this.imagenes.set([...this.imagenes(), url]);
        }
      }
    );
    widget.open();
  }

  quitarImagen(url: string): void {
    this.imagenes.set(this.imagenes().filter((i) => i !== url));
  }

  // ===== Envío =====
  get requiereDireccion(): boolean {
    return this.form.get('envioTipo')?.value === 'domicilio';
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisá los campos requeridos.');
      return;
    }

    // Validación extra: si es domicilio, requiere calle y ciudad
    if (this.requiereDireccion) {
      const calle = this.form.get('calle')?.value?.trim();
      const ciudad = this.form.get('ciudad')?.value?.trim();
      if (!calle || !ciudad) {
        this.error.set('Para envío a domicilio, ingresá calle y ciudad.');
        return;
      }
    }

    this.enviando.set(true);
    this.error.set('');

    const v = this.form.value;

    const payload: Partial<PedidoPersonalizadoModel> = {
      cliente: {
        nombre: v.nombre.trim(),
        email: v.email.trim(),
        telefono: v.telefono?.trim() || undefined,
      },
      descripcion: v.descripcion.trim(),
      colores: this.colores,
      tamanos: this.tamanos,
      cantidad: Number(v.cantidad),
      imagenesReferencia: this.imagenes(),
      presupuestoCliente: v.presupuestoCliente ? Number(v.presupuestoCliente) : undefined,
      envio: {
        tipo: v.envioTipo,
        direccion:
          v.envioTipo === 'domicilio'
            ? {
                calle: v.calle?.trim(),
                ciudad: v.ciudad?.trim(),
                region: v.region?.trim(),
                codigoPostal: v.codigoPostal?.trim(),
                pais: 'Chile',
              }
            : undefined,
      },
    };

    this.pedidoService.crearPedido(payload).subscribe({
      next: (pedido) => {
        this.enviando.set(false);
        this.exito.set(true);
        this.numeroPedidoCreado.set(pedido.numeroPedido ?? '');
        this.form.reset({ envioTipo: 'cotizar', cantidad: 1, colores: [], tamanos: [] });
        this.imagenes.set([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Error al enviar pedido', err);
        this.enviando.set(false);
        this.error.set(
          err?.error?.error ?? err?.error?.mensaje ?? 'No se pudo enviar el pedido.'
        );
      },
    });
  }

  nuevoPedido(): void {
    this.exito.set(false);
    this.numeroPedidoCreado.set('');
  }
}
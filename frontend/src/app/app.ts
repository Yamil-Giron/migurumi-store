import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EncabezadoComponente } from './nucleo/encabezado/encabezado.componente';
import { PiepaginaComponente } from './nucleo/piepagina/piepagina.componente';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, EncabezadoComponente, PiepaginaComponente],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EncabezadoComponente } from './nucleo/encaezado/encabezado.componente';
import { piepaginaComponente } from './nucleo/piepagina/piepagina.componente';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HencabezadoComponente, PiepaginaComponente],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
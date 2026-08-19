import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-piepagina',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './piepagina.componente.html',
  styleUrls: ['./piepagina.componente.css']
})
export class PiepaginaComponente { }
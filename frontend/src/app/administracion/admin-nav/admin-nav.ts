import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-nav.html',
  styleUrls: ['./admin-nav.css'],
})
export class AdminNav {}
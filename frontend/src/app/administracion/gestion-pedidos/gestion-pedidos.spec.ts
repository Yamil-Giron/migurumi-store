import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPedidos } from './gestion-pedidos';

describe('GestionPedidos', () => {
  let component: GestionPedidos;
  let fixture: ComponentFixture<GestionPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPedidos],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionPedidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

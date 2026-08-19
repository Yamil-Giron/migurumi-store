import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarritoDeCompras } from './carrito-de-compras';

describe('CarritoDeCompras', () => {
  let component: CarritoDeCompras;
  let fixture: ComponentFixture<CarritoDeCompras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarritoDeCompras],
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoDeCompras);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

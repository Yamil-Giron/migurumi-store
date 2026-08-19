import { ComponentFixture, TestBed } from '@angular/core/testing';

import { piepagina } from './piepagina';

describe('piepagina', () => {
  let component: piepagina;
  let fixture: ComponentFixture<piepagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [piepagina],
    }).compileComponents();

    fixture = TestBed.createComponent(piepagina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

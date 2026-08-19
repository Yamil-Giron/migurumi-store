import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Disposicion } from './disposicion';

describe('Disposicion', () => {
  let component: Disposicion;
  let fixture: ComponentFixture<Disposicion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Disposicion],
    }).compileComponents();

    fixture = TestBed.createComponent(Disposicion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

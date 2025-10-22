import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActividadDetalleComponent } from './actividad-detalle.component';

describe('ActividadDetalleComponent', () => {
  let component: ActividadDetalleComponent;
  let fixture: ComponentFixture<ActividadDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActividadDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActividadDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilFamiliaComponent } from './perfil-familia.component';

describe('PerfilFamiliaComponent', () => {
  let component: PerfilFamiliaComponent;
  let fixture: ComponentFixture<PerfilFamiliaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilFamiliaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilFamiliaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

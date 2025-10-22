import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminParticipacionesComponent } from './admin-participaciones.component';

describe('AdminParticipacionesComponent', () => {
  let component: AdminParticipacionesComponent;
  let fixture: ComponentFixture<AdminParticipacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminParticipacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminParticipacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

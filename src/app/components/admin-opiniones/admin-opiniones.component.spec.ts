import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOpinionesComponent } from './admin-opiniones.component';

describe('AdminOpinionesComponent', () => {
  let component: AdminOpinionesComponent;
  let fixture: ComponentFixture<AdminOpinionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOpinionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOpinionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

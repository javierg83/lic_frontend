import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MercadoPublicoDashboard } from './mercado-publico-dashboard';

describe('MercadoPublicoDashboard', () => {
  let component: MercadoPublicoDashboard;
  let fixture: ComponentFixture<MercadoPublicoDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MercadoPublicoDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MercadoPublicoDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

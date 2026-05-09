import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpDescargasList } from './mp-descargas-list';

describe('MpDescargasList', () => {
  let component: MpDescargasList;
  let fixture: ComponentFixture<MpDescargasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpDescargasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpDescargasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

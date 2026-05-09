import { TestBed } from '@angular/core/testing';

import { MercadoPublico } from './mercado-publico';

describe('MercadoPublico', () => {
  let service: MercadoPublico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MercadoPublico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

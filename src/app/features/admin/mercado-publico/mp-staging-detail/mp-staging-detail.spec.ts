import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpStagingDetail } from './mp-staging-detail';

describe('MpStagingDetail', () => {
  let component: MpStagingDetail;
  let fixture: ComponentFixture<MpStagingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpStagingDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpStagingDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

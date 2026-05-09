import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpStagingList } from './mp-staging-list';

describe('MpStagingList', () => {
  let component: MpStagingList;
  let fixture: ComponentFixture<MpStagingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpStagingList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpStagingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

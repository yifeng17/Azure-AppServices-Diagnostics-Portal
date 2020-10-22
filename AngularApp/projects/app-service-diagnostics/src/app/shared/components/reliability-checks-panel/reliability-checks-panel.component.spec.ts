import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReliabilityChecksPanelComponent } from './reliability-checks-panel.component';

describe('ReliabilityChecksPanelComponent', () => {
  let component: ReliabilityChecksPanelComponent;
  let fixture: ComponentFixture<ReliabilityChecksPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReliabilityChecksPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReliabilityChecksPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

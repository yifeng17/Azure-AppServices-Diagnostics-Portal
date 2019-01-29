import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectorSolutionComponent } from './detector-solution.component';

describe('DetectorSolutionComponent', () => {
  let component: DetectorSolutionComponent;
  let fixture: ComponentFixture<DetectorSolutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetectorSolutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectorSolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

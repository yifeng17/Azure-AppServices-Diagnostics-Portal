import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicAnalysisResultsComponent } from './dynamic-analysis-results.component';

describe('DynamicAnalysisResultsComponent', () => {
  let component: DynamicAnalysisResultsComponent;
  let fixture: ComponentFixture<DynamicAnalysisResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicAnalysisResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicAnalysisResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

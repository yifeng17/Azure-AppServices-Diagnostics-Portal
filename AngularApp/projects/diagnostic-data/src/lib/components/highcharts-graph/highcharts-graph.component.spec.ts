import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartsGraphComponent } from './highcharts-graph.component';

describe('HighchartsGraphComponent', () => {
  let component: HighchartsGraphComponent;
  let fixture: ComponentFixture<HighchartsGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighchartsGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighchartsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

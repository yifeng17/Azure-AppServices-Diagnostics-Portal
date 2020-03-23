import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectorTimePickerComponent } from './detector-time-picker.component';

describe('DetectorTimePickerComponent', () => {
  let component: DetectorTimePickerComponent;
  let fixture: ComponentFixture<DetectorTimePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetectorTimePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectorTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

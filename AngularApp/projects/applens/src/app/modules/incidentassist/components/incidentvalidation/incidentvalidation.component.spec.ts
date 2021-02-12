import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentValidationComponent } from './incidentvalidation.component';

describe('IncidentValidationComponent', () => {
  let component: IncidentValidationComponent;
  let fixture: ComponentFixture<IncidentValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncidentValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

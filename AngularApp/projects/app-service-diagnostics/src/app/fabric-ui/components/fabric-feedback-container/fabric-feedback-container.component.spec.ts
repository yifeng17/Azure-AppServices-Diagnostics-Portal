import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricFeedbackContainerComponent } from './fabric-feedback-container.component';

describe('FabricFeedbackContainerComponent', () => {
  let component: FabricFeedbackContainerComponent;
  let fixture: ComponentFixture<FabricFeedbackContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabricFeedbackContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabricFeedbackContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

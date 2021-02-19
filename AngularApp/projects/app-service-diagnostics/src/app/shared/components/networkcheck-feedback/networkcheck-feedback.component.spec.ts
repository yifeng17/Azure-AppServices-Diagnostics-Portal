import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkCheckFeedbackComponent } from './networkcheck-feedback.component';

describe('FabricFeedbackComponent', () => {
  let component: NetworkCheckFeedbackComponent;
  let fixture: ComponentFixture<NetworkCheckFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkCheckFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkCheckFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskAlertsNotificationComponent } from './risk-alerts-notification.component';

describe('RiskAlertsNotificationComponent', () => {
  let component: RiskAlertsNotificationComponent;
  let fixture: ComponentFixture<RiskAlertsNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskAlertsNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskAlertsNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

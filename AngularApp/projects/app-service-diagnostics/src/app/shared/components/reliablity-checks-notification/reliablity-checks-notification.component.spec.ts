import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReliablityChecksNotificationComponent } from './reliablity-checks-notification.component';

describe('ReliablityChecksNotificationComponent', () => {
  let component: ReliablityChecksNotificationComponent;
  let fixture: ComponentFixture<ReliablityChecksNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReliablityChecksNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReliablityChecksNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

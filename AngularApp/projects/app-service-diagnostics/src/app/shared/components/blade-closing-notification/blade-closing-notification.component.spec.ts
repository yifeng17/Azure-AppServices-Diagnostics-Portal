import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BladeClosingNotificationComponent } from './blade-closing-notification.component';

describe('BladeClosingNotificationComponent', () => {
  let component: BladeClosingNotificationComponent;
  let fixture: ComponentFixture<BladeClosingNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BladeClosingNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BladeClosingNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

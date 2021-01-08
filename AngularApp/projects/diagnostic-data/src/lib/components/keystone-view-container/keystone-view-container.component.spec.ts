import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeystoneViewContainerComponent } from './keystone-view-container.component';

describe('KeystoneViewContainerComponent', () => {
  let component: KeystoneViewContainerComponent;
  let fixture: ComponentFixture<KeystoneViewContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeystoneViewContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeystoneViewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

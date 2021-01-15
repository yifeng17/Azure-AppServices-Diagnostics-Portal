import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeystoneInsightComponent } from './keystone-insight.component';

describe('KeystoneInsightComponent', () => {
  let component: KeystoneInsightComponent;
  let fixture: ComponentFixture<KeystoneInsightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeystoneInsightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeystoneInsightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsiValidatorToolComponent } from './msi-validator-tool.component';

describe('MsiValidatorToolComponent', () => {
  let component: MsiValidatorToolComponent;
  let fixture: ComponentFixture<MsiValidatorToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsiValidatorToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsiValidatorToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

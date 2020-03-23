import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FabNavComponent } from './fab-nav.component';

describe('FabNavComponent', () => {
  let component: FabNavComponent;
  let fixture: ComponentFixture<FabNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FabNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FabNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

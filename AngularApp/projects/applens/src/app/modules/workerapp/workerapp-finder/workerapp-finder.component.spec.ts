import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerAppFinderComponent } from './workerapp-finder.component';

describe('WorkerAppFinderComponent', () => {
  let component: WorkerAppFinderComponent;
  let fixture: ComponentFixture<WorkerAppFinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerAppFinderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerAppFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

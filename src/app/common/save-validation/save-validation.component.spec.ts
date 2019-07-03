import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveValidationComponent } from './save-validation.component';

describe('SaveValidationComponent', () => {
  let component: SaveValidationComponent;
  let fixture: ComponentFixture<SaveValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CssLoaderComponent } from './css-loader.component';

describe('CssLoaderComponent', () => {
  let component: CssLoaderComponent;
  let fixture: ComponentFixture<CssLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CssLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CssLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

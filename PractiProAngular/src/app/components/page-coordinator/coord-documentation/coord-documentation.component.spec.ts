import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordDocumentationComponent } from './coord-documentation.component';

describe('CoordDocumentationComponent', () => {
  let component: CoordDocumentationComponent;
  let fixture: ComponentFixture<CoordDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordDocumentationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

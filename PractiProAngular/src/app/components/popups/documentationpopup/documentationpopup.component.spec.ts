import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationpopupComponent } from './documentationpopup.component';

describe('DocumentationpopupComponent', () => {
  let component: DocumentationpopupComponent;
  let fixture: ComponentFixture<DocumentationpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentationpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentationpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarAccordionComponent } from './war-accordion.component';

describe('WarAccordionComponent', () => {
  let component: WarAccordionComponent;
  let fixture: ComponentFixture<WarAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarAccordionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WarAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentspopupComponent } from './commentspopup.component';

describe('CommentspopupComponent', () => {
  let component: CommentspopupComponent;
  let fixture: ComponentFixture<CommentspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentspopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommentspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

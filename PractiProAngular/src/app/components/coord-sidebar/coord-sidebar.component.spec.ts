import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordSidebarComponent } from './coord-sidebar.component';

describe('CoordSidebarComponent', () => {
  let component: CoordSidebarComponent;
  let fixture: ComponentFixture<CoordSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

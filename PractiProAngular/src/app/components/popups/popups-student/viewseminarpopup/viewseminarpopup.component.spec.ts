import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewseminarpopupComponent } from './viewseminarpopup.component';

describe('ViewseminarpopupComponent', () => {
  let component: ViewseminarpopupComponent;
  let fixture: ComponentFixture<ViewseminarpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewseminarpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewseminarpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

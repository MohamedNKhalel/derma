import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlanknavComponent } from './blanknav.component';

describe('BlanknavComponent', () => {
  let component: BlanknavComponent;
  let fixture: ComponentFixture<BlanknavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BlanknavComponent]
    });
    fixture = TestBed.createComponent(BlanknavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

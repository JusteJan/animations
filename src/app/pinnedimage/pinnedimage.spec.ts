import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pinnedimage } from './pinnedimage';

describe('Pinnedimage', () => {
  let component: Pinnedimage;
  let fixture: ComponentFixture<Pinnedimage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pinnedimage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pinnedimage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

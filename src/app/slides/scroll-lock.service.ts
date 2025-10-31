import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private savedScrollY: number = 0;
  private isLocked: boolean = false;

  get isScrollLocked(): boolean {
    return this.isLocked;
  }

  // NOTE: We no longer need to calculate scrollbar width if we use overflow-y: scroll
  // on HTML, as the scrollbar space is permanently occupied.

  /**
   * Locks the scroll by setting fixed height and overflow on the <html> element.
   * This is the safest way to preserve the scrollbar's visual space.
   */
  lockScroll(scrollY: number = window.scrollY): void {
    if (this.isLocked) return;

    this.savedScrollY = scrollY;

    // 1. Save scroll position and apply negative margin to keep content visually static
    document.body.style.marginTop = `-${this.savedScrollY}px`;

    // 2. Lock the scroll by removing the ability to scroll on the HTML element
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflowY = 'hidden';

    // NOTE: Because we set html { overflow-y: scroll; } in CSS,
    // the visual space for the scrollbar is always preserved, even when we set it to hidden here.

    this.isLocked = true;
  }

  /**
   * Unlocks the scroll and restores the previous scroll position.
   */
  unlockScroll(): void {
    if (!this.isLocked) return;

    // 1. Restore HTML styles
    document.documentElement.style.height = '';
    document.documentElement.style.overflowY = 'scroll';

    // 2. Remove negative margin from body
    document.body.style.marginTop = '';

    // 3. Restore the previous scroll position
    window.scrollTo(0, this.savedScrollY);

    this.isLocked = false;
  }
}

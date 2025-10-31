import {AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import {animate} from 'animejs';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-pinnedimage',
  imports: [
    NgStyle
  ],
  templateUrl: './pinnedimage.html',
  styleUrl: './pinnedimage.scss',
})
export class Pinnedimage implements AfterViewInit {
  @Input() animationStyle = 'normal';
  @Input() background!: string;
  @Input() text!: string;

  @ViewChild('slideRef') slideRef!: ElementRef;
  @ViewChild('textRef') textRef!: ElementRef;
  @ViewChild('slideContainer', { read: ElementRef }) slideContainer!: ElementRef;

  ngAfterViewInit() {
    this.animateTextOnScroll();
  }

  @HostListener('window:scroll', [])
  animateTextOnScroll() {
    const containerEl = this.slideRef.nativeElement.parentElement;
    const innerEl = this.slideRef.nativeElement;
    const textEl = this.textRef.nativeElement;

    const scrollY = window.scrollY;
    const containerTop = containerEl.offsetTop;
    const viewportHeight = window.innerHeight;

    // NOTE: containerHeight and totalPinDistance will now be different
    // depending on the CSS applied in Step 3.

    if (this.animationStyle === 'reveal-exit') {
      // --- Logic for the 'reveal-exit' slide (Container Height: 300vh)

      const containerHeight = viewportHeight * 3; // 300vh
      const totalPinDistance = containerHeight - viewportHeight; // 200vh

      // Total progress over 200vh distance (0 to 1)
      let totalProgress = (scrollY - containerTop) / totalPinDistance;
      totalProgress = Math.min(Math.max(totalProgress, 0), 1);

      // --- 1. Text Animation (uses the first 100vh of scroll)
      // Progress for text is 0 to 1 over the first half (totalProgress * 2)
      let textProgress = Math.min(totalProgress * 2, 1);

      // --- 2. Unpin Animation (uses the second 100vh of scroll)
      // Progress for unpin is 0 to 1 over the second half ((totalProgress - 0.5) * 2)
      let unpinProgress = Math.min(Math.max((totalProgress - 0.5) * 2, 0), 1);
      // let unpinProgress = Math.min(Math.max((totalProgress - 1) * 2, 0), 1); // for slide over

      // The inner slide slides up from top: 0 to top: -viewportHeight
      const unpinOffset = -viewportHeight * unpinProgress;

      // Apply text animation
      animate(textEl, {
        top: `${100 * (1 - textProgress)}%`,
        opacity: textProgress,
        ease: 'linear',
        duration: 0.001
      });

      console.log(unpinProgress);
      // Apply unpin animation
      animate(innerEl, {
        // top: `${unpinOffset}px`, // Slides up from 0 to -100vh
        top: `${unpinOffset}px`, // Slides up from 0 to -100vh
        position: 'sticky',
        ease: 'linear',
        duration: 0.001
      });

    } else if (this.animationStyle === 'reveal-enter') {
      // --- Logic for the 'reveal-enter' slide (Container Height: 100vh)

      // The logic for reveal-enter remains the same, as it only needs 100vh
      // of scroll distance to slide into place.
      // The containerTop calculation for this slide will be accurate
      // as it follows the 300vh exit slide.

      let revealScrollDistance = scrollY - containerTop;
      let revealProgress = revealScrollDistance / viewportHeight;
      revealProgress = Math.min(Math.max(revealProgress, 0), 1);

      const newTop = viewportHeight * (1 - revealProgress);

      // Apply the 'reveal' animation to the fixed inner slide.
      animate(innerEl, {
        top: `${newTop}px`, // Slides up from 100vh to 0px
        position: 'fixed',
        ease: 'linear',
        duration: 0.001
      });

    } else if (this.animationStyle === 'reveal-exit') {
      // --- Logic for the 'reveal-exit' slide (Container Height: 300vh)

      const containerHeight = viewportHeight * 3; // 300vh
      const totalPinDistance = containerHeight - viewportHeight; // 200vh

      // Total progress over 200vh distance (0 to 1)
      let totalProgress = (scrollY - containerTop) / totalPinDistance;
      totalProgress = Math.min(Math.max(totalProgress, 0), 1);

      // --- 1. Text Animation (uses the first 100vh of scroll)
      // Progress for text is 0 to 1 over the first half (totalProgress * 2)
      let textProgress = Math.min(totalProgress * 2, 1);

      // --- 2. Unpin Animation (uses the second 100vh of scroll)
      // Progress for unpin is 0 to 1 over the second half ((totalProgress - 0.5) * 2)
      let unpinProgress = Math.min(Math.max((totalProgress - 0.5) * 2, 0), 1);
      // let unpinProgress = Math.min(Math.max((totalProgress - 1) * 2, 0), 1); // for slide over

      // The inner slide slides up from top: 0 to top: -viewportHeight
      const unpinOffset = -viewportHeight * unpinProgress;

      // Apply text animation
      animate(textEl, {
        top: `${100 * (1 - textProgress)}%`,
        opacity: textProgress,
        ease: 'linear',
        duration: 0.001
      });

      console.log(unpinProgress);
      // Apply unpin animation
      animate(innerEl, {
        // top: `${unpinOffset}px`, // Slides up from 0 to -100vh
        top: `${unpinOffset}px`, // Slides up from 0 to -100vh
        position: 'sticky',
        ease: 'linear',
        duration: 0.001
      });

    } else if (this.animationStyle === 'reveal-enter') {
      // --- Logic for the 'reveal-enter' slide (Container Height: 100vh)

      // The logic for reveal-enter remains the same, as it only needs 100vh
      // of scroll distance to slide into place.
      // The containerTop calculation for this slide will be accurate
      // as it follows the 300vh exit slide.

      let revealScrollDistance = scrollY - containerTop;
      let revealProgress = revealScrollDistance / viewportHeight;
      revealProgress = Math.min(Math.max(revealProgress, 0), 1);

      const newTop = viewportHeight * (1 - revealProgress);

      // Apply the 'reveal' animation to the fixed inner slide.
      animate(innerEl, {
        top: `${newTop}px`, // Slides up from 100vh to 0px
        position: 'fixed',
        ease: 'linear',
        duration: 0.001
      });

    } else { // 'normal'
      // --- Logic for the 'normal' slide (Container Height: 200vh)

      const containerHeight = viewportHeight * 2; // 200vh
      const totalPinDistance = containerHeight - viewportHeight; // 100vh

      let progress = (scrollY - containerTop) / totalPinDistance;
      progress = Math.min(Math.max(progress, 0), 1);

      // Text animation uses 100% of the pin distance
      animate(textEl, {
        top: `${100 * (1 - progress)}%`,
        opacity: progress,
        ease: 'linear',
        duration: 0.001
      });

      // Ensure the inner slide sticks normally
      animate(innerEl, {
        top: '0px',
        position: 'sticky',
        ease: 'linear',
        duration: 0.001
      });
    }
  }
}

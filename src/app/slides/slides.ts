import {
  Component,
  AfterViewInit,
  ElementRef,
  Renderer2,
  ViewChildren,
  QueryList,
  HostListener,
  OnInit
} from '@angular/core';
import { animate } from 'animejs';
import {NgClass} from '@angular/common';
import {ScrollLockService} from './scroll-lock.service';
import Lenis from 'lenis';  // Anime.js v4 import
interface Section {
  color: string;
  text: string;
  animated: boolean;
}
@Component({
  selector: 'app-slides',
  templateUrl: './slides.html',
  imports: [
    NgClass
  ],
  styleUrls: ['./slides.css']
})
export class Slides implements OnInit, AfterViewInit {
  @ViewChildren('section') sections!: QueryList<ElementRef>;
  private isWheelScrolling: boolean = false; // Flag to manage manual scrolling
  private isLenisLocked = false;

  divs: Section[] = [
    { color: '#FF5733', text: 'Section One Text', animated: false },
    { color: '#33FF57', text: 'Section Two Text', animated: false },
    { color: '#3357FF', text: 'Section Three Text', animated: false },
    { color: '#FF33A1', text: 'Section Four Text', animated: false },
    { color: '#33FFF6', text: 'Section Five Text', animated: false },
  ];

  private lenis!: Lenis; // Store the Lenis instance
  private animationInProgress: boolean = false;

  ngOnInit() {
    this.initLenis();
  }

  ngAfterViewInit() {
    // Start the Lenis animation frame loop
    this.raf(0);
  }

  // Lenis Initialization
  initLenis(): void {
    // Initialize Lenis. The `duration` and `easing` control the overall scroll feel.
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Simple, common smooth-scroll easing
      // Lenis is generally good at preserving the native scrollbar
    });

    // We'll use a tick listener to check for the trigger point
    this.lenis.on('scroll', ({ scroll, limit, velocity, direction }) => {
      this.checkScrollPosition(scroll);
    });
  }

  // Animation Frame Loop (Required for Lenis to work)
  raf(time: DOMHighResTimeStamp): void {
    this.lenis.raf(time);
    requestAnimationFrame((t) => this.raf(t));
  }

  constructor(private scrollLockService: ScrollLockService) {}

  // Uncomment for automatic text slide in
  // checkScrollPosition(currentScroll: number): void {
  //   if (this.animationInProgress) {
  //     return;
  //   }
  //
  //   const viewportHeight = window.innerHeight;
  //   const currentScrollDirection = this.lenis.direction; // 1 for down, -1 for up
  //
  //   this.sections.forEach((sectionElRef, index) => {
  //     const sectionEl = sectionElRef.nativeElement as HTMLElement;
  //     const sectionData = this.divs[index];
  //     const rect = sectionEl.getBoundingClientRect();
  //     const bottomToViewportBottom = viewportHeight - rect.bottom;
  //     const snapTolerance = 5;
  //
  //     // ------------------------------------------------------------------
  //     // A. SCROLLING DOWN (Initial Lock and Animation)
  //     // ------------------------------------------------------------------
  //     if (currentScrollDirection === 1 && !sectionData.animated) {
  //       if (bottomToViewportBottom >= -snapTolerance && rect.bottom <= viewportHeight) {
  //
  //         // Calculate the *exact* target scroll position
  //         const sectionBottomDocumentPos = sectionEl.offsetTop + sectionEl.offsetHeight;
  //         const targetScrollY = sectionBottomDocumentPos - viewportHeight;
  //
  //         // 1. Snap & Lock
  //         this.lenis.scrollTo(targetScrollY, { duration: 0.001, immediate: true });
  //         this.lenis.stop();
  //         this.animationInProgress = true;
  //
  //         // 2. Animate IN (translateY: 100% -> 0%)
  //         this.animateTextIn(`text-${index}`).then(() => {
  //           this.divs[index].animated = true; // Mark as ANIMATED
  //           this.animationInProgress = false;
  //           this.lenis.start(); // Unlock scroll
  //         });
  //       }
  //     }
  //
  //       // ------------------------------------------------------------------
  //       // B. SCROLLING UP (Reverse Animation and Unlock)
  //     // ------------------------------------------------------------------
  //     else if (currentScrollDirection === -1 && sectionData.animated) {
  //
  //       // The condition for scrolling up:
  //       // We look at the section *above* the current one.
  //       // This current section is already 'animated', and we need to play
  //       // the reverse animation when its bottom is about to leave the viewport.
  //
  //       // Trigger point: When the section's bottom is just leaving the viewport
  //       if (bottomToViewportBottom < -snapTolerance) {
  //
  //         // To ensure we don't interfere with the next section above, we only run
  //         // the reverse animation for the *last* fully animated section when scrolling up.
  //
  //         // 1. Lock scroll temporarily (Lenis is already running, so we only need to stop
  //         // for the duration of the reverse animation to prevent jump)
  //         this.lenis.stop();
  //         this.animationInProgress = true;
  //
  //         // 2. Animate OUT (Reverse: translateY: 0% -> 100%)
  //         this.animateTextOut(`text-${index}`).then(() => {
  //           this.divs[index].animated = false; // Mark as UNANIMATED
  //           this.animationInProgress = false;
  //           this.lenis.start(); // Unlock scroll
  //         });
  //       }
  //     }
  //   });
  // }

  checkScrollPosition(currentScroll: number): void {
    const viewportHeight = window.innerHeight;

    this.sections.forEach((sectionElRef, index) => {
      const sectionEl = sectionElRef.nativeElement as HTMLElement;
      const textEl = sectionEl.querySelector('.section-text') as HTMLElement;

      const rect = sectionEl.getBoundingClientRect();

      // When the bottom of section enters the viewport
      const start = rect.top + rect.height - viewportHeight;
      // End point: after some extra scroll (say 60% of viewport height)
      const end = start + viewportHeight * 0.6;

      // Map scroll progress between start and end → 0 to 1
      const scrollY = window.scrollY;
      const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
      const shouldLock = progress > 0 && progress < 1;
      console.log(progress)
      if (shouldLock && !this.isLenisLocked) {
        this.lenis.stop();
        this.isLenisLocked = true;
      } else if (!shouldLock && this.isLenisLocked) {
        this.lenis.start();
        this.isLenisLocked = false;
      }

      // Apply scroll-driven animation to text
      const translateY = 100 - progress * 100; // 100% → 0%
      const opacity = progress; // 0 → 1

      textEl.style.transform = `translate(-50%, ${translateY}%)`;
      textEl.style.opacity = opacity.toString();
    });
  }

  animateTextOut(textElementId: string): Promise<void> {
    return new Promise(resolve => {
      animate(`#${textElementId}`, {
        // Reverse: Current state (0%) -> Initial state (100% off-screen)
        translateY: ['0%', '100%'],
        opacity: [1, 0],
        duration: 800, // Keep duration consistent for smoothness
        easing: 'easeInQuad', // A reverse easing often works well
        complete: () => {
          resolve();
        }
      });
    });
  }

  animateTextIn(textElementId: string): Promise<void> {
    return new Promise(resolve => {
      animate(`#${textElementId}`, {
        translateY: ['100%', '0%'],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuad',
        complete: () => {
          resolve();
        }
      });
    });
  }
}

import {AfterViewInit, Component} from '@angular/core';
import {NgClass} from '@angular/common';
import { animate, splitText, stagger, random, createTimeline } from 'animejs';

@Component({
  selector: 'app-old-slides',
  imports: [
    NgClass
  ],
  templateUrl: './oldslides.html',
  styleUrl: './oldslides.css',
})
export class Oldslides implements AfterViewInit {
  sections = Array(5).fill(0);
  currentIndex = 0;
  progressStep = 0; // 0..3 = quarter scrolls, 4 = text visible
  isAnimating = false;
  touchStartY = 0;

  ngAfterViewInit() {
    // Show first slide text immediately
    const firstText = this.getTextEl(0);
    if (firstText) {
      animate(firstText, { translateY: '0%', opacity: 1, duration: 0 });
    }
  }

  onScroll(event: WheelEvent) {
    if (this.isAnimating) return;
    event.preventDefault();
    const dir = Math.sign(event.deltaY);
    dir > 0 ? this.advance() : this.reverse();
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent) {
    if (this.isAnimating) return;
    const deltaY = this.touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) < 30) return;
    deltaY > 0 ? this.advance() : this.reverse();
  }

  private getTextEl(index: number): HTMLElement | null {
    const secs = document.querySelectorAll<HTMLElement>('.section');
    const sec = secs[index];
    return sec ? (sec.querySelector<HTMLElement>('.text') as HTMLElement) : null;
  }

  advance() {
    if (this.progressStep <= 3) {
      console.log(this.progressStep);
      console.log('scroll')
      // Scroll quarter
      this.progressStep++;
      this.playTimeline('forward');
    } else if (this.progressStep === 4) {
      // Fully visible now — trigger text animation on same slide
      this.progressStep++;
      this.playTimeline('text'); // new mode specifically for text only
    } else if (this.progressStep === 5 && this.currentIndex < this.sections.length - 1) {
      // After text animation is done, move to next slide
      this.currentIndex++;
      this.progressStep = 0;
      this.playTimeline('forward');
    }
  }

  reverse() {
    if (this.progressStep > 0) {
      this.progressStep--;
      this.playTimeline('reverse');
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
      this.progressStep = 4; // text visible on previous slide
      this.playTimeline('reverse');
    }
  }

  playTimeline(mode: 'forward' | 'reverse' | 'text') {
    this.isAnimating = true;

    const baseOffset = -100 * this.currentIndex;
    const revealOffset = -(Math.min(this.progressStep, 4) / 4) * 100;
    const totalOffset = baseOffset + revealOffset;

    const wrapperTarget = document.querySelector<HTMLElement>('.section-wrapper');
    const textEl = this.getTextEl(this.currentIndex + 1);

    if (!wrapperTarget) return;

    const tl = createTimeline({onComplete: () => (this.isAnimating = false)});

    // Animate wrapper only for quarter-scrolls
    if (mode === 'forward' || mode === 'reverse') {
      tl.add(wrapperTarget, {
        translateY: totalOffset + 'vh',
        duration: 700,
        easing: 'easeInOutQuad',
      });
    }

    // Animate text only when mode === 'text'
    if (mode === 'text' && textEl) {
      tl.add(textEl, {
        translateY: ['100%', '0%'],
        opacity: [0, 1],
        duration: 700,
        easing: 'cubicBezier(.22,1,.36,1)',
      });
    }

    // Animate text out on reverse
    if (mode === 'reverse' && this.progressStep === 4 && textEl) {
      tl.add(textEl, {
        translateY: ['0%', '100%'],
        opacity: [1, 0],
        duration: 500,
        easing: 'easeInOutQuad',
      }, 0);
    }
  }
}

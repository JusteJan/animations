import {
  Component,
  ElementRef,
  Input,
  HostListener,
  ViewChild,
  AfterViewInit,
  input,
  signal,
  OnInit, computed, HostBinding, Directive, inject
} from '@angular/core';
import {animate} from 'animejs';
import {NgStyle} from '@angular/common';

@Directive({})
export class GenericAnimatedSlide implements AfterViewInit {
  isAnimated = input<boolean>(true);
  enter = input<null | 'reveal-enter' | 'reveal-enter-top'>(null);
  exit = input<null | 'reveal-exit' | 'reveal-top-exit'>(null);
  backgroundImage = input<string>();
  background = input<string>();
  text = input.required<string>();
  zindex = input<number | null>(null);
  element = inject(ElementRef);
  protected viewportMultiplier = computed<number>(() => {
      const enterExitViewport = (this.exit() === 'reveal-top-exit' && this.enter() === 'reveal-enter') ? 4 : (this.exit() === 'reveal-exit' || this.exit() === 'reveal-top-exit' || this.enter() === 'reveal-enter') ? 3 : 2;
      const subtractedViewport = (this.isAnimated()) ? 0 : 1;

      return enterExitViewport - subtractedViewport;
    }
  );

  backgroundSyle = computed(() => {
    console.log(this.backgroundImage());
    if (this.backgroundImage()) {
      return {'background-image': 'url(' + this.backgroundImage() + ')'};
    }

    if (this.background()) {
      return {'backgroundColor': `${this.background()}`};
    }

    return {};
  })
  @ViewChild('slideRef') slideRef!: ElementRef;
  @ViewChild('textRef') textRef!: ElementRef;

  ngAfterViewInit() {
    this.animateTextOnScroll();
  }

  @HostBinding('style.--container-height')
  get getContainerHeight() {
    return `${this.viewportMultiplier() * 100}vh`;
  }

  @HostBinding('style.--text-top')
  get getTextTop() {
    const value = this.isAnimated() ? 100 : 0;
    return `${value}%`;
  }

  @HostBinding('style.--z-index')
  get zIndex() {
    if (this.enter() !== 'reveal-enter-top' && this.enter() !== 'reveal-enter') {
      return 'auto';
    }
    const previousSlide = this.element.nativeElement.previousElementSibling;
    const previousIndex: string | number = window.getComputedStyle(previousSlide).zIndex;
    const previousIndexNumeric: number = previousIndex === 'auto' ? 0 : parseInt(previousIndex);

    if (this.enter() === 'reveal-enter') {
      return previousIndexNumeric - 1;
    }

    if (this.enter() === 'reveal-enter-top') {
      return previousIndexNumeric + 1;
    }

    return 0;
  }

  @HostBinding('class.reveal-slide')
  get revealEnter() {
    return this.enter() === 'reveal-enter';
  }

  @HostBinding('class.reveal-slide-top')
  get revealEnterTop() {
    return this.enter() === 'reveal-enter-top';
  }

  @HostBinding('style.--margin-reveal')
  get getMarginReveal() {
    if (this.enter() === 'reveal-enter' && this.exit() === 'reveal-top-exit') {
      return `-100vh`;
    }

    return null;
  }

  @HostListener('window:scroll', [])
  animateTextOnScroll() {
    console.log(this.text());
    console.log(this.viewportMultiplier());
    const containerEl = this.slideRef.nativeElement.parentElement;
    const innerEl = this.slideRef.nativeElement;
    const textEl = this.textRef.nativeElement;

    const scrollY = window.scrollY;
    const rect = containerEl.getBoundingClientRect();

  // rect.top is the distance from the viewport top to the element. 0 means the element's top aligns with the top of the viewport - 'the screen'
  // Adding window.scrollY converts this to a distance from the document top.
    const containerTop = rect.top + window.scrollY;
    const viewportHeight = window.innerHeight;

    if (this.exit() === 'reveal-exit' || this.exit() === 'reveal-top-exit') {
      const containerHeight = viewportHeight * this.viewportMultiplier()
      const totalPinDistance = containerHeight - viewportHeight;

      let minusviewport = (this.enter() === 'reveal-enter' && this.exit() === 'reveal-exit') ? viewportHeight : (this.enter() === 'reveal-enter' && this.exit() === 'reveal-top-exit')? viewportHeight : 0;
      let totalProgress = (scrollY - containerTop - minusviewport) / totalPinDistance;
      let progresstimes = (this.enter() === 'reveal-enter'  && this.exit() === 'reveal-top-exit'  && this.isAnimated()) ? 2 : 1;

      totalProgress = Math.min(Math.max(totalProgress * progresstimes, 0), 1);

      let textProgress = Math.min(totalProgress * 2, 1);

      let unpinProgress = Math.min(Math.max((totalProgress - 0.5) * 2, 0), 1);
      const unpinOffset = -viewportHeight * unpinProgress;

      if (this.isAnimated()) {
        animate(textEl, {
          top: `${100 * (1 - textProgress)}%`,
          opacity: textProgress,
          ease: 'linear',
          duration: 0.001
        });
      }

      if (this.exit() === 'reveal-exit') {
        animate(innerEl, {
          top: `${unpinOffset}px`,
          position: 'sticky',
          ease: 'linear',
          duration: 0.001
        });
      }
    } else if (this.enter() === 'reveal-enter' || this.enter() === 'reveal-enter-top') {
      const containerHeight = viewportHeight * this.viewportMultiplier()
      const totalPinDistance = containerHeight - viewportHeight; // 200vh

      let minusviewport = this.enter() === 'reveal-enter' ? viewportHeight : 0;
      let totalProgress = (scrollY - containerTop - minusviewport) / totalPinDistance;
      let progresstimes = this.enter() === 'reveal-enter' ? 2 : 1;

      const progress = Math.min(Math.max(totalProgress * progresstimes, 0), 1);

      if (this.isAnimated()) {
        animate(textEl, {
          top: `${100 * (1 - progress)}%`,
          opacity: progress,
          ease: 'linear',
          duration: 0.001
        });
      }
    } else {

      if (!this.isAnimated()) {
        return;
      }

      const containerHeight = viewportHeight * this.viewportMultiplier();
      const totalPinDistance = containerHeight - viewportHeight; // 100vh

      let progress = (scrollY - containerTop) / totalPinDistance;
      progress = Math.min(Math.max(progress, 0), 1);

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

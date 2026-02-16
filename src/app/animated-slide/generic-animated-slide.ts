import {
  Component,
  ElementRef,
  Input,
  HostListener,
  ViewChild,
  AfterViewInit,
  input,
  signal,
  OnInit, computed, HostBinding, Directive, inject, NgZone, effect
} from '@angular/core';
import {animate} from 'animejs';
import {NgStyle} from '@angular/common';

@Directive({})
export class GenericAnimatedSlide implements AfterViewInit, OnInit {
  private ngZone = inject(NgZone)
  isAnimated = input<boolean>(true);
  animation = input<'text' | 'zoom' | 'zoom-out'>('text');
  enter = input<null | 'reveal-enter' | 'reveal-enter-top'>(null);
  exit = input<null | 'reveal-exit' | 'reveal-top-exit'>(null);
  backgroundImage = input<string>();
  background = input<string>();
  text = input.required<string>();
  zindex = input<number | null>(null);
  absoluteContainerTop: number = 0;
  element = inject(ElementRef);
  protected viewportMultiplier = computed<number>(() => {
    const enterExitViewport = (this.exit() === 'reveal-top-exit' && this.enter() === 'reveal-enter') ? 4 : (this.exit() === 'reveal-exit' || this.exit() === 'reveal-top-exit' || this.enter() === 'reveal-enter') ? 3 : 2;
    const subtractedViewport = (this.isAnimated()) ? 0 : 1;

    return(enterExitViewport - subtractedViewport);
  });
  @HostBinding('style.--z-index') zIndex: string | number = '1';
  @HostBinding('class.is-active') isActiveSlide = false;

  ngOnInit() {
    this.zIndex = this.calculatezIndex();
  }

  @HostBinding('style.--container-height')
  get getContainerHeight() {
    return `${this.viewportMultiplier() * 100}vh`
  }

  @HostBinding('style.--text-top')
  get getTextTop() {
    const value = this.isAnimated() ? 100 : 0;
    return `${value}%`;
  }


  private calculatezIndex() {
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

  backgroundSyle = computed(() => {
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
  @ViewChild('contentRef') contentRef!: ElementRef;

  private rafId: number | null = null;
  private wasActive: boolean = false;

  private current = {
    textTop: 100,
    textOpacity: 0,
    contentScale: 1,
    innerTop: 0
  };

  private target = {
    textTop: 100,
    textOpacity: 0,
    contentScale: 1,
    innerTop: 0
  };

  ngAfterViewInit() {
    this.calculateDimensions();
    this.ngZone.runOutsideAngular(() => {
      let scheduledAnimationFrame = false;

      window.addEventListener('scroll', () => {
        if (scheduledAnimationFrame) return;

        scheduledAnimationFrame = true;
        requestAnimationFrame(() => {
          this.animateTextOnScroll();
          scheduledAnimationFrame = false;
        });
      }, { passive: true });
    })
    window.addEventListener('resize', () => this.calculateDimensions());

  }


private calculateDimensions() {
  const containerEl = this.slideRef.nativeElement.parentElement;
  if (!containerEl) return;

  const rect = containerEl.getBoundingClientRect();
  this.absoluteContainerTop = rect.top + window.scrollY;

  this.animateTextOnScroll();
}

  private startRaf() {
    const viewportHeight = window.innerHeight;

    if (this.rafId !== null) return;

    const tick = () => {
      const ease = 0.18;

      this.current.textTop +=
        (this.target.textTop - this.current.textTop) * ease;

      this.current.textOpacity +=
        (this.target.textOpacity - this.current.textOpacity) * ease;

      this.current.contentScale +=
        (this.target.contentScale - this.current.contentScale) * ease;

      this.current.innerTop +=
        (this.target.innerTop - this.current.innerTop);

      this.current.textTop = Math.min(Math.max(this.current.textTop, 0), 100);
      this.current.textOpacity = Math.min(Math.max(this.current.textOpacity, 0), 1);
      this.current.contentScale = Math.min(Math.max(this.current.contentScale, 0.01), 4);

      this.render();

      if (
        Math.abs(this.current.textTop - this.target.textTop) < 0.1 &&
        Math.abs(this.current.contentScale - this.target.contentScale) < 0.001 &&
        Math.abs(this.current.innerTop - this.target.innerTop) < 0.5
      ) {
        this.rafId = null;
        return;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private render() {
    const textEl = this.textRef.nativeElement;
    const contentRef = this.contentRef.nativeElement;
    const innerEl = this.slideRef.nativeElement;

    textEl.style.transform = `translate3d(0, ${this.current.textTop}vh, 0)`;
    textEl.style.opacity = `${this.current.textOpacity}`;

    contentRef.style.transform =
      `scale(${this.current.contentScale})`;

    innerEl.style.transform = `translate3d(0, ${this.current.innerTop}px, 0)`;
  }

  animateTextOnScroll() {
    const scroll = window.scrollY;
    const containerTop =this.absoluteContainerTop;
    const viewportHeight = window.innerHeight;

    const isActive =
      scroll >= containerTop &&
      scroll <= containerTop + viewportHeight * this.viewportMultiplier();

    if (this.isActiveSlide !== isActive) {
      this.isActiveSlide = isActive;
    }

    if (isActive && !this.wasActive) {
      this.current = {
        textTop: !this.isAnimated() ? 0 : this.animation() == 'text' ? 100 : 0,
        textOpacity: this.isAnimated() ? 0 : 1,
        contentScale: this.animation() == 'zoom-out' ? 0 : this.animation() == 'zoom' ? 2 : 1,
        innerTop: 0
      };
      this.target = { ...this.current };
    }

    this.wasActive = isActive;

    if (this.exit() === 'reveal-exit' || this.exit() === 'reveal-top-exit') {
      const containerHeight = viewportHeight * this.viewportMultiplier()
      const totalPinDistance = containerHeight - viewportHeight;

      let minusviewport = (this.enter() === 'reveal-enter' && this.exit() === 'reveal-exit') ? viewportHeight : (this.enter() === 'reveal-enter' && this.exit() === 'reveal-top-exit')? viewportHeight : 0;
      let totalProgress = (scroll - containerTop - minusviewport) / totalPinDistance;
      let progresstimes = (this.enter() === 'reveal-enter'  && this.exit() === 'reveal-top-exit'  && this.isAnimated()) ? 2 : 1;

      totalProgress = Math.min(Math.max(totalProgress * progresstimes, 0), 1);

      //the text must leave before exit occurs. Because of this an additional viewport height is always added to exiting slides and the text must leave at twice the rate.
      let textProgress = Math.min(totalProgress * 2, 1);

      //unpin happens when the next slide is revealed underneath the current one. The text is already at the proper place.
      let unpinProgress = Math.min(Math.max((totalProgress - 0.5) * 2, 0), 1);
      const unpinOffset = -viewportHeight * unpinProgress;

      if (this.isAnimated()) {
        if (this.animation() === 'zoom') {
          this.target.contentScale = Math.max(2 + (1 - 2) * textProgress, 0.01);
          this.target.textOpacity = textProgress;
          this.target.textTop = 0;
        } else if(this.animation() === 'zoom-out') {
          this.target.contentScale = Math.max(textProgress, 0.01);
          this.target.textOpacity = textProgress;
          this.target.textTop = 0;
        } else {
          this.target.textOpacity = textProgress;
          this.target.textTop = 100 * (1 - textProgress);
        }
      }

      if (this.exit() === 'reveal-exit') {
        this.target.innerTop = -viewportHeight * unpinProgress;
      }
    } else if (this.enter() === 'reveal-enter' || this.enter() === 'reveal-enter-top') {
      const containerHeight = viewportHeight * this.viewportMultiplier()
      const totalPinDistance = containerHeight - viewportHeight; // 200vh

      let minusviewport = this.enter() === 'reveal-enter' ? viewportHeight : 0;
      let totalProgress = (scroll - containerTop - minusviewport) / totalPinDistance;
      let progresstimes = this.enter() === 'reveal-enter' ? 2 : 1;

      const progress = Math.min(Math.max(totalProgress * progresstimes, 0), 1);

      if (this.isAnimated()) {
        if (this.animation() === 'zoom') {
          this.target.contentScale = Math.max(2 + (1 - 2) * progress, 0.01);
          this.target.textOpacity = progress;
          this.target.textTop = 0;
        } else if (this.animation() === 'zoom-out') {
          this.target.contentScale = Math.max(progress, 0.01);
          this.target.textOpacity = progress;
          this.target.textTop = 0;
        } else {
          this.target.textTop = 100 * (1 - progress);
          this.target.contentScale = 1;
          this.target.textOpacity = progress;
        }
      }
    } else {

      if (!this.isAnimated()) {
        this.target.textTop = 0;
        this.target.textOpacity = 1;
        this.target.contentScale = 1;
        this.startRaf();
        return;
      }

      const containerHeight = viewportHeight * this.viewportMultiplier();
      const totalPinDistance = containerHeight - viewportHeight; // 100vh

      let progress = (scroll - containerTop) / totalPinDistance;
      progress = Math.min(Math.max(progress, 0), 1);

      if (this.animation() === 'text') {
        this.target.textTop = 100 * (1 - progress);
        this.target.contentScale = 1;
        this.target.textOpacity = progress;
      }

      if (this.animation() === 'zoom') {
        this.target.textTop = 0;
        this.target.contentScale = Math.max(2 + (1 - 2) * progress, 0.01);
        this.target.textOpacity = progress;
      }

      if (this.animation() === 'zoom-out') {
        this.target.textTop = 0;
        this.target.contentScale = progress;
        this.target.textOpacity = progress;

      }

    }

    if (this.rafId === null) {
      this.startRaf();
    }
  }
}

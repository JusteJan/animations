import {
  ElementRef,
  ViewChild,
  AfterViewInit,
  input,
  OnInit, computed, HostBinding, Directive, inject, NgZone
} from '@angular/core';

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
  absoluteContainerTop: number = 0;
  element = inject(ElementRef);
  protected viewportMultiplier = computed<number>(() => {
    const enterExitViewport = (this.exit() === 'reveal-top-exit' && this.enter() === 'reveal-enter') ? 4 : (this.exit() === 'reveal-exit' || this.exit() === 'reveal-top-exit' || this.enter() === 'reveal-enter') ? 3 : 2;
    const subtractedViewport = (this.isAnimated()) ? 0 : 1;

    return(enterExitViewport - subtractedViewport);
  });
  @HostBinding('class.is-active') isActiveSlide = false;

  ngOnInit() {
  }

  @HostBinding('style.--container-height')
  get getContainerHeight() {
    return `${this.viewportMultiplier() * 100}vh`
  }

  @HostBinding('style.--z-index')
  get calculatezIndex() {
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
    textTranslate: 100,
    textOpacity: 0,
    contentScale: 1,
    innerTranslate: 0
  };

  private target = {
    textTranslate: 100,
    textOpacity: 0,
    contentScale: 1,
    innerTranslate: 0
  };

  ngAfterViewInit() {
    this.calculateDimensions();
    this.ngZone.runOutsideAngular(() => {

      window.addEventListener('scroll', () => {
          this.animateTextOnScroll();
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
    if (this.rafId !== null) return;

    const tick = () => {
      const ease = 0.8;

      this.current.textTranslate += (this.target.textTranslate - this.current.textTranslate) * ease;
      this.current.textOpacity += (this.target.textOpacity - this.current.textOpacity) * ease;
      this.current.contentScale += (this.target.contentScale - this.current.contentScale) * ease;
      this.current.innerTranslate += (this.target.innerTranslate - this.current.innerTranslate);

      this.render();

      if (
        Math.abs(this.current.textTranslate - this.target.textTranslate) < 0.05 &&
        Math.abs(this.current.contentScale - this.target.contentScale) < 0.001 &&
        Math.abs(this.current.innerTranslate - this.target.innerTranslate) < 0.5
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

    textEl.style.transform = `translate3d(0, ${this.current.textTranslate}vh, 0)`;
    textEl.style.opacity = `${this.current.textOpacity}`;

    contentRef.style.transform =
      `scale(${this.current.contentScale})`;

    innerEl.style.transform = `translate3d(0, ${this.current.innerTranslate}px, 0)`;
  }

  animateTextOnScroll() {
    const scroll = window.scrollY;
    const containerTop =this.absoluteContainerTop;
    const viewportHeight = window.innerHeight;
    const snap = 0.8;

    const isActive =
      scroll >= containerTop &&
      scroll <= containerTop + viewportHeight * this.viewportMultiplier();

    if (this.isActiveSlide !== isActive) {
      this.isActiveSlide = isActive;
    }

    if (isActive && !this.wasActive) {
      this.current = {
        textTranslate: !this.isAnimated() ? 0 : this.animation() == 'text' ? 100 : 0,
        textOpacity: this.isAnimated() ? 0 : 1,
        contentScale: this.animation() == 'zoom-out' ? 0 : this.animation() == 'zoom' ? 2 : 1,
        innerTranslate: 0
      };
      this.target = { ...this.current };
    }

    this.wasActive = isActive;
    const containerHeight = viewportHeight * this.viewportMultiplier();
    const totalPinDistance = containerHeight - viewportHeight;
    let minusviewport = this.enter() === 'reveal-enter' ? viewportHeight : 0;
    let totalProgress = (scroll - containerTop - minusviewport) / totalPinDistance;

    if (this.exit() === 'reveal-exit' || this.exit() === 'reveal-top-exit') {
      let progresstimes = (this.enter() === 'reveal-enter'  && this.exit() === 'reveal-top-exit'  && this.isAnimated()) ? 2 : 1;
      totalProgress = Math.min(Math.max(totalProgress * progresstimes, 0), 1);
      let textProgress = Math.min(totalProgress * 2, 1);
      let animProgress = Math.min(textProgress / snap, 1);
      let unpinProgress = Math.min(Math.max((totalProgress - 0.5) * 2, 0), 1);

      if (this.isAnimated()) {
        this.applyAnimationTargets(animProgress);
      }

      if (this.exit() === 'reveal-exit') {
        this.target.innerTranslate = -viewportHeight * unpinProgress;
      }
    } else if (this.enter() === 'reveal-enter' || this.enter() === 'reveal-enter-top') {
      let progresstimes = this.enter() === 'reveal-enter' ? 2 : 1;

      const progress = Math.min(Math.max(totalProgress * progresstimes, 0), 1);
      let animProgress = Math.min(progress/snap, 1);

      if (this.isAnimated()) {
        this.applyAnimationTargets(animProgress);
      }
    } else {

      if (!this.isAnimated()) {
        this.target.textTranslate = 0;
        this.target.textOpacity = 1;
        this.target.contentScale = 1;
        this.startRaf();
        return;
      }
      totalProgress = Math.min(Math.max(totalProgress, 0), 1);

      const animProgress = Math.min(totalProgress / snap, 1);

      this.applyAnimationTargets(animProgress);
    }

    if (this.rafId === null) {
      this.startRaf();
    }
  }

  private applyAnimationTargets(progress: number) {
    if (this.animation() === 'zoom') {
      this.target.contentScale = Math.max(2 + (1 - 2) * progress, 0.01);
      this.target.textOpacity = progress;
      this.target.textTranslate = 0;
    } else if (this.animation() === 'zoom-out') {
      this.target.contentScale = Math.max(progress, 0.01);
      this.target.textOpacity = progress;
      this.target.textTranslate = 0;
    } else {
      this.target.textTranslate = 100 * (1 - progress);
      this.target.contentScale = 1;
      this.target.textOpacity = progress;
    }
  }
}

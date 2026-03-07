import {Component, ElementRef, ViewChild, AfterViewInit, input, computed, QueryList, ViewChildren} from '@angular/core';
import { GenericAnimatedSlide } from '../animated-slide/generic-animated-slide';
import OpenSeadragon from 'openseadragon';

@Component({
  selector: 'app-animated-slide-osd',
  templateUrl: './animated-slide-osd.component.html',
  styleUrls: ['./animated-slide-osd.component.scss']
})
export class AnimatedSlideIiifComponent extends GenericAnimatedSlide implements AfterViewInit {
  steps = input<{ x: number; y: number; w: number; h: number; text: string }[]>([
    {
      x: 0, y: 0, w: 1, h: 0.8,
      text: "Vincent van Gogh's 'The Bedroom'"
    },
    {
      x: 0.15, y: 0.1, w: 0.2, h: 0.2,
      text: "The painting and table."
    },
    {
      x: 0.6, y: 0.4, w: 0.25, h: 0.2,
      text: "A sturdy wooden bed."
    },
    {
      x: 0.35, y: 0.55, w: 0.15, h: 0.15,
      text: "Thick brushstrokes."
    },
    {
      x: 0, y: 0, w: 1, h: 0.8,
      text: "A portrait of domesticity and peace."
    }
  ]);
  @ViewChildren('textRef') textRefs!: QueryList<ElementRef>;

  @ViewChild('osdContainer') osdContainer!: ElementRef;
  viewer: any;

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.initOSD();
  }

  override viewportMultiplier = computed<number>(() => {
    const stepsBase = this.steps().length || 1;
    const transitionExtra = (this.exit() === 'reveal-top-exit' && this.enter() == 'reveal-enter') ? 3 :
      (this.enter() === 'reveal-enter' || this.exit() === 'reveal-top-exit') ? 2 : 1;
    const animatedAdjustment = this.isAnimated() ? 0 : 1;
    return Math.max(1, stepsBase + transitionExtra - animatedAdjustment);
  });

  protected getStepData(scrollY: number) {
    const viewportHeight = window.innerHeight;
    const containerTop = this.absoluteContainerTop;
    const minusviewport = this.enter() === 'reveal-enter' ? viewportHeight : 0;

    const relativeScroll = scrollY - containerTop - minusviewport;
    if (relativeScroll < 0) return { index: 0, progress: 0 };

    const index = Math.floor(relativeScroll / viewportHeight);
    const safeIndex = Math.max(0, Math.min(index, this.steps().length - 1));
    const progress = Math.min(Math.max((relativeScroll - safeIndex * viewportHeight) / viewportHeight, 0), 1);

    return { index: safeIndex, progress };
  }

  private initOSD() {
    setTimeout(() => {
      this.viewer = OpenSeadragon({
        element: this.osdContainer.nativeElement,
        tileSources: 'https://www.artic.edu/iiif/2/25c31d8d-21a4-9ea1-1d73-6a2eca4dda7e/info.json',
        showNavigationControl: false,
        gestureSettingsMouse: { clickToZoom: false, dragToPan: false, scrollToZoom: false },
        gestureSettingsTouch: { clickToZoom: false, dragToPan: false, scrollToZoom: false },
        alwaysBlend: true,
        animationTime: 0.5
      });
    }, 100)

  }

  override animateTextOnScroll() {
    const { index, progress } = this.getStepData(window.scrollY);

    const zoomEndTime = 0.2;
    const panProgress = Math.min(progress / zoomEndTime, 1);

    const current = this.steps()[index];
    const prev = this.steps()[index - 1] || current;

    if (this.viewer && this.viewer.viewport) {
      const bounds = new OpenSeadragon.Rect(
        prev.x + (current.x - prev.x) * panProgress,
        prev.y + (current.y - prev.y) * panProgress,
        prev.w + (current.w - prev.w) * panProgress,
        prev.h + (current.h - prev.h) * panProgress
      );
      this.viewer.viewport.fitBounds(bounds, true);
    }
    const textProgress = progress > zoomEndTime
      ? (progress - zoomEndTime) / (1 - zoomEndTime)
      : 0;

    this.renderTextStep(index, textProgress);
  }

  protected renderTextStep(
    activeIndex: number,
    progress: number,
  ): void {
    if (!this.textRefs) return;

    this.textRefs.forEach((ref, i) => {
      const el = ref.nativeElement as HTMLElement;

      if (i < activeIndex) {
        // The step is a past step, it disappears
        el.style.transform = `translateY(-100vh)`;
        el.style.opacity = '0';
      } else if (i > activeIndex) {
        // The step is a future step, it waits
        el.style.transform = `translateY(100vh)`;
        el.style.opacity = '0';
      } else {
        // This is the current step, it scrolls up until it disappears
        const textY = 100 - (progress * 200);

        // The text fades in the first half, fades out the second half
        const opacity = progress < 0.5
          ? progress * 2
          : 2 - (progress * 2);

        el.style.transform = `translateY(${textY}vh)`;
        el.style.opacity = `${opacity}`;
      }
    });
  }
}

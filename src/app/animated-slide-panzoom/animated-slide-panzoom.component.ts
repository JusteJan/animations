import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  Input,
  AfterViewInit, input, HostBinding, computed
} from '@angular/core';
import { animate } from 'animejs';
import {GenericAnimatedSlide} from '../animated-slide/generic-animated-slide';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-animated-slide-panzoom',
  templateUrl: './animated-slide-panzoom.component.html',
  imports: [
    NgStyle
  ],
  styleUrls: ['./animated-slide-panzoom.component.scss']
})
export class AnimatedSlidePanzoomComponent
  extends GenericAnimatedSlide
  implements AfterViewInit {

  steps = input<{ scale: number; x: number; y: number; text: string }[]>([{x: 0, y: 0, scale: 1, text: "First"}, {x: 50, y: 50, scale: 5, text: "Second"}, {x: 50, y: 50, scale: 5, text: "Third"}, {x: 10, y: 10, scale: 1.5, text: "Fourth"}, {x: 90, y: 90, scale: 10, text: "Fifth"}]);
  @ViewChild('bgRef') bgRef!: ElementRef<HTMLImageElement>;
  @ViewChildren('textRef') textRefs!: QueryList<ElementRef>;

  override viewportMultiplier = computed<number>(() => {
      const enterExitViewport = (this.exit() === 'reveal-top-exit' && this.enter() == 'reveal-enter') ? 3 : (this.enter() === 'reveal-enter' || this.exit() === 'reveal-top-exit') ? 2 : 1;
      const subtractedViewport = (this.isAnimated()) ? 0 : 1;

      return enterExitViewport - subtractedViewport;
    }
  );


  @HostBinding('style.--container-height')
  override get getContainerHeight() {
    let multiplier = this.viewportMultiplier() + this.steps().length;

    return `${(multiplier) * 100}vh`;
  }

  @HostBinding('style.--margin-reveal')
  override get getMarginReveal() {
    if (this.enter() === 'reveal-enter') {
      return `-100vh`;
    }

    return null;
  }


  private animateSteps(scrollY: number, containerTop: number, viewportHeight: number) {
    if (!this.steps() || this.steps().length === 0) return;

    const stepHeight = viewportHeight; // 100vh per step
    const stepsCount = this.steps().length;

// how far we are inside the steps region
    let minusviewport = this.enter() === 'reveal-enter' ? viewportHeight : 0;
    const stepsScrollY = scrollY - containerTop - minusviewport;

    if (stepsScrollY < 0) {
      return 0;
    }

// current step index
    const stepIndex = Math.floor(stepsScrollY / stepHeight);

// clamp
    const safeStepIndex = Math.max(0, Math.min(stepIndex, stepsCount - 1));

// progress inside this current step
    let stepProgress =
      (stepsScrollY - safeStepIndex * stepHeight) / stepHeight;

    stepProgress = Math.min(Math.max(stepProgress, 0), 1);

    const panProgress = Math.min(stepProgress * 2, 1);       // 0 → 1 (first half)
    const textProgress = Math.max((stepProgress - 0.5) * 2, 0); // 0 → 1 (second half)

    const currentStep = this.steps()[safeStepIndex];
    const prevStep = this.steps()[safeStepIndex - 1] ?? currentStep;

// interpolation from previous to current step for smooth transition
    const scale =
      prevStep.scale + (currentStep.scale - prevStep.scale) * panProgress;
    const x =
      prevStep.x + (currentStep.x - prevStep.x) * panProgress;
    const y =
      prevStep.y + (currentStep.y - prevStep.y) * panProgress;

    animate(this.bgRef.nativeElement, {
      scale,
      translateX: x,
      translateY: y,
      easing: 'linear',
      duration: 0.001
    });

    this.textRefs.forEach((ref, i) => {
      const el = ref.nativeElement;

      if (i < safeStepIndex) {
        // already passed step is fully above viewport
        el.style.top = '-100%';
        el.style.opacity = '0';
        return;
      }

      if (i > safeStepIndex) {
        // not yet active is below viewport
        el.style.top = '100%';
        el.style.opacity = '0';
        return;
      }

      const y = 100 - textProgress * 100;

      animate(el, {
        top: `${y}%`,
        opacity: 1,
        easing: 'linear',
        duration: 0.001
      });
    });

    return safeStepIndex;
  }

  override animateTextOnScroll() {
    const containerEl = this.slideRef.nativeElement.parentElement;

    const scrollY = window.scrollY;
    const rect = containerEl.getBoundingClientRect();

    const containerTop = rect.top + window.scrollY;
    const viewportHeight = window.innerHeight;
    const stepIndex = this.animateSteps(scrollY, containerTop, viewportHeight) ?? 0;
  }
}

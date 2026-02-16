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
// 1. Calculate how many viewports we need for the Pan/Zoom steps
      const stepsBase = this.steps().length;

      // 2. Add extra viewports for the transitions (Your original logic)
      const transitionExtra = (this.exit() === 'reveal-top-exit' && this.enter() == 'reveal-enter') ? 3 : (this.enter() === 'reveal-enter' || this.exit() === 'reveal-top-exit') ? 2 : 1;

      // 3. Subtract 1 if not animated (prevents dead scroll space)
      const animatedAdjustment = this.isAnimated() ? 0 : 1;

      // Total = Steps + Transition Buffers - Animation Adjustment
      // Ensure we never go below 1
      return Math.max(1, stepsBase + transitionExtra - animatedAdjustment);
    }
  );


  @HostBinding('style.--container-height')
  override get getContainerHeight() {
    return `${this.viewportMultiplier() * 100}vh`;
  }

  @HostBinding('style.--margin-reveal')
  override get getMarginReveal() {
    if (this.enter() === 'reveal-enter') {
      return `-100vh`;
    }

    return null;
  }


  private animateSteps(scrollY: number, containerTop: number, viewportHeight: number) {
    if (!this.steps() || this.steps().length === 0) return 0;

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

    const currentStep = this.steps()[safeStepIndex];
    const prevStep = this.steps()[safeStepIndex - 1] ?? currentStep;

    const isStatic = currentStep.x === prevStep.x &&
      currentStep.y === prevStep.y &&
      currentStep.scale === prevStep.scale;

    const panProgress = isStatic ? 1 : Math.min(stepProgress * 2, 1);       // 0 → 1 (first half)
    const textProgress = isStatic ? stepProgress : Math.max((stepProgress - 0.5) * 2, 0); // 0 → 1 (second half)


// interpolation from previous to current step for smooth transition
    const scale =
      prevStep.scale + (currentStep.scale - prevStep.scale) * panProgress;
    const x =
      prevStep.x + (currentStep.x - prevStep.x) * panProgress;
    const y =
      prevStep.y + (currentStep.y - prevStep.y) * panProgress;

    const bg = this.bgRef.nativeElement;
    bg.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

    this.textRefs.forEach((ref, i) => {
      const el = ref.nativeElement;

      if (i < safeStepIndex) {
        // Passed: Hidden above
        el.style.transform = `translateY(-100vh)`;
        el.style.opacity = '0';
      } else if (i > safeStepIndex) {
        // Future: Hidden below
        el.style.transform = `translateY(100vh)`;
        el.style.opacity = '0';
      } else {
        // Current: Moves from 100vh -> 0vh -> -100vh
        // Range is 200vh total travel distance
        const textY = 100 - (textProgress * 200);

        // Fade in until 50% scroll, then fade out
        const opacity = textProgress < 0.5
          ? textProgress * 2
          : 2 - (textProgress * 2);

        el.style.transform = `translateY(${textY}vh)`;
        el.style.opacity = `${opacity}`;
      }
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

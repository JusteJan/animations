import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit, input, HostBinding, computed
} from '@angular/core';
import {GenericAnimatedSlide} from '../animated-slide/generic-animated-slide';

@Component({
  selector: 'app-animated-slide-panzoom',
  templateUrl: './animated-slide-panzoom.component.html',
  styleUrls: ['./animated-slide-panzoom.component.scss']
})
export class AnimatedSlidePanzoomComponent
  extends GenericAnimatedSlide
  implements AfterViewInit {

  steps = input<{ scale: number; x: number; y: number; text: string }[]>([{x: 0, y: 0, scale: 1, text: "First"}, {x: 50, y: 50, scale: 5, text: "Second"}, {x: 50, y: 50, scale: 5, text: "Third"}, {x: 10, y: 10, scale: 1.5, text: "Fourth"}, {x: 90, y: 90, scale: 10, text: "Fifth"}]);
  @ViewChild('bgRef') bgRef!: ElementRef<HTMLImageElement>;
  @ViewChildren('textRef') textRefs!: QueryList<ElementRef>;

  override viewportMultiplier = computed<number>(() => {
      const stepsBase = this.steps().length;
      const transitionExtra = (this.exit() === 'reveal-top-exit' && this.enter() == 'reveal-enter') ? 3 : (this.enter() === 'reveal-enter' || this.exit() === 'reveal-top-exit') ? 2 : 1;
      const animatedAdjustment = this.isAnimated() ? 0 : 1;
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

    const stepHeight = viewportHeight;
    const stepsCount = this.steps().length;

    let minusviewport = this.enter() === 'reveal-enter' ? viewportHeight : 0;
    const stepsScrollY = scrollY - containerTop - minusviewport;

    if (stepsScrollY < 0) {
      return 0;
    }

    const stepIndex = Math.floor(stepsScrollY / stepHeight);

    const safeStepIndex = Math.max(0, Math.min(stepIndex, stepsCount - 1));

    let stepProgress =
      (stepsScrollY - safeStepIndex * stepHeight) / stepHeight;

    stepProgress = Math.min(Math.max(stepProgress, 0), 1);

    const currentStep = this.steps()[safeStepIndex];
    const prevStep = this.steps()[safeStepIndex - 1] ?? currentStep;

    const isStatic = currentStep.x === prevStep.x &&
      currentStep.y === prevStep.y &&
      currentStep.scale === prevStep.scale;

    //First half of step it pans and zooms
    const panProgress = isStatic ? 1 : Math.min(stepProgress * 2, 1);
    //Second half of step the text progresses
    const textProgress = isStatic ? stepProgress : Math.max((stepProgress - 0.5) * 2, 0);

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
        el.style.transform = `translateY(-100vh)`;
        el.style.opacity = '0';
      } else if (i > safeStepIndex) {
        el.style.transform = `translateY(100vh)`;
        el.style.opacity = '0';
      } else {
        const textY = 100 - (textProgress * 200);

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
    this.animateSteps(scrollY, containerTop, viewportHeight) ?? 0;
  }
}

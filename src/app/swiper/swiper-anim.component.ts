import { Component, ViewChild, AfterViewInit, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {animate} from 'animejs';
import {register} from 'swiper/element/bundle'
import {NgClass} from '@angular/common';

register(); // ← This is required

@Component({
  selector: 'app-swiper-anim',
  templateUrl: './swiper-anim.component.html',
  styleUrls: ['./swiper-anim.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgClass
  ]
})
export class SwiperAnimComponent implements AfterViewInit {
  @ViewChild('swiper', { static: true }) swiperEl!: ElementRef;
  isAutoplaying = true; // track state

  slides = ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'];
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left';

  ngAfterViewInit() {
    const swiperEl = this.swiperEl.nativeElement;
    swiperEl.initialize();

    const swiper = swiperEl.swiper;

    // ✅ Make first slide visible without animation
    const firstSlide = this.getActiveSlide();

    // ✅ Start autoplay after initialization (optional)
    if (swiper.autoplay) swiper.autoplay.start();

    swiper.on('progress', this.onProgress);
    swiper.on('setTransition', this.setTransition);
    swiper.on('setTranslate', this.setTranslate);
    swiper.on('slideChangeTransitionStart', () => {

      setTimeout(function() {
        swiper.animating = false;
      }, 0);
    });
  }

  onProgress(swiper: any, progress: any) {
    console.log('onProgress');
    console.log(progress)
    console.log(swiper.activeIndex);

    // swiper?.slides.forEach((slide: HTMLElement) => {
    //   slide.style.opacity = `${1 - Math.abs(progress)}`; // fade
    //   slide.style.transform = `translateY(${progress * 50}px)`; // vertical movement
    // });
  }

  setTranslate(swiper: any, translate: any) {
    swiper.autoplay.stop();
    console.log('setTranslate');
    console.log(translate);

    console.log(swiper.activeIndex);
    const slide = swiper.slides[swiper.activeIndex + 1];
    console.log(slide);
    animate(slide, {
      translateX: '0',
      translateY: ['-200vh', 0],
      opacity: [0, 1],
      duration: 2000,
      onComplete: () => swiper.autoplay.start()
    });
    // swiper.slides.forEach((slide: HTMLElement) => {
    //   const progress = (slide as any).progress;
    //
    //   // Skip first slide animation if realIndex === 0
    //   animate(slide, {
    //     translateX: 0,
    //     translateY: ['-200vh', 0],
    //     opacity: [0, 1],
    //     duration: 300,
    //   });
    // });
  }

  setTransition(swiper: any) {
    console.log('setTransition');
    swiper.slides.forEach((slide: HTMLElement) => {
      slide.style.transitionDuration = `${0}ms`;
    });
  }

  toggleAutoplay() {
    const swiper = this.swiperEl.nativeElement.swiper;

    if (this.isAutoplaying) {
      swiper.autoplay.stop();
    } else {
      swiper.autoplay.start();
    }

    this.isAutoplaying = !this.isAutoplaying;
  }

  onSlideChange() {
    console.log('change');
    const swiper = this.swiperEl.nativeElement.swiper;
    const newSlide = swiper.slides[swiper.activeIndex];

    // ✅ Only animate if not the first slide
    if (swiper.activeIndex !== 0) {
      this.animateIn(newSlide);
    }
  }

  getActiveSlide() {
    const swiper = this.swiperEl.nativeElement.swiper;
    return swiper.slides[swiper.activeIndex];
  }

  animateIn(el: HTMLElement) {
    const offset = 60;

    const positions: any = {
      left: `translateX(${offset}px)`,
      right: `translateX(-${offset}px)`,
      top: `translateY(${offset}px)`,
      bottom: `translateY(-${offset}px)`
    };

    animate(el, { opacity: 0, transform: positions[this.direction] });

    animate(el, {
      opacity: [0, 1],
      translateX: 0,
      translateY: 0,
      easing: 'easeOutQuad',
      duration: 600
    });
  }
}

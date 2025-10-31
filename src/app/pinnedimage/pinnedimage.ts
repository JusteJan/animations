import {AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import {animate} from 'animejs';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-pinnedimage',
  imports: [
    NgStyle
  ],
  templateUrl: './pinnedimage.html',
  styleUrl: './pinnedimage.scss',
})
export class Pinnedimage implements AfterViewInit {
  @Input() background!: string;
  @Input() text!: string;

  @ViewChild('slideRef') slideRef!: ElementRef;
  @ViewChild('textRef') textRef!: ElementRef;
  @ViewChild('slideContainer', { read: ElementRef }) slideContainer!: ElementRef;

  ngAfterViewInit() {
    this.animateTextOnScroll();
  }

  @HostListener('window:scroll', [])
  animateTextOnScroll() {
    const containerEl = this.slideRef.nativeElement.parentElement; // slide-container
    const textEl = this.textRef.nativeElement;

    const scrollY = window.scrollY;
    const containerTop = containerEl.offsetTop;
    const containerHeight = containerEl.offsetHeight;
    const viewportHeight = window.innerHeight;

    const pinDistance = containerHeight - viewportHeight;

    let progress = (scrollY - containerTop) / pinDistance;
    progress = Math.min(Math.max(progress, 0), 1); // clamp 0 → 1
    console.log(progress);

    // Animate text based on progress
    animate(textEl, {
      top: `${100 * (1 - progress)}%`,
      opacity: progress,
      ease: 'linear',
      duration: 0.001
    });
  }
}

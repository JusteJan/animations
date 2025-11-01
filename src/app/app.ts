import {AfterViewInit, Component, ElementRef, HostListener, QueryList, signal, ViewChildren} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Oldslides} from './slides/oldslides';
import {Slides} from './slides/slides';
import {SlideComponent} from './pin/slide-component';
import {Pinnedimage} from './pinnedimage/pinnedimage';
import {
  AnimatedSlideDraggingTextComponent
} from './animated-slide-dragging-text/animated-slide-dragging-text.component';
import {
  AnimatedSlidePinnedImageDraggingTextComponent
} from './animated-slide-pinned-image-dragging-text/animated-slide-pinned-image-dragging-text.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    Slides,
    SlideComponent,
    Pinnedimage,
    AnimatedSlideDraggingTextComponent,
    AnimatedSlidePinnedImageDraggingTextComponent
  ],
  styleUrl: './app.css'
})
export class App {
  }

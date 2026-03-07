import {Component} from '@angular/core';
import {
  AnimatedSlideDraggingTextComponent
} from './animated-slide-dragging-text/animated-slide-dragging-text.component';
import {
  AnimatedSlidePinnedImageDraggingTextComponent
} from './animated-slide-pinned-image-dragging-text/animated-slide-pinned-image-dragging-text.component';
import {SwiperAnimComponent} from './swiper/swiper-anim.component';
import {AnimatedSlidePanzoomComponent} from './animated-slide-panzoom/animated-slide-panzoom.component';
import {AnimatedSlideIiifComponent} from './animated-slide-osd/animated-slide-osd.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    AnimatedSlideDraggingTextComponent,
    AnimatedSlidePinnedImageDraggingTextComponent,
    AnimatedSlidePanzoomComponent,
    AnimatedSlideIiifComponent
  ],
  styleUrl: './app.css'
})
export class App {
  }

import {Component} from '@angular/core';
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
    AnimatedSlideDraggingTextComponent,
    AnimatedSlidePinnedImageDraggingTextComponent
  ],
  styleUrl: './app.css'
})
export class App {
  }

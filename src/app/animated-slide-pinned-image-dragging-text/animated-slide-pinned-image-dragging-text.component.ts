import {Component, input} from '@angular/core';
import {NgStyle} from '@angular/common';
import {GenericAnimatedSlide} from '../animated-slide/generic-animated-slide';

@Component({
  selector: 'app-animated-slide-pinned-image-dragging-text',
  templateUrl: './animated-slide-pinned-image-dragging-text.component.html',
  imports: [
    NgStyle
  ],
  styleUrls: ['./animated-slide-pinned-image-dragging-text.component.scss']
})
export class AnimatedSlidePinnedImageDraggingTextComponent extends GenericAnimatedSlide {
  image = input<string>('https://picsum.photos/id/1015/1200/800');

}

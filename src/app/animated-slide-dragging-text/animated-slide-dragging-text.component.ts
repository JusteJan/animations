import {Component} from '@angular/core';
import {NgStyle} from '@angular/common';
import {GenericAnimatedSlide} from '../animated-slide/generic-animated-slide';

@Component({
  selector: 'app-animated-slide-dragging-text',
  templateUrl: './animated-slide-dragging-text.component.html',
  imports: [
    NgStyle
  ],
  styleUrls: ['./animated-slide-dragging-text.component.scss']
})
export class AnimatedSlideDraggingTextComponent extends GenericAnimatedSlide {

}

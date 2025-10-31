import {AfterViewInit, Component, ElementRef, HostListener, QueryList, signal, ViewChildren} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Oldslides} from './slides/oldslides';
import {Slides} from './slides/slides';
import {SlideComponent} from './pin/slide-component';
import {Pinnedimage} from './pinnedimage/pinnedimage';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    Slides,
    SlideComponent,
    Pinnedimage
  ],
  styleUrl: './app.css'
})
export class App {
  }

import { Directive, output } from '@angular/core';

@Directive({
  selector: '[appPageSwipe]',
  host: {
    '(touchstart)': 'onTouchStart($event)',
    '(touchmove)': 'onTouchMove($event)',
    '(touchend)': 'onTouchEnd()',
  },
})
export class PageSwipeDirective {
  swipeLeft = output<void>();
  swipeRight = output<void>();

  private touchStartX = 0;
  private touchStartY = 0; // Added to track vertical start position
  private touchEndX = 0;
  private touchEndY = 0; // Added to track vertical end position
  private minSwipeDistance = 50;
  private maxVerticalDistance = 50; // Maximum allowed vertical movement

  onTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY; // Store Y coordinate
    }
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.touchEndX = event.touches[0].clientX;
      this.touchEndY = event.touches[0].clientY; // Store Y coordinate
    }
  }

  onTouchEnd() {
    const swipeDistanceX = this.touchStartX - this.touchEndX;
    const swipeDistanceY = this.touchStartY - this.touchEndY;

    // Check if vertical movement is within acceptable range
    if (Math.abs(swipeDistanceY) > this.maxVerticalDistance) {
      return; // Ignore swipe if vertical movement exceeds threshold
    }

    // Process horizontal swipe only if vertical movement is acceptable
    if (Math.abs(swipeDistanceX) > this.minSwipeDistance) {
      if (swipeDistanceX > 0) {
        this.swipeLeft.emit();
      } else {
        this.swipeRight.emit();
      }
    }
  }
}

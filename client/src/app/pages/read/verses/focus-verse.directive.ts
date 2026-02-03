import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[focusVerse]',
  standalone: true,
})
export class FocusVerseDirective {
  private el = inject(ElementRef);

  readonly focusVerse = input(false);

  constructor() {
    effect(() => {
      const focusVerse = this.focusVerse();

      if (focusVerse) {
        const element = this.el.nativeElement;
        element.style.fontWeight = 'bold';

        // Apply color immediately, or after next frame if theme isn't ready
        const applyColor = () => {
          if (document.getElementsByClassName('ion-palette-dark').length > 0) {
            element.style.color = 'wheat';
          }
        };

        applyColor();
        requestAnimationFrame(applyColor); // Retry after DOM updates
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

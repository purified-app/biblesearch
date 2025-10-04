import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appFocusVerse]',
  standalone: true,
})
export class FocusVerseDirective {
  private el = inject(ElementRef);

  readonly verseNumber = input<number | undefined>(undefined);
  readonly versesToFocus = input<number[]>([]);

  constructor() {
    effect(() => {
      const verseNumber = this.verseNumber();
      const versesToFocus = this.versesToFocus();

      if (verseNumber && versesToFocus.includes(verseNumber)) {
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

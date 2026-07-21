import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[scrollTo]',
  standalone: true,
  host: {
    '[class.highlight]': 'scrollTo()',
  },
})
export class ScrollToDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly scrollTo = input(false);

  constructor() {
    effect(() => {
      if (this.scrollTo()) {
        // Wait for the next animation frame to ensure the DOM is fully updated and layout is calculated
        requestAnimationFrame(() => {
          this.el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    });
  }
}

import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import HighlightUtils from 'src/app/utils/highlight.utils';

@Directive({ selector: '[highlightColor]' })
export class HighlightColorDirective {
  highlightColor = input<string | undefined>(undefined);

  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement;
    effect(() => {
      const color = this.highlightColor();
      element.style.backgroundColor = HighlightUtils.getHighlightBackgroundColor(color);
      element.style.color = HighlightUtils.getHighlightTextColor(color);
    });
  }
}

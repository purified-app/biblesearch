import { computed, Directive, effect, ElementRef, inject, input } from '@angular/core';
import HighlightUtils from 'src/app/utils/highlight.utils';

@Directive({
  selector: '[highlightColor]',
})
export class HighlightColorDirective {
  highlightColor = input<string | undefined>(undefined);

  private backgroundColor = computed(() => {
    return HighlightUtils.getHighlightBackgroundColor(this.highlightColor());
  });
  private textColor = computed(() => {
    return HighlightUtils.getHighlightTextColor(this.highlightColor());
  });
  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      this.el.nativeElement.style.backgroundColor = this.backgroundColor();
    });

    effect(() => {
      this.el.nativeElement.style.color = this.textColor();
    });
  }
}

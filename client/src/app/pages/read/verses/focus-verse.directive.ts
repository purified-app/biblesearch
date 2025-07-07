import { Directive, ElementRef, AfterViewInit, inject, input } from '@angular/core';

@Directive({
  selector: '[appFocusVerse]',
  standalone: true,
})
export class FocusVerseDirective implements AfterViewInit {
  private el = inject(ElementRef);

  readonly verseNumber = input<number | undefined>(undefined);
  readonly versesToFocus = input<number[]>([]); // Input for verses to focus

  ngAfterViewInit(): void {
    this.applyHighlight();
  }

  private applyHighlight() {
    const verseNumber = this.verseNumber();
    if (verseNumber && this.versesToFocus().includes(verseNumber)) {
      this.el.nativeElement.style.fontWeight = 'bold';
      if (document.getElementsByClassName('ion-palette-dark')) {
        this.el.nativeElement.style.color = 'wheat';
      }
      setTimeout(() => {
        this.el.nativeElement.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }
}

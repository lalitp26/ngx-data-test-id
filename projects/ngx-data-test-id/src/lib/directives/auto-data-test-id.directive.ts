import { Directive, ElementRef, inject } from '@angular/core';
import { DataTestIdGeneration } from '../strategies/data-test-id-generation';
import { DataTestidAttributes } from '../models/data-test-id.attributes';

@Directive({
  selector: `
    button:not([data-testid]),
  input:not([data-testid]),
  textarea:not([data-testid]),
  select:not([data-testid]),
  a:not([data-testid]),
  [role="button"]:not([data-testid]),
  [libAutoDataTestId]`,
  standalone: true,
})
export class AutoDataTestIdDirective {
  private readonly testIdGenerator = new DataTestIdGeneration();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly element: HTMLElement = this.elementRef.nativeElement;

  ngAfterViewInit(): void {
    this.generateAndSetDataTestid();
  }

  private generateAndSetDataTestid(): void {
    if (
      !this.element ||
      this.element.hasAttribute(DataTestidAttributes.DATA_TESTID)
    ) {
      return;
    }

    const testId = this.testIdGenerator.generate(this.element);

    if (!testId || testId.length === 0) {
      console.warn(
        '[AutoDataTestId] Generated empty data-testid, using fallback.'
      );
      const fallbackId = this.element.tagName.toLowerCase() + '-' + Date.now();
      this.element.setAttribute(DataTestidAttributes.DATA_TESTID, fallbackId);
      return;
    }

    this.element.setAttribute(DataTestidAttributes.DATA_TESTID, testId);
  }
}

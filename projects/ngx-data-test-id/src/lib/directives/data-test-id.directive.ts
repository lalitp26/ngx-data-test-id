import { Directive, ElementRef, inject, input, isDevMode } from '@angular/core';
import { DataTestIdService } from '../services/data-test-id.service';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[libDataTestId]',
  standalone: true,
})
export class DataTestIdDirective {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly dataTestIdService = inject(DataTestIdService);
  private readonly document = inject(DOCUMENT);
  private currentDataTestId: string | null = null;

  protected readonly libDataTestId = input<string | null>(null);
  protected readonly libDataTestIdPrefix = input<string | null>(null);
  protected readonly libDataTestIdSuffix = input<string | null>(null);
  protected readonly developmentMode = input<boolean>(false);
  protected readonly validate = input<boolean>(true);

  ngOnInit(): void {
    // if (!this.developmentMode() && !isDevMode()) {
    //   return;
    // }

    if (!this.element?.nativeElement) {
      console.error('[libDataTestId] ElementRef is not available');
      return;
    }

    const dataTestId = this.resolveDataTestId();

    if (dataTestId) {
      if (this.validate()) {
        this.validateDataTestIdFormat(dataTestId);
      }

      this.setDataTestIdAttribute(dataTestId);
      this.registerDataTestId(dataTestId);
      this.currentDataTestId = dataTestId;
    }
  }

  ngOnDestroy(): void {
    if (this.currentDataTestId && this.element?.nativeElement) {
      this.dataTestIdService.unregisterDataTestId(
        this.currentDataTestId,
        this.element.nativeElement
      );
    }
  }

  private resolveDataTestId(): string | null {
    let dataTestId: string | null = null;

    const providedDataTestId = this.libDataTestId();
    if (
      typeof providedDataTestId === 'string' &&
      providedDataTestId.trim().length > 0
    ) {
      dataTestId = providedDataTestId.trim();
    } else {
      dataTestId = this.generateDataTestId();
    }

    if (!dataTestId) {
      console.error('[libDataTestId] Unable to resolve data-test-id');
      return null;
    }

    const prefix = this.libDataTestIdPrefix();
    if (prefix) {
      dataTestId = `${prefix}-${dataTestId}`;
    }

    return dataTestId;
  }

  private generateDataTestId(): string | null {
    const nativeElement = this.element.nativeElement;
    let dataTestId: string | null = null;

    dataTestId = this.getExplicitDataTestId(nativeElement);
    if (dataTestId) {
      return dataTestId;
    }

    dataTestId = this.getSemanticIdentifier(nativeElement);
    if (dataTestId) {
      return dataTestId;
    }

    dataTestId = this.getFormSpecificIdentifier(nativeElement);
    if (dataTestId) {
      return dataTestId;
    }

    dataTestId = this.getStructuralIdentifier(nativeElement);
    if (dataTestId) {
      return dataTestId;
    }
    return null;
  }

  private getExplicitDataTestId(element: HTMLElement): string | null {
    const dataTestIdAttr = [
      'data-testid',
      'dataTestId',
      'libDataTestId',
      'data-test-id',
      'data-qa',
      'data-test',
    ];

    for (const attr of dataTestIdAttr) {
      const attrValue = element.getAttribute(attr);
      if (attrValue && attrValue.trim().length > 0) {
        return this.sanitizeDataTestId(attrValue.trim());
      }
    }
    return null;
  }

  private getSemanticIdentifier(element: HTMLElement): string | null {
    if (!element) {
      return null;
    }
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim().length > 0) {
      return this.sanitizeDataTestId(ariaLabel.trim());
    }
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy && ariaLabelledBy.trim().length > 0) {
      const labelledElement = this.document?.getElementById(
        ariaLabelledBy.trim()
      );
      if (labelledElement) {
        const labelText = labelledElement.textContent;
        if (labelText && labelText.trim().length > 0) {
          return this.sanitizeDataTestId(labelText.trim());
        }
      }
    }
    return null;
  }

  private getFormSpecificIdentifier(element: HTMLElement): string | null {
    const tagName = element.tagName.toLowerCase();
    const name = element.getAttribute('name');

    if (name && name.trim().length > 0) {
      return this.sanitizeDataTestId(name.trim());
    }

    let typeAttribute: string | null = null;

    if (['input', 'select', 'textarea'].includes(tagName)) {
      typeAttribute = element.getAttribute('type') || 'text';
      const placeHolder = element.getAttribute('placeholder');

      if (placeHolder && placeHolder.trim().length > 0) {
        return this.sanitizeDataTestId(
          `${typeAttribute}-${placeHolder.trim()}`
        );
      }
    }

    if (['button', 'submit', 'reset'].includes(tagName)) {
      typeAttribute = element.getAttribute('type') || 'button';
      const valueAttribute =
        element.getAttribute('value') ||
        (element as HTMLButtonElement).textContent;
      if (valueAttribute && valueAttribute.trim().length > 0) {
        return this.sanitizeDataTestId(
          `${typeAttribute}-${valueAttribute.trim()}`
        );
      }
    }
    if (
      tagName &&
      tagName.trim().length > 0 &&
      typeAttribute &&
      typeAttribute.trim().length > 0
    ) {
      return this.sanitizeDataTestId(`${tagName}-${typeAttribute}`);
    }
    return null;
  }

  private getStructuralIdentifier(element: HTMLElement): string | null {
    const idAttribute = element.getAttribute('id');

    if (idAttribute && idAttribute.trim().length > 0) {
      return this.sanitizeDataTestId(idAttribute.trim());
    }

    const roleAttribute = element.getAttribute('role');
    if (roleAttribute && roleAttribute.trim().length > 0) {
      return this.sanitizeDataTestId(roleAttribute.trim());
    }
    return null;
  }

  private sanitizeDataTestId(dataTestId: string): string {
    return dataTestId
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-') // replace invalid characters with hyphen
      .replace(/--+/g, '-') // replace multiple hyphens with a single hyphen
      .replace(/^-+/, '') // remove leading hyphens
      .replace(/-+$/, ''); // remove trailing hyphens
  }

  private validateDataTestIdFormat(dataTestId: string): void {
    if (typeof dataTestId !== 'string' || dataTestId.trim().length === 0) {
      console.error('[libDataTestId] data-test-id must be a non-empty string');
      return;
    }

    const validationErrors: string[] = [];

    if (dataTestId.length < 3) {
      validationErrors.push('Test ID is too short (minimum 3 characters)');
    }

    if (dataTestId.length > 100) {
      validationErrors.push('Test ID is too long (maximum 100 characters)');
    }

    if (/^[a-zA-Z0-9-_]+$/.test(dataTestId) === false) {
      validationErrors.push(
        'Test ID contains invalid characters (only alphanumeric, hyphens, and underscores are allowed)'
      );
    }

    if (/--/.test(dataTestId) || /__/.test(dataTestId)) {
      validationErrors.push(
        'Test ID contains consecutive hyphens or underscores'
      );
    }

    if (/^-|-$/.test(dataTestId)) {
      validationErrors.push('Test ID cannot start or end with a hyphen');
    }

    if (/[A-Z]/.test(dataTestId)) {
      validationErrors.push('Test ID should be in lowercase');
    }

    if (validationErrors.length > 0) {
      console.warn(
        '[libDataTestId] data-test-id validation errors:\n' +
          validationErrors.join('\n')
      );
    }
  }

  private setDataTestIdAttribute(dataTestId: string): void {
    if (!this.element?.nativeElement) {
      console.error('[libDataTestId] ElementRef is not available');
      return;
    }
    this.element.nativeElement.setAttribute('data-testid', dataTestId);
  }

  private registerDataTestId(dataTestId: string): void {
    this.dataTestIdService.registerDataTestId({
      id: dataTestId,
      element: this.element.nativeElement,
    });
  }
}

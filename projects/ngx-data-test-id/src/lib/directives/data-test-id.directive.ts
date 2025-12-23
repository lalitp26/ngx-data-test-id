import {
  Directive,
  ElementRef,
  inject,
  input,
  isDevMode,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DataTestIdService } from '../services/data-test-id.service';
import { DOCUMENT } from '@angular/common';
import {
  DataTestidAttributes,
  DataTestidAttributesArray,
} from '../models/data-test-id.attributes';
import { DataTestidRegex } from '../models/data-test-id.regex';

@Directive({
  selector: '[libDataTestId]',
  standalone: true,
})
export class DataTestIdDirective implements OnInit, OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly dataTestIdService = inject(DataTestIdService);
  private readonly document = inject(DOCUMENT);
  private currentDataTestId: string | null = null;

  public readonly libDataTestId = input<string | null>(null);
  public readonly libDataTestIdPrefix = input<string | null>(null);
  public readonly libDataTestIdSuffix = input<string | null>(null);
  public readonly developmentMode = input<boolean>(false);
  public readonly validate = input<boolean>(true);

  ngOnInit(): void {
    if (!this.developmentMode() && !isDevMode()) {
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
    if (this.currentDataTestId) {
      this.element.nativeElement.removeAttribute('data-testid');
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
      if (isDevMode()) {
        console.error('[libDataTestId] Unable to resolve data-test-id');
      }
      return null;
    }

    const prefix = this.libDataTestIdPrefix();
    if (prefix) {
      dataTestId = `${prefix}-${dataTestId}`;
    }

    const suffix = this.libDataTestIdSuffix();
    if (suffix) {
      dataTestId = `${dataTestId}-${suffix}`;
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
    for (const attr of DataTestidAttributesArray) {
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
      const placeholder = element.getAttribute('placeholder');

      if (placeholder && placeholder.trim().length > 0) {
        return this.sanitizeDataTestId(
          `${typeAttribute}-${placeholder.trim()}`
        );
      }
    }

    if (['button', 'submit', 'reset'].includes(tagName)) {
      typeAttribute = element.getAttribute('type') || 'button';
      const valueAttribute =
        element.getAttribute('value') || element.textContent;
      if (valueAttribute && valueAttribute.trim().length > 0) {
        return this.sanitizeDataTestId(
          `${typeAttribute}-${valueAttribute.trim()}`
        );
      }
    }
    if (typeAttribute && typeAttribute.trim().length > 0) {
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
      .replace(DataTestidRegex.INVALID_CHARACTERS, '-') // replace invalid characters with hyphen
      .replace(DataTestidRegex.MULTIPLE_HYPHENS, '-') // replace multiple hyphens with a single hyphen
      .replace(DataTestidRegex.LEADING_HYPHENS, '') // remove leading hyphens
      .replace(DataTestidRegex.TRAILING_HYPHENS, ''); // remove trailing hyphens
  }

  private validateDataTestIdFormat(dataTestId: string): void {
    if (typeof dataTestId !== 'string' || dataTestId.trim().length === 0) {
      if (isDevMode()) {
        console.error('[libDataTestId] data-test-id must be a non-empty string');
      }
      return;
    }

    const validationErrors: string[] = [];

    if (dataTestId.length < 3) {
      validationErrors.push('Test ID is too short (minimum 3 characters)');
    }

    if (dataTestId.length > 100) {
      validationErrors.push('Test ID is too long (maximum 100 characters)');
    }
    // Validate allowed characters
    if (!DataTestidRegex.ALLOWED_CHARACTERS.test(dataTestId)) {
      validationErrors.push(
        'Test ID contains invalid characters (only alphanumeric, hyphens, and underscores are allowed)'
      );
    }

    if (
      DataTestidRegex.CONSECUTIVE_HYPHENS.test(dataTestId) ||
      DataTestidRegex.CONSECUTIVE_UNDERSCORES.test(dataTestId)
    ) {
      validationErrors.push(
        'Test ID contains consecutive hyphens or underscores'
      );
    }

    if (DataTestidRegex.START_OR_END_HYPHEN.test(dataTestId)) {
      validationErrors.push('Test ID cannot start or end with a hyphen');
    }

    if (DataTestidRegex.UPPERCASE_LETTERS.test(dataTestId)) {
      validationErrors.push('Test ID should be in lowercase');
    }

    if (validationErrors.length > 0 && isDevMode()) {
      console.warn(
        '[libDataTestId] data-test-id validation errors:\n' +
          validationErrors.join('\n')
      );
    }
  }

  private setDataTestIdAttribute(dataTestId: string): void {
    this.element.nativeElement.setAttribute(
      DataTestidAttributes.DATA_TESTID,
      dataTestId
    );
  }

  private registerDataTestId(dataTestId: string): void {
    this.dataTestIdService.registerDataTestId({
      id: dataTestId,
      element: this.element.nativeElement,
    });
  }
}

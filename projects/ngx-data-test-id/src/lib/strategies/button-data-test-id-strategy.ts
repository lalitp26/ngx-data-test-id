import { BaseDataTestIdGenerationStrategy } from './data-test-id-generation.strategy';

export class ButtonDataTestIdStrategy extends BaseDataTestIdGenerationStrategy {
  priority = 1;

  override canHandle(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role')?.toLowerCase();
    return (
      tagName === 'button' ||
      (tagName === 'input' &&
        ['button', 'submit', 'reset'].includes((element as HTMLInputElement).type)) ||
      role === 'button'
    );
  }

  override generate(element: HTMLElement): string | null {
    const text = this.extractButtonText(element);
    const type = this.getButtonType(element);

    let baseId = 'button';

    if (type && type !== 'button' && text && text.length > 0) {
      baseId = `${type}-${text}`;
    }

    baseId = this.sanitize(baseId);
    return this.resolveCollisions(baseId, element);
  }

  private extractButtonText(element: HTMLElement): string {
    const text = element.textContent?.trim() || '';
    if (!text.length) {
      return 'action';
    }

    if (text.length > 20) {
      return this.extractKeywords(text);
    }
    return text;
  }

  private getButtonType(element: HTMLElement): string {
    const type = element.getAttribute('type');
    if (!type) {
      return 'button';
    }
    return type.toLowerCase();
  }
}

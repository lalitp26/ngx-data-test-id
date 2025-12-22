import { BaseDataTestIdGenerationStrategy } from './data-test-id-generation.strategy';

export class AnchorDataTestIdStrategy extends BaseDataTestIdGenerationStrategy {
  priority = 3;
  override canHandle(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'a';
  }

  override generate(element: HTMLElement): string | null {
    const text = this.extractAnchorText(element);
    const type = this.getLinkType(element);

    let baseId = '';

    if (text && text !== 'link') {
      baseId = `${type}-${text}`;
    } else {
      baseId = type || 'link';
    }
    baseId = this.sanitize(baseId);
    return this.resolveCollisions(baseId, element);
  }

  private extractAnchorText(element: HTMLElement): string {
    const text = element.textContent?.trim() || '';
    if (!text.length) {
      return 'link';
    }

    if (text.length > 20) {
      return this.extractKeywords(text);
    }
    return text;
  }

  private getLinkType(element: HTMLElement): string {
    const href = element.getAttribute('href') || '';
    if (href.startsWith('#')) {
      return 'anchor';
    } else if (href.startsWith('mailto:')) {
      return 'email-link';
    } else if (href.startsWith('tel:')) {
      return 'phone-link';
    }
    return 'link';
  }
}

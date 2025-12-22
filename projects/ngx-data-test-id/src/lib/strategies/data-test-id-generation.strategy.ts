export interface DataTestIdGenerationStrategy {
  priority: number;
  generate(element: HTMLElement): string | null;
  canHandle(element: HTMLElement): boolean;
}

export abstract class BaseDataTestIdGenerationStrategy implements DataTestIdGenerationStrategy {
  abstract priority: number;
  abstract generate(element: HTMLElement): string | null;
  abstract canHandle(element: HTMLElement): boolean;

  protected sanitize(value: string): string {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'unknown';
    }

    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading or trailing hyphens
      .substring(0, 50); // Limit length to 50 characters
  }

  protected resolveCollisions(proposedId: string, element: HTMLElement): string {
    const existingElements = document.querySelectorAll(`[data-testid="${proposedId}"]`);

    if (existingElements.length === 0) {
      return proposedId;
    }

    const position = this.getElementPosition(element, proposedId);
    const positionedId = `${proposedId}-${position}`;

    const positionIdExists =
      document.querySelectorAll(`[data-testid="${positionedId}"]`).length > 0;
    if (!positionIdExists) {
      return positionedId;
    }
    return `${proposedId}-${Date.now()}`;
  }

  private getElementPosition(element: HTMLElement, baseId: string): number {
    const tagName = element.tagName.toLowerCase();
    const allSimilarElements = Array.from(document.querySelectorAll(tagName)).filter((el) =>
      this.wouldGenerateSameId(el as HTMLElement, baseId)
    );

    return allSimilarElements.indexOf(element) + 1;
  }

  private wouldGenerateSameId(element: HTMLElement, targetId: string): boolean {
    const elementText = this.getElementText(element);
    const sanitizedElementText = this.sanitize(elementText);

    if (!sanitizedElementText) {
      return false;
    }

    if (sanitizedElementText === targetId) {
      return true;
    }

    const baseTargetId = targetId.replace(/-\d+$/, '');
    return sanitizedElementText === baseTargetId;
  }

  private getElementText(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'button') {
      return element.textContent?.trim() || '';
    }

    if (tagName === 'input' || tagName === 'textarea') {
      const name = element.getAttribute('name');
      const placeholder = element.getAttribute('placeholder');
      const ariaLabel = element.getAttribute('aria-label');
      return name || placeholder || ariaLabel || '';
    }

    return element.textContent?.trim() || '';
  }

  protected extractKeywords(text: string): string {
    return text
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 3)
      .join('-');
  }
}

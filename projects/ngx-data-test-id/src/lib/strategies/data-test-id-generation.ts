import { AnchorDataTestIdStrategy } from './anchor-data-test-id-strategy';
import { ButtonDataTestIdStrategy } from './button-data-test-id-strategy';
import { DataTestIdGenerationStrategy } from './data-test-id-generation.strategy';
import { InputDataTestIdStrategy } from './input-data-test-id-strategy';

export class DataTestidGeneration {
  private strategies: DataTestIdGenerationStrategy[] = [];

  constructor(strategies: DataTestIdGenerationStrategy[] = []) {
    this.strategies = strategies;
    if (strategies.length === 0) {
      this.addStrategy(new ButtonDataTestIdStrategy());
      this.addStrategy(new InputDataTestIdStrategy());
      this.addStrategy(new AnchorDataTestIdStrategy());
    }
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  public generate(element: HTMLElement): string | null {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(element)) {
        return strategy.generate(element);
      }
    }

    const tagName = element.tagName.toLowerCase();
    return `${tagName}-unknown`;
  }

  public addStrategy(strategy: DataTestIdGenerationStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }
}

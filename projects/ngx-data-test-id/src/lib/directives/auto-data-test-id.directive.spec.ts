import { ElementRef } from '@angular/core';
import { AutoDataTestIdDirective } from './auto-data-test-id.directive';

describe('AutoDataTestIdDirective', () => {
  it('should create an instance', () => {
    const elementRef = new ElementRef(document.createElement('div'));
    const directive = new AutoDataTestIdDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});

import { Injectable } from '@angular/core';

export interface DataTestIdMetaData {
  id: string;
  element: HTMLElement;
}

@Injectable({
  providedIn: 'root',
})
export class DataTestIdService {
  private readonly dataTestidRegistry = new Map<string, DataTestIdMetaData>();
  private readonly duplicateDataTestIds = new Set<string>();
  private readonly dataTestidElementRef = new Map<HTMLElement, string>();

  public registerDataTestId(dataTestidMetaData: DataTestIdMetaData): void {
    const { id, element } = dataTestidMetaData;

    if (
      !dataTestidMetaData.id ||
      typeof dataTestidMetaData.id !== 'string' ||
      dataTestidMetaData.id.trim().length === 0
    ) {
      console.error(
        '[DataTestIdService] Invalid id provided in dataTestidMetaData'
      );
      return;
    }

    if (!element || !(element instanceof HTMLElement)) {
      console.error(
        '[DataTestIdService] Invalid element provided in dataTestidMetaData'
      );
      return;
    }

    const cleanId = id.trim();
    const existingMetaData = this.dataTestidRegistry.get(cleanId);

    this.dataTestidElementRef.set(element, cleanId);
    if (!existingMetaData) {
      this.dataTestidRegistry.set(cleanId, {
        ...dataTestidMetaData,
        id: cleanId,
      });
    } else {
      this.duplicateDataTestIds.add(cleanId);
      console.warn(
        `[DataTestIdService] Duplicate data-test-id detected: ${cleanId}`,
        {
          originalElement: existingMetaData.element,
          duplicateElement: element,
        }
      );
    }
  }

  public unregisterDataTestId(dataTestid: string, element: HTMLElement): void {
    if (
      !dataTestid ||
      typeof dataTestid !== 'string' ||
      dataTestid.trim().length === 0
    ) {
      console.error(
        '[DataTestIdService] Invalid dataTestid for unregistration provided'
      );
      return;
    }

    if (!element || !(element instanceof HTMLElement)) {
      console.error(
        '[DataTestIdService] Invalid element provided for unregistration'
      );
      return;
    }

    const registeredDataTestid = this.dataTestidRegistry.get(dataTestid);

    if (registeredDataTestid && registeredDataTestid.element === element) {
      this.dataTestidRegistry.delete(dataTestid);
      this.duplicateDataTestIds.delete(dataTestid);
      this.dataTestidElementRef.delete(element);
    }
  }

  public getAllDataTestIds(): DataTestIdMetaData[] {
    return Array.from(this.dataTestidRegistry.values()).sort((a, b) =>
      a.id.localeCompare(b.id)
    );
  }

  public searchByDataTestid(dataTestid: string): DataTestIdMetaData[] {
    if (
      !dataTestid ||
      typeof dataTestid !== 'string' ||
      dataTestid.trim().length === 0
    ) {
      return [];
    }

    const lowerCaseSearch = dataTestid.trim().toLowerCase();
    const results: DataTestIdMetaData[] = [];
    for (const metaData of this.dataTestidRegistry.values()) {
      if (metaData.id.toLowerCase().includes(lowerCaseSearch)) {
        results.push(metaData);
      }
    }
    return results.sort((a, b) => a.id.localeCompare(b.id));
  }

  public getDuplicateDataTestIds(): string[] {
    return Array.from(this.duplicateDataTestIds).sort();
  }

  public clearRegistry(): void {
    this.dataTestidRegistry.clear();
    this.duplicateDataTestIds.clear();
    this.dataTestidElementRef.clear();
  }

  public getDataTestidRegistrySize(): number {
    return this.dataTestidRegistry.size;
  }

  public isDataTestidRegistered(dataTestid: string): boolean {
    if (
      !dataTestid ||
      typeof dataTestid !== 'string' ||
      dataTestid.trim().length === 0
    ) {
      return false;
    }
    return this.dataTestidRegistry.has(dataTestid.trim());
  }
}

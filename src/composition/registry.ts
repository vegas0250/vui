import type { CompositionContract } from './types';

const compositions = new Map<string, CompositionContract>();

/** Register how a host assembles its parts. A later call for the same id replaces the record. */
export function registerComposition(contract: CompositionContract): CompositionContract {
  compositions.set(contract.id, contract);
  return contract;
}

export function compositionFor(id: string): CompositionContract | undefined {
  return compositions.get(id);
}

export function compositionForHost(element: string): CompositionContract | undefined {
  return [...compositions.values()].find((contract) => contract.host === element);
}

export function listCompositions(): CompositionContract[] {
  return [...compositions.values()].sort((a, b) => a.id.localeCompare(b.id));
}

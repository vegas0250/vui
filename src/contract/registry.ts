import type { ComponentContract } from './types';

const contracts = new Map<string, ComponentContract>();

/** Register the platform contract for a custom element. A later call for the same name replaces the previous record. */
export function registerContract(contract: ComponentContract): ComponentContract {
  contracts.set(contract.element, contract);
  return contract;
}

export function contractFor(element: string): ComponentContract | undefined {
  return contracts.get(element);
}

export function listContracts(): ComponentContract[] {
  return [...contracts.values()].sort((a, b) => a.element.localeCompare(b.element));
}

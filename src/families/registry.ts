import type { FamilyContract, FamilyMember, FamilyName } from './types';

const families = new Map<FamilyName, FamilyContract>();
const members: FamilyMember[] = [];

export function registerFamily(contract: FamilyContract): FamilyContract {
  families.set(contract.name, contract);
  return contract;
}

export function joinFamily(member: FamilyMember): FamilyMember {
  const index = members.findIndex((item) => item.element === member.element && item.family === member.family);
  if (index >= 0) members.splice(index, 1, member);
  else members.push(member);
  return member;
}

export function familyFor(name: FamilyName): FamilyContract | undefined {
  return families.get(name);
}

export function listFamilies(): FamilyContract[] {
  return [...families.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function familyMembers(element?: string): FamilyMember[] {
  const list = element ? members.filter((member) => member.element === element) : [...members];
  return list.sort((a, b) => a.family.localeCompare(b.family) || a.element.localeCompare(b.element));
}

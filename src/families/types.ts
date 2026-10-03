export type FamilyName =
  | 'action'
  | 'field'
  | 'overlay'
  | 'navigation'
  | 'data'
  | 'feedback'
  | 'layout'
  | 'content'
  | 'desktop';

export interface FamilyContract {
  name: FamilyName;
  summary: string;
  /** Shared rules. A member lists the ones it implements. There is no family base class. */
  rules: readonly string[];
}

export interface FamilyMember {
  element: string;
  family: FamilyName;
  rules: readonly string[];
}

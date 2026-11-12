/**
 * @deprecated Legacy aliases for the former Fluent-aligned docs catalog.
 * Prefer `./docs-catalog`. Kept so stray internal imports keep compiling.
 */
export {
  catalogChildren,
  catalogGroup as fluentWebGroup,
  catalogGroupIcons as fluentWebGroupIcons,
  catalogGroupLabels as fluentWebGroupLabels,
  catalogGroups as fluentWebGroups,
  docsComponentCatalog,
  isCatalogChild,
} from './docs-catalog';
export type { CatalogGroup as FluentWebGroup } from './docs-catalog';

/** @deprecated Fluent reference names are no longer shown in the docs UI. */
export function fluentAlias(_tag: string): string {
  return '';
}

/** @deprecated Missing-host research moved to docs/research/component-matrix.md */
export const fluentWebMissing = [] as const;

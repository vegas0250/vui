import '../families/catalog';
import '../interaction/profiles';
import './catalog';

export { checkComposition, checkFamilyMember } from './check';
export { ownedChildren } from './dom';
export { compositionFor, compositionForHost, listCompositions, registerComposition } from './registry';
export type { CompositionChannel, CompositionContract, CompositionDirection, CompositionLink } from './types';

/** Direct light-DOM children of `host`. This is the parent → child channel. */
export function ownedChildren<T extends Element>(
  host: ParentNode,
  name: string,
  accept: (node: Element) => node is T,
): T[] {
  return [...host.querySelectorAll(`:scope > ${name}`)].filter(accept);
}

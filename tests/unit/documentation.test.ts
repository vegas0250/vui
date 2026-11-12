import { describe, expect, it } from 'vitest';
import '../../src/index';
import { componentCatalog, componentImport, description } from '../../src/showcase/component-data';
import { docsComponentCatalog, ungroupedCatalogHosts } from '../../src/showcase/docs-catalog';
import {
  buttonSections,
  exampleCode,
  exampleFor,
  exampleJsx,
  exampleStandalone,
  interfaceExample,
} from '../../src/showcase/examples';
import pkg from '../../package.json';

describe('documentation completeness', () => {
  it('documents every registered public visual element, including contextual children', () => {
    const catalog = componentCatalog();
    expect(new Set(catalog.map((c) => c.element)).size).toBe(catalog.length);
    expect(catalog.length).toBe(74);
    for (const contract of catalog) {
      expect(description(contract.element, 'ru'), contract.element).not.toBe('');
      expect(description(contract.element, 'en'), contract.element).not.toBe('');
      expect(customElements.get(contract.element), contract.element).toBeDefined();
      expect(Object.keys(pkg.exports)).toContain('./' + componentImport(contract.element).slice(4));
      const example = exampleFor(contract.element);
      expect(example.html, contract.element).toContain('<' + contract.element);
      expect(exampleStandalone(example), contract.element).toContain(`import '${componentImport(contract.element)}'`);
      expect(exampleStandalone(example), contract.element).toContain('<script type="module">');
      expect(exampleCode(example), contract.element).toContain(contract.element);
      expect(exampleCode(example), contract.element).not.toContain('applyTheme');
      expect(exampleCode(example), contract.element).not.toContain('setUIMode');
      expect(exampleCode(example), contract.element).not.toContain('wireExample');
      expect(exampleStandalone(example), contract.element).not.toContain('wireExample');
    }
  });

  it('assigns every non-child host to an explicit catalog group', () => {
    expect(ungroupedCatalogHosts()).toEqual([]);
    expect(docsComponentCatalog().length).toBeGreaterThan(40);
  });

  it('uses supported public attributes in every example', () => {
    const contracts = new Map(componentCatalog().map((contract) => [contract.element, contract]));
    const invalid: string[] = [];
    for (const example of componentCatalog().map((contract) => exampleFor(contract.element))) {
      const template = document.createElement('template');
      template.innerHTML = example.html;
      for (const element of template.content.querySelectorAll('*')) {
        if (!element.localName.startsWith('vui-')) continue;
        const allowed = new Set(contracts.get(element.localName)!.attributes.map((attribute) => attribute.name));
        for (const attribute of element.attributes) {
          if (/^(data-|aria-)/.test(attribute.name) || ['class', 'style', 'slot', 'id', 'role', 'tabindex', 'hidden', 'title', 'dir', 'lang'].includes(attribute.name)) continue;
          if (!allowed.has(attribute.name)) invalid.push(`${element.localName}: ${attribute.name}`);
        }
      }
    }
    expect(invalid).toEqual([]);
  });

  it('keeps composition snippets free of docs chrome serialization', () => {
    for (const id of ['settings', 'table', 'dialog', 'shell']) {
      const example = interfaceExample(id);
      const copied = exampleCode(example);
      expect(copied.length).toBeGreaterThan(20);
      expect(copied).not.toContain('applyTheme');
      expect(copied).not.toContain('setUIMode');
      expect(copied).not.toContain('wireExample');
      expect(copied).not.toContain('vui-example');
      expect(exampleStandalone(example)).toContain('import ');
    }
  });

  it('documents every button tone, variant family, size and state', () => {
    const html = buttonSections()
      .map((section) => section.example.html)
      .join('\n');
    for (const tone of ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info']) {
      expect(html).toContain(`tone="${tone}"`);
    }
    for (const variant of ['solid', 'soft', 'outline', 'ghost', 'primary', 'secondary', 'danger']) {
      expect(html).toContain(`variant="${variant}"`);
    }
    for (const size of ['small', 'medium', 'large']) expect(html).toContain(`size="${size}"`);
    expect(html).toContain('disabled');
    expect(html).toContain('loading');
    const jsx = exampleJsx(buttonSections()[0]!.example);
    expect(jsx).toContain("import { Button } from 'vui/react'");
    expect(jsx).toContain('<Button>');
    expect(jsx).toContain("'use client'");
  });

  it('ships working JSX for pilot components', () => {
    for (const tag of ['vui-button', 'vui-input', 'vui-select', 'vui-dialog', 'vui-menu']) {
      const jsx = exampleJsx(exampleFor(tag));
      expect(jsx, tag).toContain("from 'vui/react'");
      if (tag !== 'vui-button' && tag !== 'vui-menu') expect(jsx, tag).toMatch(/useState|useRef/);
    }
  });
});

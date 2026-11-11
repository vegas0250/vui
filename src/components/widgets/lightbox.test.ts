import { beforeEach, describe, expect, it } from 'vitest';
import './lightbox';
import type { VLightbox } from './lightbox';
import { clearOverlays } from '../../interaction/overlay';

describe('vui-lightbox', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('opens a stage from a thumbnail link', () => {
    const box = document.createElement('vui-lightbox') as VLightbox;
    box.setAttribute('label', 'Gallery');
    box.innerHTML = `
      <a href="https://example.com/a.jpg"><img alt="A" src="https://example.com/a.jpg"></a>
      <a href="https://example.com/b.jpg"><img alt="B" src="https://example.com/b.jpg"></a>
    `;
    document.body.append(box);
    box.open(1);
    expect(box.hasAttribute('open')).toBe(true);
    expect(box.getAttribute('index')).toBe('1');
    expect(document.querySelector('.vui-lightbox-stage')).toBeTruthy();
    box.close();
    expect(box.hasAttribute('open')).toBe(false);
    expect(document.querySelector('.vui-lightbox-stage')).toBeNull();
  });
});

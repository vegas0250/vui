import { beforeEach, describe, expect, it } from 'vitest';
import './carousel';
import type { VCarousel } from './carousel';

describe('vui-carousel', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('moves between slides and loops', () => {
    const carousel = document.createElement('vui-carousel') as VCarousel;
    carousel.setAttribute('label', 'Slides');
    carousel.setAttribute('loop', '');
    carousel.innerHTML = '<div>One</div><div>Two</div><div>Three</div>';
    document.body.append(carousel);
    expect(carousel.shadowRoot?.querySelector('[role="region"]')).toBeTruthy();
    expect(carousel.index === 0 || carousel.getAttribute('index') === '0' || !carousel.hasAttribute('index')).toBe(true);
    carousel.next();
    expect(carousel.getAttribute('index')).toBe('1');
    carousel.goTo(5);
    expect(carousel.getAttribute('index')).toBe('2');
    carousel.next();
    expect(carousel.getAttribute('index')).toBe('0');
  });
});

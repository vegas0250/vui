import { describe, expect, it } from 'vitest';
import '../../src/components/foundation/icon';
import { iconNames, registerIcon } from '../../src/icons/registry';

describe('vui-icon', () => {
  it('renders a built-in icon and a registered svg', () => {
    expect(iconNames).toContain('folder');
    const icon = document.createElement('vui-icon');
    icon.setAttribute('name', 'folder');
    document.body.append(icon);
    expect(icon.shadowRoot?.querySelector('svg')).not.toBeNull();
    expect(icon.getAttribute('aria-hidden')).toBe('true');

    registerIcon('mark', '<svg viewBox="0 0 10 10"><rect width="10" height="10"></rect></svg>');
    icon.setAttribute('name', 'mark');
    icon.setAttribute('label', 'Mark');
    expect(icon.shadowRoot?.querySelector('rect')).not.toBeNull();
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Mark');
  });
});

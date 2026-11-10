/** An embedded documentation window must not read or overwrite portal preferences. */
export const embedded = new URLSearchParams(location.search).get('embedded') === '1';
const prefix = embedded ? 'vui.documentation.' : '';
export const documentationStorage: Storage = {
  get length() { return Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length; },
  key(index) { return Object.keys(localStorage).filter((key) => key.startsWith(prefix))[index]?.slice(prefix.length) ?? null; },
  getItem(key) { return localStorage.getItem(prefix + key); },
  setItem(key, value) { localStorage.setItem(prefix + key, value); },
  removeItem(key) { localStorage.removeItem(prefix + key); },
  clear() { for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key); },
};

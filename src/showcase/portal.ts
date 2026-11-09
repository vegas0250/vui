import fallback from './portal-projects.json';
import { docsLocale, escapeHTML, tr } from './theme-i18n';
interface Project {
  slug: string;
  title: { ru: string; en: string };
  url: string;
}
function validProjects(
  value: unknown,
): value is { schemaVersion: 1; projects: Project[] } {
  if (!value || typeof value !== 'object') return false;
  const v = value as { schemaVersion?: unknown; projects?: unknown };
  return (
    v.schemaVersion === 1 &&
    Array.isArray(v.projects) &&
    v.projects.length <= 50 &&
    v.projects.some((p: Project) => p?.slug === 'vui') &&
    v.projects.every(
      (p: Project) =>
        p &&
        /^[a-z0-9-]+$/.test(p.slug) &&
        typeof p.title?.ru === 'string' &&
        typeof p.title?.en === 'string' &&
        p.url === `https://${p.slug}.vegas0250.ru/`,
    )
  );
}
export function mountPortalMenu(before: Element): void {
  const details = document.createElement('details');
  details.className = 'portal-menu';
  details.setAttribute('aria-label', tr('Portal projects'));
  details.innerHTML = `<summary>${escapeHTML(tr('Portal projects'))}</summary><nav class="portal-project-list" aria-label="${escapeHTML(tr('Portal projects'))}"></nav>`;
  before.before(details);
  const media = matchMedia('(min-width: 761px)');
  const responsive = () => {
    details.open = media.matches;
  };
  responsive();
  media.addEventListener('change', responsive);
  const render = (projects: Project[]) => {
    const nav = details.querySelector('nav')!;
    nav.replaceChildren();
    const home = document.createElement('a');
    home.href = `https://vegas0250.ru/?lang=${docsLocale}`;
    home.textContent = 'vegas0250.ru';
    nav.append(home);
    for (const p of projects) {
      const a = document.createElement('a');
      a.href = p.url + '?lang=' + docsLocale;
      a.textContent = p.title[docsLocale];
      if (p.slug === 'vui') a.setAttribute('aria-current', 'page');
      nav.append(a);
    }
  };
  render(fallback.projects);
  // Central portal catalog is optional: the versioned fallback also works offline.
  fetch('https://vegas0250.ru/api/projects', {
    signal: AbortSignal.timeout(4000),
    credentials: 'omit',
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((value) => {
      if (validProjects(value)) render(value.projects);
    })
    .catch(() => {});
}

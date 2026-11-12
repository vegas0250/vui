# Component expansion matrix (internal)

Internal research only. Not rendered in the public docs catalog.

## Rules

1. Compare purpose and behavior, not only names.
2. Libraries in this matrix: **MUI**, **Ant Design**, **Radix / shadcn**, **Chakra UI**, **Bootstrap**.
3. Admit a new first-class host only when analogs exist in **≥ 3 of 5** libraries.
4. Require a real application scenario.
5. Prefer an existing composition when it already covers the job.
6. An analog does **not** obligate immediate implementation.
7. Existing VUI hosts are not removed by this matrix.

## Current hosts (seed)

| VUI host | MUI | Ant Design | Radix/shadcn | Chakra | Bootstrap | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| button | ✓ | ✓ | ✓ | ✓ | ✓ | |
| icon-button | ✓ | ✓ | ✓ | ✓ | ~ | Icon-only button |
| button-group | ✓ | ✓ | ✓ | ✓ | ✓ | |
| toggle | ✓ | ✓ | ✓ | ✓ | ~ | Toggle button |
| input | ✓ | ✓ | ✓ | ✓ | ✓ | |
| textarea | ✓ | ✓ | ✓ | ✓ | ✓ | |
| checkbox | ✓ | ✓ | ✓ | ✓ | ✓ | |
| radio | ✓ | ✓ | ✓ | ✓ | ✓ | |
| switch | ✓ | ✓ | ✓ | ✓ | ~ | |
| select | ✓ | ✓ | ✓ | ✓ | ✓ | |
| slider | ✓ | ✓ | ✓ | ✓ | ✓ | |
| rating | ✓ | ✓ | ~ | ✓ | ✗ | ≥3 via MUI/Ant/Chakra |
| spin-button | ✓ | ✓ | ~ | ~ | ✗ | Number stepper |
| field | ✓ | ✓ | ✓ | ✓ | ✓ | Label + control chrome |
| breadcrumbs | ✓ | ✓ | ✓ | ✓ | ✓ | |
| toolbar | ✓ | ✓ | ✓ | ✓ | ~ | |
| nav | ✓ | ✓ | ✓ | ✓ | ✓ | |
| tabs | ✓ | ✓ | ✓ | ✓ | ✓ | |
| pagination | ✓ | ✓ | ✓ | ✓ | ✓ | |
| path-bar | ~ | ~ | ✗ | ✗ | ✗ | Covered as composition / desktop pattern |
| stepper | ✓ | ✓ | ~ | ✓ | ✗ | |
| list | ✓ | ✓ | ✓ | ✓ | ✓ | |
| data-grid | ✓ | ✓ | ~ | ~ | ✗ | Table / grid |
| file-tree | ✓ | ✓ | ~ | ~ | ✗ | Tree |
| properties | ~ | ~ | ✗ | ✗ | ✗ | Inspector composition |
| avatar | ✓ | ✓ | ✓ | ✓ | ~ | |
| avatar-group | ✓ | ✓ | ✓ | ✓ | ✗ | |
| persona | ~ | ~ | ✗ | ✗ | ✗ | Avatar + text composition candidate |
| badge | ✓ | ✓ | ✓ | ✓ | ✓ | |
| chip | ✓ | ✓ | ✓ | ✓ | ~ | Tag |
| kbd | ✗ | ✗ | ✓ | ✓ | ✗ | Keep; niche |
| text | ✓ | ✓ | ✓ | ✓ | ✓ | |
| link | ✓ | ✓ | ✓ | ✓ | ✓ | |
| separator | ✓ | ✓ | ✓ | ✓ | ✓ | |
| icon | ✓ | ✓ | ✓ | ✓ | ✓ | |
| carousel | ✓ | ✓ | ~ | ✓ | ✓ | |
| lightbox | ~ | ✓ | ~ | ~ | ✗ | Media viewer |
| alert | ✓ | ✓ | ✓ | ✓ | ✓ | |
| toast | ✓ | ✓ | ✓ | ✓ | ~ | |
| progress | ✓ | ✓ | ✓ | ✓ | ✓ | |
| spinner | ✓ | ✓ | ✓ | ✓ | ✓ | |
| skeleton | ✓ | ✓ | ✓ | ✓ | ✗ | |
| empty | ✓ | ✓ | ~ | ✓ | ✗ | |
| tooltip | ✓ | ✓ | ✓ | ✓ | ✓ | |
| dialog | ✓ | ✓ | ✓ | ✓ | ✓ | |
| drawer | ✓ | ✓ | ✓ | ✓ | ✗ | |
| popover | ✓ | ✓ | ✓ | ✓ | ~ | |
| menu | ✓ | ✓ | ✓ | ✓ | ✓ | |
| container | ✓ | ✓ | ✓ | ✓ | ✓ | |
| scroll-area | ✓ | ✓ | ✓ | ✓ | ~ | |
| stack / hstack / vstack | ✓ | ✓ | ✓ | ✓ | ✓ | |
| grid | ✓ | ✓ | ✓ | ✓ | ✓ | |
| split-panel | ✓ | ✓ | ~ | ~ | ✗ | Resizable panes |
| panel | ✓ | ✓ | ✓ | ✓ | ✓ | Card / surface |
| shell | ~ | ✓ | ✗ | ✗ | ✗ | Application frame |
| window | ✗ | ✗ | ✗ | ✗ | ✗ | Desktop chrome |
| titlebar | ✗ | ✗ | ✗ | ✗ | ✗ | Desktop chrome |
| status-bar | ✗ | ✗ | ✗ | ✗ | ✗ | Desktop chrome |

Legend: ✓ clear analog · ~ partial / compose · ✗ no common first-class host.

## Candidates not scheduled

Presence in ≥3 libraries alone is not a ship order. Examples deferred until a real app scenario needs them: virtual list, calendar surface, color picker popup, charts, dedicated image primitive.

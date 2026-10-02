# Разработка VUI

VUI остаётся маленькой библиотекой Web Components. Новый компонент добавляется только как рабочий элемент со showcase, а не как заглушка.

## Процесс

1. **Architecture / API.** Зафиксируйте имя `V*` и `vui-*`, attributes, properties, events, slots и parts. Проверьте, что этого ещё нет у существующего компонента. Если меняется уже выпущенное поведение — опишите breaking change в `CHANGELOG.md` до правки, а не после.
2. **Component.** Реализация на `VuiElement`. Состояние выставляется атрибутом и догоняется в `sync()`. Строки и флаги отражайте через `src/core/reflect.ts`. Рядом с `defineElement` вызовите `registerContract()`: attributes, events, slots, parts, methods, keyboard, states, responsive и focus. Если компонент входит в Action, Field, Overlay, Navigation или Data, добавьте его в `src/families` только с теми правилами, которые он реально выполняет. Если он собирает детей, зарегистрируйте композицию в `src/composition` и ищите прямых детей через `ownedChildren()`. Новый канал связи не добавляется. Слушатели, которые должны сняться при отключении, вешайте через `hold()` или `bind()`.
3. **Tokens.** Цвета, отступы, радиус, тень, фокус и z-index — только существующие токены. Новое имя токена добавляется в `src/tokens` и темы вместе, а не литералом в компоненте. Порог ширины читайте через `containerBand()`, а не второй копией 22rem/40rem в JavaScript.
4. **Responsive.** Опишите поведение для wide, medium и narrow. Предпочтение — container query, flex и grid. Отдельный mobile-компонент не создаётся.
5. **Accessibility.** Нативный элемент, имя, `:focus-visible`, disabled. ARIA — только если нативной семантики не хватает и она совпадает с фактическим состоянием.
6. **Keyboard.** Tab и те клавиши, которые следуют из роли. Для overlay берите `pushOverlay()` из `src/core/overlay.ts`, а не собственный слушатель Escape и z-index.
7. **Tests.** Unit на контракт и клавиатуру. Для компонента с `registerContract()` добавьте его в compliance-проверку или вызовите `checkCompliance()`. Составной сценарий проверяйте через `checkComposition()` и, если он меняет Form, Navigation, Data или Overlay, через сценарий в `src/composition/scenarios.ts`. Интерактивный компонент дополнительно получает e2e: роль, имя, фокус.
8. **Visual regression.** Добавьте компонент в `visual.html`, если у него есть видимые состояния. Не умножайте снимки на все темы и плотности: хватает матрицы из `ARCHITECTURE.md`. Обновляйте baseline только когда изменение вида намеренное.
9. **Documentation.** Строка в README, секция в `docs/components.md`, при необходимости — `ARCHITECTURE.md` и `.cursor/rules/project.mdc`. Пример в showcase обязателен.

## Имена

```text
VButton → <vui-button> → src/components/actions/button.ts
```

Не используйте `VuiButton`, `VBtn`, `v-button`.

## Что не добавлять без отдельной задачи

Card, badge, avatar, chip, charts, rich text, сложный calendar и прочие декоративные или узкоспециальные виджеты. Сначала должен появиться контракт и сценарий в showcase.

## Проверки

```bash
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm test:e2e` включает showcase, responsive, accessibility и visual regression.

## Совместимость

Атрибут, который уже читает страница, остаётся. Новый property, который пишет тот же атрибут, — расширение, а не замена. Не делайте второй атрибут с тем же смыслом.

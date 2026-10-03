import { registerFamily, joinFamily } from './registry';

registerFamily({
  name: 'action',
  summary: 'Действие: disabled, loading когда действие ждёт, фокус, клавиатура, активация и доступное имя. Иконка — только когда она есть.',
  rules: ['disabled', 'loading', 'focus', 'keyboard', 'activation', 'icon', 'label'],
});

registerFamily({
  name: 'field',
  summary: 'Поле: значение, disabled, invalid, подпись и фокус. Описание — hint. Ошибка — invalid, отдельного атрибута error нет.',
  rules: ['value', 'disabled', 'invalid', 'required', 'label', 'description', 'error', 'focus'],
});

registerFamily({
  name: 'overlay',
  summary: 'Слой: открытие, закрытие, Escape, возврат фокуса, позиция и общий стек overlay.',
  rules: ['open', 'close', 'escape', 'focus-restore', 'positioning', 'layering'],
});

registerFamily({
  name: 'navigation',
  summary: 'Навигация: roving focus, клавиатура списка и один выбор. Соседи не выбирают друг друга сами.',
  rules: ['roving', 'keyboard', 'selection', 'focus', 'disabled', 'label'],
});

registerFamily({
  name: 'data',
  summary: 'Данные: клавиатура, выбор и курсор. Идентификатор строки не является доменной сущностью.',
  rules: ['keyboard', 'selection', 'focus', 'roving'],
});

joinFamily({ element: 'vui-button', family: 'action', rules: ['disabled', 'loading', 'focus', 'keyboard', 'activation', 'label'] });
joinFamily({ element: 'vui-button-group', family: 'action', rules: ['disabled', 'focus', 'keyboard', 'label'] });
joinFamily({
  element: 'vui-icon-button',
  family: 'action',
  rules: ['disabled', 'loading', 'focus', 'keyboard', 'activation', 'icon', 'label'],
});
joinFamily({
  element: 'vui-menu-item',
  family: 'action',
  rules: ['disabled', 'focus', 'keyboard', 'activation', 'label'],
});

joinFamily({
  element: 'vui-input',
  family: 'field',
  rules: ['value', 'disabled', 'invalid', 'required', 'label', 'description', 'error', 'focus'],
});
joinFamily({ element: 'vui-select', family: 'field', rules: ['value', 'disabled', 'invalid', 'label', 'focus'] });
joinFamily({ element: 'vui-checkbox', family: 'field', rules: ['value', 'disabled', 'invalid', 'label', 'focus'] });
joinFamily({ element: 'vui-switch', family: 'field', rules: ['value', 'disabled', 'label', 'focus'] });
joinFamily({
  element: 'vui-textarea',
  family: 'field',
  rules: ['value', 'disabled', 'invalid', 'required', 'label', 'description', 'error', 'focus'],
});
joinFamily({ element: 'vui-radio', family: 'field', rules: ['value', 'disabled', 'invalid', 'label', 'focus'] });
joinFamily({
  element: 'vui-radio-group',
  family: 'field',
  rules: ['value', 'disabled', 'invalid', 'required', 'label', 'description', 'error', 'focus'],
});

joinFamily({
  element: 'vui-dialog',
  family: 'overlay',
  rules: ['open', 'close', 'escape', 'focus-restore', 'layering'],
});
joinFamily({ element: 'vui-tooltip', family: 'overlay', rules: ['escape', 'positioning', 'layering'] });
joinFamily({
  element: 'vui-menu',
  family: 'overlay',
  rules: ['open', 'close', 'escape', 'focus-restore', 'positioning', 'layering'],
});
joinFamily({ element: 'vui-toaster', family: 'overlay', rules: ['layering'] });
joinFamily({
  element: 'vui-popover',
  family: 'overlay',
  rules: ['open', 'close', 'escape', 'focus-restore', 'positioning', 'layering'],
});

joinFamily({ element: 'vui-tabs', family: 'navigation', rules: ['roving', 'keyboard', 'selection', 'focus'] });
joinFamily({ element: 'vui-tab', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'disabled'] });
joinFamily({ element: 'vui-tab-panel', family: 'navigation', rules: ['selection'] });
joinFamily({ element: 'vui-file-tree', family: 'navigation', rules: ['roving', 'keyboard', 'selection', 'focus'] });
joinFamily({ element: 'vui-tree-item', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'label'] });
joinFamily({ element: 'vui-menu', family: 'navigation', rules: ['roving', 'keyboard', 'focus'] });
joinFamily({ element: 'vui-menu-item', family: 'navigation', rules: ['keyboard', 'focus'] });
joinFamily({ element: 'vui-breadcrumbs', family: 'navigation', rules: ['keyboard', 'focus', 'label'] });
joinFamily({ element: 'vui-pagination', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'label'] });

joinFamily({ element: 'vui-data-grid', family: 'data', rules: ['keyboard', 'selection', 'focus', 'roving'] });

registerFamily({
  name: 'feedback',
  summary: 'Сообщение о состоянии: info, success, warning, danger, neutral. Цвет берётся из semantic tokens.',
  rules: ['variant', 'label', 'status'],
});

registerFamily({
  name: 'layout',
  summary: 'Раскладка через общий словарь gap, padding, align, justify и overflow. Это не CSS-фреймворк.',
  rules: ['gap', 'padding', 'align', 'justify', 'overflow'],
});

registerFamily({
  name: 'content',
  summary: 'Текст и метки: уровень, усечение, приглушение. Не заменяют поля и не рисуют документ.',
  rules: ['label', 'level', 'truncate'],
});

registerFamily({
  name: 'desktop',
  summary: 'Оболочка рабочего места. Не знает о файлах, сети и прикладных сущностях.',
  rules: ['label', 'regions', 'keyboard'],
});

joinFamily({ element: 'vui-toggle', family: 'action', rules: ['disabled', 'focus', 'keyboard', 'activation', 'label'] });
joinFamily({ element: 'vui-toggle-group', family: 'action', rules: ['disabled', 'focus', 'keyboard', 'label'] });
joinFamily({ element: 'vui-link', family: 'action', rules: ['disabled', 'focus', 'keyboard', 'activation', 'label'] });

joinFamily({ element: 'vui-field', family: 'field', rules: ['disabled', 'invalid', 'required', 'label', 'description', 'error', 'focus'] });
joinFamily({ element: 'vui-field-group', family: 'field', rules: ['disabled', 'label', 'description'] });
joinFamily({ element: 'vui-slider', family: 'field', rules: ['value', 'disabled', 'invalid', 'label', 'description', 'focus'] });
joinFamily({
  element: 'vui-checkbox-group',
  family: 'field',
  rules: ['value', 'disabled', 'invalid', 'required', 'label', 'description', 'error', 'focus'],
});

joinFamily({
  element: 'vui-drawer',
  family: 'overlay',
  rules: ['open', 'close', 'escape', 'focus-restore', 'positioning', 'layering'],
});

joinFamily({ element: 'vui-nav', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'label'] });
joinFamily({ element: 'vui-nav-item', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'disabled', 'label'] });
joinFamily({ element: 'vui-stepper', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'label'] });
joinFamily({ element: 'vui-step', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'disabled'] });

joinFamily({ element: 'vui-list', family: 'data', rules: ['keyboard', 'selection', 'focus'] });
joinFamily({ element: 'vui-list-item', family: 'data', rules: ['selection', 'focus', 'disabled'] });
joinFamily({ element: 'vui-properties', family: 'data', rules: ['label'] });

joinFamily({ element: 'vui-alert', family: 'feedback', rules: ['variant', 'label', 'status'] });
joinFamily({ element: 'vui-empty', family: 'feedback', rules: ['label', 'status'] });
joinFamily({ element: 'vui-badge', family: 'feedback', rules: ['variant', 'label'] });
joinFamily({ element: 'vui-toast', family: 'feedback', rules: ['variant', 'label', 'status'] });

joinFamily({ element: 'vui-text', family: 'content', rules: ['label', 'level', 'truncate'] });
joinFamily({ element: 'vui-chip', family: 'content', rules: ['label'] });
joinFamily({ element: 'vui-kbd', family: 'content', rules: ['label'] });

joinFamily({ element: 'vui-shell', family: 'desktop', rules: ['label', 'regions', 'keyboard'] });
joinFamily({ element: 'vui-window', family: 'desktop', rules: ['label', 'regions'] });
joinFamily({ element: 'vui-status-bar', family: 'desktop', rules: ['label'] });
joinFamily({ element: 'vui-stack', family: 'layout', rules: ['gap', 'padding', 'align', 'justify', 'overflow'] });

import { registerFamily, joinFamily } from './registry';

registerFamily({
  name: 'action',
  summary: 'Действие: disabled, фокус, клавиатура, активация и доступное имя. Иконка — только когда она есть.',
  rules: ['disabled', 'focus', 'keyboard', 'activation', 'icon', 'label'],
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

joinFamily({ element: 'vui-button', family: 'action', rules: ['disabled', 'focus', 'keyboard', 'activation', 'label'] });
joinFamily({
  element: 'vui-icon-button',
  family: 'action',
  rules: ['disabled', 'focus', 'keyboard', 'activation', 'icon', 'label'],
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

joinFamily({ element: 'vui-tabs', family: 'navigation', rules: ['roving', 'keyboard', 'selection', 'focus'] });
joinFamily({ element: 'vui-tab', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'disabled'] });
joinFamily({ element: 'vui-tab-panel', family: 'navigation', rules: ['selection'] });
joinFamily({ element: 'vui-file-tree', family: 'navigation', rules: ['roving', 'keyboard', 'selection', 'focus'] });
joinFamily({ element: 'vui-tree-item', family: 'navigation', rules: ['keyboard', 'selection', 'focus', 'label'] });
joinFamily({ element: 'vui-menu', family: 'navigation', rules: ['roving', 'keyboard', 'focus'] });
joinFamily({ element: 'vui-menu-item', family: 'navigation', rules: ['keyboard', 'focus'] });

joinFamily({ element: 'vui-data-grid', family: 'data', rules: ['keyboard', 'selection', 'focus', 'roving'] });

import { registerComposition } from './registry';

registerComposition({
  id: 'select',
  host: 'vui-select',
  summary: 'Select читает прямых vui-option. Пункт не вызывает select: значение, подпись и disabled — его атрибуты.',
  links: [{ from: 'vui-select', to: 'vui-option', direction: 'parent-child', channel: 'light-dom' }],
  emits: ['change'],
});

registerComposition({
  id: 'tabs',
  host: 'vui-tabs',
  summary: 'Вкладка и панель связаны атрибутами panel и name. Сосед не вызывает соседа: выбор пишет родитель.',
  links: [
    { from: 'vui-tabs', to: 'vui-tab', direction: 'parent-child', channel: 'slot', slot: 'tab' },
    { from: 'vui-tabs', to: 'vui-tab-panel', direction: 'parent-child', channel: 'slot', slot: 'panel' },
    { from: 'vui-tab', to: 'vui-tab-panel', direction: 'sibling', channel: 'attribute' },
  ],
  emits: [],
});

registerComposition({
  id: 'file-tree',
  host: 'vui-file-tree',
  summary: 'Дерево и пункт читают прямых детей. Вложенный пункт — такой же parent → child, не отдельный протокол.',
  links: [
    { from: 'vui-file-tree', to: 'vui-tree-item', direction: 'parent-child', channel: 'light-dom' },
    { from: 'vui-tree-item', to: 'vui-tree-item', direction: 'parent-child', channel: 'light-dom' },
  ],
  emits: ['change'],
});

registerComposition({
  id: 'toast',
  host: 'vui-toaster',
  summary: 'Toaster складывает vui-toast в слот. Toast сообщает о закрытии событием close и не вызывает методы хозяина.',
  links: [
    { from: 'vui-toaster', to: 'vui-toast', direction: 'parent-child', channel: 'slot', slot: '' },
    { from: 'vui-toast', to: 'vui-toaster', direction: 'child-parent', channel: 'event', event: 'close' },
  ],
  emits: ['close'],
});

registerComposition({
  id: 'dialog',
  host: 'vui-dialog',
  summary: 'Содержимое и действия — слоты. Кнопка в footer остаётся самостоятельной: dialog не знает, какая это команда.',
  links: [
    { from: 'vui-dialog', to: 'content', direction: 'parent-child', channel: 'slot', slot: '' },
    { from: 'vui-dialog', to: 'actions', direction: 'parent-child', channel: 'slot', slot: 'footer' },
  ],
  emits: ['close'],
});

registerComposition({
  id: 'data-grid',
  host: 'vui-data-grid',
  summary: 'Колонки и строки — свойства. Ячейка не элемент: сетка знает id, текст, выбор и клавиатуру, но не сущность приложения.',
  links: [
    { from: 'vui-data-grid', to: 'columns', direction: 'parent-child', channel: 'property' },
    { from: 'vui-data-grid', to: 'rows', direction: 'parent-child', channel: 'property' },
  ],
  emits: ['change'],
});

registerComposition({
  id: 'toolbar',
  host: 'vui-toolbar',
  summary: 'Группы start, основная и end — слоты. Действия внутри не получают протокол toolbar item.',
  links: [
    { from: 'vui-toolbar', to: 'start', direction: 'parent-child', channel: 'slot', slot: 'start' },
    { from: 'vui-toolbar', to: 'actions', direction: 'parent-child', channel: 'slot', slot: '' },
    { from: 'vui-toolbar', to: 'end', direction: 'parent-child', channel: 'slot', slot: 'end' },
  ],
  emits: [],
});

registerComposition({
  id: 'split-panel',
  host: 'vui-split-panel',
  summary: 'Панели — слоты start и end. Дети не знают о position. Разделитель двигает число, это не список.',
  links: [
    { from: 'vui-split-panel', to: 'start', direction: 'parent-child', channel: 'slot', slot: 'start' },
    { from: 'vui-split-panel', to: 'end', direction: 'parent-child', channel: 'slot', slot: 'end' },
  ],
  emits: [],
});

registerComposition({
  id: 'radio-group',
  host: 'vui-radio-group',
  summary: 'Группа читает прямых vui-radio. Пункт не выбирает соседа: имя, disabled и значение пишет группа.',
  links: [{ from: 'vui-radio-group', to: 'vui-radio', direction: 'parent-child', channel: 'light-dom' }],
  emits: ['change'],
});

registerComposition({
  id: 'button-group',
  host: 'vui-button-group',
  summary: 'Кнопки лежат в слоте. Группа даёт имя и disabled, но не вызывает команды детей.',
  links: [{ from: 'vui-button-group', to: 'actions', direction: 'parent-child', channel: 'slot', slot: '' }],
  emits: [],
});

registerComposition({
  id: 'popover',
  host: 'vui-popover',
  summary: 'Триггер — слот по умолчанию, содержимое — slot panel. Закрытие идёт через общий стек overlay.',
  links: [
    { from: 'vui-popover', to: 'trigger', direction: 'parent-child', channel: 'slot', slot: '' },
    { from: 'vui-popover', to: 'content', direction: 'parent-child', channel: 'slot', slot: 'panel' },
  ],
  emits: ['close'],
});

registerComposition({
  id: 'breadcrumbs',
  host: 'vui-breadcrumbs',
  summary: 'Крошки — светлые дети. Текущую страницу помечает приложение через aria-current.',
  links: [{ from: 'vui-breadcrumbs', to: 'item', direction: 'parent-child', channel: 'slot', slot: '' }],
  emits: [],
});

registerComposition({
  id: 'scroll-area',
  host: 'vui-scroll-area',
  summary: 'Содержимое — слот. Область только прокручивает, она не владеет данными.',
  links: [{ from: 'vui-scroll-area', to: 'content', direction: 'parent-child', channel: 'slot', slot: '' }],
  emits: [],
});

registerComposition({
  id: 'shell',
  host: 'vui-shell',
  summary: 'Шапка, панель, навигация, основное содержимое, боковая панель и статус — слоты. Shell не знает, что в них лежит.',
  links: [
    { from: 'vui-shell', to: 'header', direction: 'parent-child', channel: 'slot', slot: 'header' },
    { from: 'vui-shell', to: 'toolbar', direction: 'parent-child', channel: 'slot', slot: 'toolbar' },
    { from: 'vui-shell', to: 'nav', direction: 'parent-child', channel: 'slot', slot: 'nav' },
    { from: 'vui-shell', to: 'main', direction: 'parent-child', channel: 'slot', slot: '' },
    { from: 'vui-shell', to: 'aside', direction: 'parent-child', channel: 'slot', slot: 'aside' },
    { from: 'vui-shell', to: 'footer', direction: 'parent-child', channel: 'slot', slot: 'footer' },
  ],
  emits: [],
});

registerComposition({
  id: 'menu',
  host: 'vui-menu',
  summary: 'Пункт — прямой ребёнок. Вложенное меню лежит в slot submenu. Активация идёт через CommandRegistry.',
  links: [
    { from: 'vui-menu', to: 'vui-menu-item', direction: 'parent-child', channel: 'light-dom' },
    { from: 'vui-menu-item', to: 'vui-menu', direction: 'parent-child', channel: 'slot', slot: 'submenu' },
  ],
  emits: ['close'],
});

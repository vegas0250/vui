export const showcaseMarkup = `
  <div class="page">
    <vui-toolbar class="topbar" wrap label="VUI">
      <span class="brand" slot="start">VUI</span>
      <div class="header-controls" slot="end">
        <vui-select id="theme-select" label="Тема" size="small" value="light">
          <vui-option value="light">Светлая</vui-option>
          <vui-option value="dark">Тёмная</vui-option>
          <vui-option value="high-contrast">Контрастная</vui-option>
          <vui-option value="system">Системная</vui-option>
        </vui-select>
        <vui-select id="density-select" label="Плотность" size="small" value="comfortable">
          <vui-option value="comfortable">Comfortable</vui-option>
          <vui-option value="compact">Compact</vui-option>
          <vui-option value="dense">Dense</vui-option>
        </vui-select>
      </div>
    </vui-toolbar>

    <main>
      <header class="intro">
        <h1>VUI Showcase</h1>
        <p>
          Универсальная модульная UI-система для Web, SPA и Desktop/Electron.
          Эта страница собрана из компонентов VUI и служит демонстрацией, справкой и ручной проверкой тем, плотности и responsive-поведения.
        </p>
      </header>

      <section class="category" id="foundation">
        <h2>Foundation</h2>
        <div class="stack-gap">
          <vui-panel heading="Цвета">
            <div class="swatches">
              <div class="swatch" style="background: var(--vui-color-background)"><span>background</span></div>
              <div class="swatch" style="background: var(--vui-color-surface)"><span>surface</span></div>
              <div class="swatch" style="background: var(--vui-color-surface-sunken)"><span>sunken</span></div>
              <div class="swatch" style="background: var(--vui-color-primary); color: var(--vui-color-on-primary)"><span>primary</span></div>
              <div class="swatch" style="background: var(--vui-color-danger); color: var(--vui-color-on-danger)"><span>danger</span></div>
              <div class="swatch" style="background: var(--vui-color-success); color: var(--vui-color-background)"><span>success</span></div>
              <div class="swatch" style="background: var(--vui-color-warning); color: var(--vui-color-background)"><span>warning</span></div>
              <div class="swatch" style="background: var(--vui-color-info); color: var(--vui-color-on-primary)"><span>info</span></div>
            </div>
          </vui-panel>

          <vui-panel heading="Типографика">
            <vui-vstack gap="sm">
              <p class="type-sample" style="font-size: var(--vui-heading-1); margin: 0">Заголовок H1</p>
              <p class="type-sample" style="font-size: var(--vui-heading-2); margin: 0">Заголовок H2</p>
              <p class="type-sample" style="font-size: var(--vui-heading-3); margin: 0">Заголовок H3</p>
              <p class="type-sample" style="margin: 0">Основной текст интерфейса. Размер и интервалы меняются вместе с плотностью.</p>
              <p class="type-sample" style="margin: 0; font-family: var(--vui-font-mono)">const theme = "dark";</p>
            </vui-vstack>
          </vui-panel>

          <vui-panel heading="Иконки">
            <div id="icon-gallery" class="icon-grid"></div>
            <p class="demo-note">Источник путей — Lucide. Публичный API принимает имя и не экспортирует типы библиотеки иконок.</p>
            <pre class="code">&lt;vui-icon name="folder"&gt;&lt;/vui-icon&gt;</pre>
          </vui-panel>

          <vui-grid min="14rem" gap="md">
            <vui-panel heading="Интервалы">
              <div class="token-row">
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-xs)"></div><span>xs</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-sm)"></div><span>sm</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-md)"></div><span>md</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-lg)"></div><span>lg</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-xl)"></div><span>xl</span></div>
              </div>
            </vui-panel>
            <vui-panel heading="Радиус">
              <vui-hstack gap="sm" align="center">
                <div class="radius-box" style="border-radius: var(--vui-radius-sm)"></div>
                <div class="radius-box" style="border-radius: var(--vui-radius)"></div>
                <div class="radius-box" style="border-radius: var(--vui-radius-lg)"></div>
              </vui-hstack>
            </vui-panel>
            <vui-panel heading="Тени">
              <vui-hstack gap="sm" align="center">
                <div class="shadow-box" style="box-shadow: var(--vui-shadow-sm)"></div>
                <div class="shadow-box" style="box-shadow: var(--vui-shadow-md)"></div>
                <div class="shadow-box" style="box-shadow: var(--vui-shadow-lg)"></div>
              </vui-hstack>
            </vui-panel>
          </vui-grid>
        </div>
      </section>

      <section class="category" id="layout">
        <h2>Layout</h2>
        <div class="stack-gap">
          <vui-panel heading="Stack, HStack, VStack">
            <vui-grid min="16rem" gap="md">
              <vui-vstack gap="sm">
                <div class="box">Сверху</div>
                <div class="box">Середина</div>
                <div class="box">Снизу</div>
              </vui-vstack>
              <vui-hstack gap="sm" align="center">
                <div class="box">Слева</div>
                <div class="box">Центр</div>
                <div class="box">Справа</div>
              </vui-hstack>
            </vui-grid>
            <pre class="code">&lt;vui-vstack gap="sm"&gt;...&lt;/vui-vstack&gt;
&lt;vui-hstack gap="sm" align="center"&gt;...&lt;/vui-hstack&gt;</pre>
          </vui-panel>

          <vui-panel heading="Grid">
            <vui-grid columns="3" min="8rem" gap="sm">
              <div class="box">1</div>
              <div class="box">2</div>
              <div class="box">3</div>
              <div class="box">4</div>
              <div class="box">5</div>
              <div class="box">6</div>
            </vui-grid>
            <pre class="code">&lt;vui-grid columns="3" gap="sm"&gt;...&lt;/vui-grid&gt;</pre>
          </vui-panel>

          <vui-panel heading="Panel">
            <p style="margin: 0">Панель группирует содержимое и заголовок. Этот блок сам является <code>vui-panel</code>.</p>
            <pre class="code">&lt;vui-panel heading="Заголовок"&gt;Содержимое&lt;/vui-panel&gt;</pre>
          </vui-panel>

          <vui-panel heading="Split Panel">
            <vui-split-panel id="layout-split" position="40" label="Разделить панели" style="height: 180px">
              <div slot="start" class="box">Начало</div>
              <div slot="end" class="box">Конец. Разделитель двигается мышью и стрелками.</div>
            </vui-split-panel>
            <pre class="code">&lt;vui-split-panel position="40"&gt;
  &lt;div slot="start"&gt;Начало&lt;/div&gt;
  &lt;div slot="end"&gt;Конец&lt;/div&gt;
&lt;/vui-split-panel&gt;</pre>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="actions">
        <h2>Actions</h2>
        <div class="stack-gap">
          <vui-panel heading="Button">
            <vui-hstack gap="sm" wrap align="center">
              <vui-button id="save-button" variant="primary">Сохранить</vui-button>
              <vui-button variant="secondary">Отмена</vui-button>
              <vui-button variant="ghost">Подробнее</vui-button>
              <vui-button variant="danger">Удалить</vui-button>
              <vui-button size="small">Маленькая</vui-button>
              <vui-button size="large">Большая</vui-button>
              <vui-button disabled>Недоступна</vui-button>
            </vui-hstack>
            <p id="save-result" class="demo-note">Нажмите «Сохранить».</p>
            <pre class="code">&lt;vui-button variant="primary"&gt;Сохранить&lt;/vui-button&gt;
button.addEventListener("click", handler);</pre>
          </vui-panel>

          <vui-panel heading="Icon Button">
            <vui-hstack gap="sm" align="center">
              <vui-icon-button name="save" label="Сохранить" variant="primary"></vui-icon-button>
              <vui-icon-button name="copy" label="Копировать" variant="secondary"></vui-icon-button>
              <vui-icon-button name="settings" label="Настройки"></vui-icon-button>
              <vui-icon-button name="trash-2" label="Удалить" variant="danger"></vui-icon-button>
              <vui-icon-button name="search" label="Поиск" disabled></vui-icon-button>
            </vui-hstack>
            <pre class="code">&lt;vui-icon-button name="settings" label="Настройки"&gt;&lt;/vui-icon-button&gt;</pre>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="forms">
        <h2>Forms</h2>
        <vui-panel heading="Поля">
          <vui-grid min="16rem" gap="md">
            <vui-input id="name-input" label="Имя" placeholder="Например, VUI" hint="Обычное текстовое поле"></vui-input>
            <vui-input label="Поиск" type="search" placeholder="Фильтр" value="button"></vui-input>
            <vui-input label="Только чтение" value="Нельзя изменить" readonly></vui-input>
            <vui-input label="Ошибка" value="bad@" invalid hint="Некорректный адрес"></vui-input>
            <vui-checkbox id="agree">Согласен с условиями</vui-checkbox>
            <vui-switch id="notify" checked>Уведомления</vui-switch>
            <vui-checkbox disabled checked>Недоступный флажок</vui-checkbox>
            <vui-switch disabled>Недоступный переключатель</vui-switch>
            <vui-select id="lang-select" label="Язык" value="ru" placeholder="Выберите">
              <vui-option value="ru">Русский</vui-option>
              <vui-option value="en">English</vui-option>
              <vui-option value="de" disabled>Deutsch</vui-option>
            </vui-select>
          </vui-grid>
          <p id="form-result" class="demo-note">Измените поле, флажок, переключатель или список.</p>
          <pre class="code">&lt;vui-input label="Имя" placeholder="Например, VUI"&gt;&lt;/vui-input&gt;
&lt;vui-checkbox&gt;Согласен&lt;/vui-checkbox&gt;
&lt;vui-switch checked&gt;Уведомления&lt;/vui-switch&gt;
&lt;vui-select label="Язык" value="ru"&gt;
  &lt;vui-option value="ru"&gt;Русский&lt;/vui-option&gt;
&lt;/vui-select&gt;</pre>
        </vui-panel>
      </section>

      <section class="category" id="feedback">
        <h2>Feedback</h2>
        <div class="stack-gap">
          <vui-panel heading="Alert">
            <vui-vstack gap="sm">
              <vui-alert>Сборка showcase запущена.</vui-alert>
              <vui-alert variant="success">Изменения сохранены.</vui-alert>
              <vui-alert variant="warning">Есть несохранённые правки.</vui-alert>
              <vui-alert variant="danger" closable close-label="Закрыть">Не удалось записать файл.</vui-alert>
            </vui-vstack>
            <pre class="code">&lt;vui-alert variant="success"&gt;Изменения сохранены.&lt;/vui-alert&gt;</pre>
          </vui-panel>

          <vui-panel heading="Toast">
            <vui-vstack gap="sm">
              <vui-toast heading="Файл сохранён" variant="success" duration="0">index.ts записан на диск.</vui-toast>
              <vui-button id="toast-button" variant="secondary">Показать уведомление</vui-button>
            </vui-vstack>
            <pre class="code">import { toast } from "vui/toast";
toast({ title: "Готово", message: "Проект собран", variant: "success" });</pre>
          </vui-panel>

          <vui-panel heading="Tooltip">
            <vui-tooltip text="Сохраняет текущий файл">
              <vui-button variant="secondary">Наведите или сфокусируйте</vui-button>
            </vui-tooltip>
            <pre class="code">&lt;vui-tooltip text="Сохраняет текущий файл"&gt;
  &lt;vui-button&gt;Наведите&lt;/vui-button&gt;
&lt;/vui-tooltip&gt;</pre>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="overlay">
        <h2>Overlay</h2>
        <vui-panel heading="Dialog">
          <vui-button id="open-dialog">Открыть диалог</vui-button>
          <p class="demo-note">Escape, кнопка закрытия и щелчок по фону закрывают окно. Фокус остаётся внутри.</p>
          <pre class="code">&lt;vui-dialog label="Сохранить изменения"&gt;
  &lt;p&gt;Текст диалога&lt;/p&gt;
  &lt;div slot="footer"&gt;
    &lt;vui-button&gt;Сохранить&lt;/vui-button&gt;
  &lt;/div&gt;
&lt;/vui-dialog&gt;</pre>
        </vui-panel>
        <vui-dialog id="demo-dialog" label="Сохранить изменения" close-label="Закрыть">
          <p style="margin: 0">Диалог использует нативный элемент dialog: модальный режим, Escape и ловушку фокуса.</p>
          <div slot="footer">
            <vui-hstack gap="sm">
              <vui-button id="dialog-cancel" variant="ghost">Отмена</vui-button>
              <vui-button id="dialog-save">Сохранить</vui-button>
            </vui-hstack>
          </div>
        </vui-dialog>
      </section>

      <section class="category" id="navigation">
        <h2>Navigation</h2>
        <div class="stack-gap">
          <vui-panel heading="Tabs">
            <vui-tabs label="Разделы примера">
              <vui-tab panel="general" selected>Общие</vui-tab>
              <vui-tab panel="view">Вид</vui-tab>
              <vui-tab panel="keys">Клавиши</vui-tab>
              <vui-tab-panel name="general">Тема и плотность применяются ко всей странице.</vui-tab-panel>
              <vui-tab-panel name="view">Панели, таблицы и дерево используют те же токены.</vui-tab-panel>
              <vui-tab-panel name="keys">Стрелки переключают вкладки. Home и End переходят к краям.</vui-tab-panel>
            </vui-tabs>
            <pre class="code">&lt;vui-tabs&gt;
  &lt;vui-tab panel="general" selected&gt;Общие&lt;/vui-tab&gt;
  &lt;vui-tab-panel name="general"&gt;...&lt;/vui-tab-panel&gt;
&lt;/vui-tabs&gt;</pre>
          </vui-panel>

          <vui-panel heading="Toolbar">
            <vui-toolbar label="Панель редактора">
              <vui-icon-button slot="start" name="menu" label="Меню"></vui-icon-button>
              <vui-button slot="start" size="small" variant="ghost">Файл</vui-button>
              <vui-button slot="start" size="small" variant="ghost">Правка</vui-button>
              <span>Черновик</span>
              <vui-icon-button slot="end" name="search" label="Поиск"></vui-icon-button>
              <vui-icon-button slot="end" name="settings" label="Настройки"></vui-icon-button>
            </vui-toolbar>
            <pre class="code">&lt;vui-toolbar label="Панель редактора"&gt;
  &lt;vui-button slot="start"&gt;Файл&lt;/vui-button&gt;
  &lt;vui-icon-button slot="end" name="search" label="Поиск"&gt;&lt;/vui-icon-button&gt;
&lt;/vui-toolbar&gt;</pre>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="data">
        <h2>Data</h2>
        <vui-panel heading="Data Grid">
          <vui-data-grid id="demo-grid" label="Компоненты" empty-label="Нет строк"></vui-data-grid>
          <p id="grid-result" class="demo-note">Клик или стрелки выбирают строку.</p>
          <pre class="code">grid.columns = [
  { key: "name", title: "Компонент" },
  { key: "category", title: "Категория" }
];
grid.rows = [{ id: "button", name: "Button", category: "Actions" }];
grid.addEventListener("change", () =&gt; grid.selectedId);</pre>
        </vui-panel>
      </section>

      <section class="category" id="desktop">
        <h2>Desktop</h2>
        <div class="stack-gap">
          <vui-panel heading="Окно приложения">
            <div class="desktop">
              <vui-toolbar label="Приложение">
                <vui-icon-button slot="start" name="panel-left" label="Боковая панель"></vui-icon-button>
                <strong slot="start">vui</strong>
                <vui-icon-button slot="end" name="search" label="Поиск"></vui-icon-button>
                <vui-icon-button slot="end" name="settings" label="Настройки"></vui-icon-button>
              </vui-toolbar>
              <vui-split-panel position="32" label="Боковая панель" style="height: 320px">
                <vui-file-tree id="demo-tree" slot="start" label="Файлы проекта">
                  <vui-tree-item label="src" kind="folder" expanded>
                    <vui-tree-item label="components" kind="folder" expanded>
                      <vui-tree-item label="button.ts" kind="file"></vui-tree-item>
                      <vui-tree-item label="dialog.ts" kind="file"></vui-tree-item>
                    </vui-tree-item>
                    <vui-tree-item label="index.ts" kind="file"></vui-tree-item>
                  </vui-tree-item>
                  <vui-tree-item label="themes" kind="folder">
                    <vui-tree-item label="light.css" kind="file"></vui-tree-item>
                    <vui-tree-item label="dark.css" kind="file"></vui-tree-item>
                    <vui-tree-item label="high-contrast.css" kind="file"></vui-tree-item>
                  </vui-tree-item>
                  <vui-tree-item label="package.json" kind="file"></vui-tree-item>
                </vui-file-tree>
                <div slot="end" class="editor">
                  <vui-tabs label="Редактор">
                    <vui-tab panel="readme" selected>README.md</vui-tab>
                    <vui-tab panel="button-file">button.ts</vui-tab>
                    <vui-tab-panel name="readme">Персональная библиотека компонентов. Темы и плотность общие для Web и Desktop.</vui-tab-panel>
                    <vui-tab-panel name="button-file">export class VButton extends VuiElement {}</vui-tab-panel>
                  </vui-tabs>
                </div>
              </vui-split-panel>
              <vui-status-bar label="Строка состояния">
                <span id="status-text">Готово</span>
                <span slot="end" id="status-selection">Файл не выбран</span>
                <span slot="end">UTF-8</span>
              </vui-status-bar>
            </div>
            <p class="demo-note">Дерево: стрелки, Home, End, Enter и Space. Split: перетаскивание и стрелки на разделителе.</p>
            <pre class="code">&lt;vui-toolbar&gt;...&lt;/vui-toolbar&gt;
&lt;vui-split-panel&gt;
  &lt;vui-file-tree slot="start"&gt;
    &lt;vui-tree-item label="src" kind="folder" expanded&gt;
      &lt;vui-tree-item label="index.ts" kind="file"&gt;&lt;/vui-tree-item&gt;
    &lt;/vui-tree-item&gt;
  &lt;/vui-file-tree&gt;
&lt;/vui-split-panel&gt;
&lt;vui-status-bar&gt;
  &lt;span&gt;Готово&lt;/span&gt;
  &lt;span slot="end"&gt;UTF-8&lt;/span&gt;
&lt;/vui-status-bar&gt;</pre>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="responsive">
        <h2>Responsive Design</h2>
        <p class="section-lead">
          Тема, плотность и доступная ширина независимы. Компонент подстраивается под свой контейнер:
          широкий, средний и узкий. Перетащите правый край или выберите ширину. Сочетания Light, Dark,
          High Contrast и Comfortable, Compact, Dense переключаются на панели сверху и действуют на этот блок.
        </p>
        <p id="responsive-readout" class="demo-note">Light + Comfortable</p>
        <vui-hstack gap="sm" wrap>
          <vui-button id="size-wide" variant="secondary" size="small">Широкий</vui-button>
          <vui-button id="size-medium" variant="secondary" size="small">Средний</vui-button>
          <vui-button id="size-narrow" variant="secondary" size="small">Узкий</vui-button>
        </vui-hstack>
        <div class="resize-shell">
          <div id="resize-stage" class="resize-stage">
            <div class="desktop resize-desktop">
              <vui-toolbar id="responsive-toolbar" label="Адаптивная панель">
                <vui-icon-button slot="start" name="menu" label="Меню"></vui-icon-button>
                <vui-button slot="start" size="small" variant="ghost">Файл</vui-button>
                <vui-button slot="start" size="small" variant="ghost">Правка</vui-button>
                <vui-button slot="start" size="small" variant="ghost">Вид</vui-button>
                <span>Документ</span>
                <vui-button size="small" variant="secondary">Собрать</vui-button>
                <vui-icon-button slot="end" name="search" label="Поиск"></vui-icon-button>
                <vui-icon-button slot="end" name="settings" label="Настройки"></vui-icon-button>
              </vui-toolbar>
              <div class="resize-body">
                <vui-tabs id="responsive-tabs" label="Разделы">
                  <vui-tab panel="home" selected>Главная</vui-tab>
                  <vui-tab panel="catalog">Каталог</vui-tab>
                  <vui-tab panel="saved">Избранное</vui-tab>
                  <vui-tab panel="settings">Настройки</vui-tab>
                  <vui-tab-panel name="home">Вкладки прокручиваются, если контейнер уже их подписей.</vui-tab-panel>
                  <vui-tab-panel name="catalog">Каталог</vui-tab-panel>
                  <vui-tab-panel name="saved">Избранное</vui-tab-panel>
                  <vui-tab-panel name="settings">Настройки</vui-tab-panel>
                </vui-tabs>
                <vui-input id="responsive-input" label="Название" hint="В широком контейнере подпись стоит рядом с полем" value="VUI"></vui-input>
                <vui-data-grid id="responsive-grid" label="Адаптивная таблица" empty-label="Нет строк"></vui-data-grid>
                <vui-split-panel id="responsive-split" position="36" label="Панели приложения" style="height: 160px">
                  <div slot="start" class="box">Боковая панель</div>
                  <div slot="end" class="box">Содержимое. В узком контейнере панели складываются.</div>
                </vui-split-panel>
              </div>
              <vui-status-bar id="responsive-status" label="Строка состояния">
                <span>Готово</span>
                <span slot="end">main</span>
                <span slot="end">UTF-8</span>
              </vui-status-bar>
            </div>
          </div>
          <button id="resize-handle" class="resize-handle" type="button" aria-label="Изменить ширину контейнера"></button>
        </div>
        <pre class="code">&lt;vui-toolbar&gt;
  &lt;vui-button slot="start"&gt;Файл&lt;/vui-button&gt;
  &lt;vui-icon-button slot="end" name="search" label="Поиск"&gt;&lt;/vui-icon-button&gt;
&lt;/vui-toolbar&gt;</pre>
      </section>
    </main>
  </div>
`;

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
        <vui-select id="dir-select" label="Направление" size="small" value="ltr">
          <vui-option value="ltr">LTR</vui-option>
          <vui-option value="rtl">RTL</vui-option>
        </vui-select>
      </div>
    </vui-toolbar>

    <main>
      <header class="intro">
        <h1>VUI Studio</h1>
        <p>
          Документация, playground и проверка платформы. Компонент — primitive.
          Pattern — пример сборки. Shell — раскладка приложения без бизнес-логики.
        </p>
        <nav class="lab-nav" aria-label="Разделы студии">
          <a href="#foundation">Foundation</a>
          <a href="#layout">Layout</a>
          <a href="#responsive">Responsive</a>
          <a href="#components">Components</a>
          <a href="#content">Content</a>
          <a href="#patterns">Patterns</a>
          <a href="#shell">Shell</a>
          <a href="#platform">Platform</a>
          <a href="#contract">Contracts</a>
        </nav>
      </header>

      <section class="category" id="foundation">
        <h2>Foundation</h2>
        <p class="section-lead">
          Runtime читает tokens, тему, плотность и пороги контейнера. Компонент не заводит свою шкалу.
          Переключатели темы и плотности на панели сверху меняют этот раздел вместе со страницей.
        </p>
        <div class="stack-gap">
          <h3 id="foundation-tokens">Tokens</h3>
          <vui-panel heading="Снимок runtime">
            <dl id="foundation-snapshot" class="snapshot"></dl>
          </vui-panel>
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
              <p class="type-sample" style="margin: 0; font-size: var(--vui-font-size-sm); color: var(--vui-color-text-muted)">Мелкий текст и подписи.</p>
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
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-2xs)"></div><span>2xs</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-xs)"></div><span>xs</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-sm)"></div><span>sm</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-md)"></div><span>md</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-lg)"></div><span>lg</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-xl)"></div><span>xl</span></div>
                <div class="token-chip"><div class="token-bar" style="width: var(--vui-space-2xl)"></div><span>2xl</span></div>
              </div>
            </vui-panel>
            <vui-panel heading="Радиус">
              <vui-hstack gap="sm" align="center">
                <div class="radius-box" style="border-radius: var(--vui-radius-sm)"></div>
                <div class="radius-box" style="border-radius: var(--vui-radius)"></div>
                <div class="radius-box" style="border-radius: var(--vui-radius-lg)"></div>
                <div class="radius-box" style="border-radius: var(--vui-radius-full)"></div>
              </vui-hstack>
            </vui-panel>
            <vui-panel heading="Границы">
              <vui-hstack gap="sm" align="center">
                <div class="border-sample" style="border-width: var(--vui-border-width)"></div>
                <div class="border-sample" style="border-width: var(--vui-border-width-strong)"></div>
                <div class="border-sample" style="border-width: var(--vui-border-width-accent)"></div>
              </vui-hstack>
            </vui-panel>
            <vui-panel heading="Тени">
              <vui-hstack gap="sm" align="center">
                <div class="shadow-box" style="box-shadow: var(--vui-shadow-sm)"></div>
                <div class="shadow-box" style="box-shadow: var(--vui-shadow-md)"></div>
                <div class="shadow-box" style="box-shadow: var(--vui-shadow-lg)"></div>
              </vui-hstack>
            </vui-panel>
            <vui-panel heading="Движение и слои">
              <ul class="token-list">
                <li><code>--vui-duration</code> <code>--vui-easing</code></li>
                <li><code>--vui-z-dropdown</code> … <code>--vui-z-tooltip</code></li>
                <li><code>--vui-size-control</code> <code>--vui-row-height</code></li>
                <li><code>--vui-toolbar-height</code> <code>--vui-statusbar-height</code></li>
              </ul>
            </vui-panel>
            <vui-panel heading="Пороги контейнера">
              <ul class="token-list">
                <li><code>--vui-layout-narrow</code> 22rem</li>
                <li><code>--vui-field-inline</code> 36rem</li>
                <li><code>--vui-layout-medium</code> 40rem</li>
                <li><code>--vui-overlay-full</code> 30rem</li>
              </ul>
            </vui-panel>
          </vui-grid>

          <h3 id="foundation-themes">Themes</h3>
          <vui-panel heading="Тема">
            <p class="demo-note">Light, Dark, High Contrast и System меняют семантические tokens. Имена свойств остаются теми же. Компонент не ветвится по имени темы.</p>
          </vui-panel>

          <h3 id="foundation-density">Density</h3>
          <vui-panel heading="Плотность">
            <p class="demo-note">Comfortable, Compact и Dense меняют размеры контролов, интервалы и высоты chrome. Пороги контейнера от плотности не зависят.</p>
          </vui-panel>

          <h3 id="foundation-responsive">Responsive</h3>
          <vui-panel heading="Контейнер">
            <p class="demo-note">Полоса narrow, medium или wide считается по ширине контейнера. Полный стенд — в разделе <a href="#responsive">Responsive Design</a>.</p>
            <p id="foundation-band" class="demo-note">Полоса контейнера появится после измерения.</p>
          </vui-panel>

          <h3 id="foundation-accessibility">Accessibility</h3>
          <vui-panel heading="Фокус, движение, forced colors">
            <p class="demo-note">Кольцо — <code>:focus-visible</code> и <code>--vui-focus-ring</code>. <code>prefers-reduced-motion</code> отключает анимации в базовых стилях. High Contrast не прячет смысл в одной тени.</p>
            <vui-hstack gap="sm" wrap align="center">
              <vui-button id="a11y-focus" variant="primary">Фокус</vui-button>
              <vui-button disabled>Disabled</vui-button>
            </vui-hstack>
            <p id="a11y-readout" class="demo-note"></p>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="layout">
        <h2>Layout</h2>
        <div class="stack-gap">
          <vui-panel heading="Stack, HStack, VStack">
            <vui-grid min="16rem" gap="md">
              <vui-vstack gap="sm" padding="sm">
                <div class="box">Сверху</div>
                <div class="box">Середина</div>
                <div class="box">Снизу</div>
              </vui-vstack>
              <vui-hstack gap="sm" align="center" justify="space-between">
                <div class="box">Слева</div>
                <div class="box">Центр</div>
                <div class="box">Справа</div>
              </vui-hstack>
            </vui-grid>
            <vui-stack direction="row" gap="sm" align="center">
              <div class="box">Ряд</div>
              <div class="box">того же stack</div>
            </vui-stack>
            <pre class="code">&lt;vui-vstack gap="sm" padding="sm"&gt;...&lt;/vui-vstack&gt;
&lt;vui-hstack gap="sm" align="center" justify="space-between"&gt;...&lt;/vui-hstack&gt;
&lt;vui-stack direction="row" gap="sm"&gt;...&lt;/vui-stack&gt;</pre>
          </vui-panel>

          <vui-panel heading="Container">
            <vui-container size="small" padding="sm">
              <div class="box">Ширина ограничена контейнером, а не страницей.</div>
            </vui-container>
            <pre class="code">&lt;vui-container size="small" padding="sm"&gt;...&lt;/vui-container&gt;</pre>
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
            <vui-panel heading="Вложенная панель" padding="md" overflow="auto">
              <p style="margin: 0">Поверхность, граница, радиус и отступ берутся из tokens. <code>padding</code> и <code>overflow</code> — те же имена, что у stack и grid.</p>
            </vui-panel>
            <pre class="code">&lt;vui-panel heading="Заголовок" padding="md" overflow="auto"&gt;Содержимое&lt;/vui-panel&gt;</pre>
          </vui-panel>

          <vui-panel heading="Split Panel">
            <vui-split-panel id="nested-split" position="55" label="Внешняя панель" style="height: 220px">
              <vui-split-panel id="nested-split-inner" slot="start" orientation="vertical" position="45" min="20" max="80" label="Внутренняя панель">
                <div slot="start" class="box">Верх</div>
                <div slot="end" class="box">Низ. Home и End держатся в min и max.</div>
              </vui-split-panel>
              <div slot="end" class="box">Внешний конец. Внутренний разделитель его не двигает.</div>
            </vui-split-panel>
            <pre class="code">&lt;vui-split-panel position="55" label="Внешняя панель"&gt;
  &lt;vui-split-panel slot="start" orientation="vertical" min="20" max="80"&gt;
    &lt;div slot="start"&gt;Верх&lt;/div&gt;
    &lt;div slot="end"&gt;Низ&lt;/div&gt;
  &lt;/vui-split-panel&gt;
  &lt;div slot="end"&gt;Конец&lt;/div&gt;
&lt;/vui-split-panel&gt;</pre>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="contract">
        <h2>Contract</h2>
        <p class="section-lead">
          Lifecycle, состояния, клавиатура, фокус и ширина контейнера — один контракт для каждого <code>vui-*</code>.
          Тема и плотность к этому контракту не добавляют отдельных версий компонента.
          <code>loading</code> зарезервирован: компонент объявляет его только когда состояние реально есть, и тогда ставит <code>aria-busy</code>.
        </p>
        <div class="stack-gap">
          <h3>Lifecycle</h3>
          <vui-panel heading="Подключение">
            <div id="lifecycle-host"></div>
            <vui-button id="lifecycle-cycle" variant="secondary">Переподключить</vui-button>
            <p id="lifecycle-readout" class="demo-note">Образец ещё не подключён.</p>
          </vui-panel>

          <h3>States</h3>
          <vui-panel heading="Состояния и фокус">
            <vui-hstack gap="sm" wrap align="center">
              <vui-button id="contract-primary" variant="primary">Основная</vui-button>
              <vui-button variant="danger">Опасная</vui-button>
              <vui-button disabled>Недоступна</vui-button>
              <vui-input id="contract-input" label="Поле" invalid hint="Проверьте значение" value="bad@"></vui-input>
            </vui-hstack>
            <p class="demo-note">Default, hover, focus, active и disabled есть у кнопки. Ошибка поля — <code>invalid</code>. Disabled выпадает из Tab.</p>
          </vui-panel>

          <h3>Keyboard</h3>
          <vui-panel heading="Клавиатура">
            <vui-tabs id="contract-tabs" label="Контракт вкладок">
              <vui-tab panel="states" selected>Состояния</vui-tab>
              <vui-tab panel="keys">Клавиши</vui-tab>
              <vui-tab panel="layout-tab">Layout</vui-tab>
              <vui-tab-panel name="states">Вкладки выбираются стрелками, Home и End.</vui-tab-panel>
              <vui-tab-panel name="keys">Enter и Space активируют кнопку. Escape закрывает dialog, меню и tooltip.</vui-tab-panel>
              <vui-tab-panel name="layout-tab">Split двигается стрелками. Shift увеличивает шаг.</vui-tab-panel>
            </vui-tabs>
          </vui-panel>

          <h3>Focus</h3>
          <vui-panel heading="Кольцо фокуса">
            <p class="demo-note">Tab ставит фокус на кнопку «Основная», затем на «Опасная». Недоступная кнопка пропускается. Кольцо рисует <code>:focus-visible</code>.</p>
          </vui-panel>

          <h3>Responsive</h3>
          <vui-panel heading="Одно поле, две ширины">
            <div class="band-row">
              <div class="band">
                <vui-input label="Узкое поле" hint="Подпись стоит столбиком" value="VUI"></vui-input>
              </div>
              <div class="band">
                <vui-input label="Широкое поле" hint="В широком контейнере подпись может встать рядом" value="VUI"></vui-input>
              </div>
            </div>
          </vui-panel>

          <h3>Compliance</h3>
          <vui-panel heading="Зарегистрированные контракты">
            <p class="demo-note">Эти компоненты проходят автоматическую проверку: регистрация, lifecycle, tokens, тема, плотность, responsive, disabled, invalid, ARIA и стандартные события.</p>
            <div class="table-wrap">
              <table id="compliance-table" class="contract-table">
                <thead>
                  <tr>
                    <th>Элемент</th>
                    <th>Класс</th>
                    <th>Состояния</th>
                    <th>Responsive</th>
                    <th>События</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="composition">
        <h2>Composition</h2>
        <p class="section-lead">
          Составной интерфейс собирается из тех же слотов, атрибутов, событий и interaction primitives.
          Переключатели темы и плотности сверху действуют и на эти сценарии. Отдельной связи между парами компонентов нет.
        </p>
        <div class="stack-gap">
          <h3>Form</h3>
          <vui-panel heading="Поле">
            <div class="band-row">
              <div class="band">
                <vui-input id="composition-field" label="Почта" hint="Рабочий адрес" required invalid value="bad@"></vui-input>
              </div>
              <div class="band">
                <vui-input label="Почта" hint="В широком контейнере подпись может встать рядом" value="ada@example.com"></vui-input>
              </div>
            </div>
            <vui-checkbox id="composition-agree">Согласен с правилами</vui-checkbox>
            <p class="demo-note">Label, контрол, description и error — части поля. <code>invalid</code> ставит <code>aria-invalid</code>. Соседний checkbox не вызывает поле.</p>
          </vui-panel>

          <h3>Navigation</h3>
          <vui-panel heading="Вкладки">
            <vui-tabs id="composition-tabs" label="Разделы">
              <vui-tab panel="overview" selected>Обзор</vui-tab>
              <vui-tab panel="details">Детали</vui-tab>
              <vui-tab panel="locked" disabled>Закрыто</vui-tab>
              <vui-tab-panel name="overview">Стрелки переносят выбор. Панель связана атрибутом <code>panel</code>.</vui-tab-panel>
              <vui-tab-panel name="details">Вторая панель. Недоступная вкладка пропускается.</vui-tab-panel>
              <vui-tab-panel name="locked">Эта панель не выбирается с клавиатуры.</vui-tab-panel>
            </vui-tabs>
          </vui-panel>

          <h3>Data</h3>
          <vui-panel heading="Таблица">
            <vui-data-grid id="composition-grid" label="Состав"></vui-data-grid>
            <p id="composition-grid-result" class="demo-note">Строка не выбрана.</p>
            <p class="demo-note">Стрелки двигают курсор и выбор. Вторичная колонка скрывается, когда контейнер уже 40rem. Сетка не знает, что означают строки.</p>
          </vui-panel>

          <h3>Overlay</h3>
          <vui-panel heading="Диалог">
            <vui-button id="composition-open" variant="primary">Открыть составной диалог</vui-button>
            <vui-dialog id="composition-dialog" label="Правка">
              <vui-input label="Название" value="VUI"></vui-input>
              <vui-select id="composition-status" label="Статус">
                <vui-option value="ready">Готов</vui-option>
                <vui-option value="draft">Черновик</vui-option>
              </vui-select>
              <vui-button id="composition-dialog-close" slot="footer" variant="secondary">Закрыть</vui-button>
            </vui-dialog>
            <p class="demo-note">Содержимое и действие — слоты. Escape закрывает select внутри dialog раньше самого окна и возвращает фокус.</p>
          </vui-panel>

          <h3>Families</h3>
          <vui-panel heading="Семейства">
            <div class="table-wrap">
              <table id="family-table" class="contract-table">
                <thead>
                  <tr>
                    <th>Семейство</th>
                    <th>Элемент</th>
                    <th>Правила</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </vui-panel>

          <h3>Contracts</h3>
          <vui-panel heading="Композиции">
            <div class="table-wrap">
              <table id="composition-table" class="contract-table">
                <thead>
                  <tr>
                    <th>Сценарий</th>
                    <th>Хост</th>
                    <th>Как связан</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </vui-panel>
        </div>
      </section>

      <section class="category" id="components">
        <h2>Components</h2>
        <p class="section-lead">Реализации одного контракта. Ниже — рабочие примеры, не заглушки.</p>
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
              <vui-button loading>Сохраняет</vui-button>
            </vui-hstack>
            <p id="save-result" class="demo-note">Нажмите «Сохранить».</p>
            <pre class="code">&lt;vui-button variant="primary"&gt;Сохранить&lt;/vui-button&gt;
button.addEventListener("click", handler);</pre>
          </vui-panel>

          <vui-panel heading="Toggle">
            <vui-toggle-group label="Выравнивание" value="left">
              <vui-toggle value="left" pressed>Слева</vui-toggle>
              <vui-toggle value="center">По центру</vui-toggle>
              <vui-toggle value="right">Справа</vui-toggle>
            </vui-toggle-group>
            <pre class="code">&lt;vui-toggle-group label="Выравнивание" value="left"&gt;
  &lt;vui-toggle value="left" pressed&gt;Слева&lt;/vui-toggle&gt;
&lt;/vui-toggle-group&gt;</pre>
          </vui-panel>
          <vui-panel heading="Icon button">
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
            <vui-input label="Дата" type="date"></vui-input>
            <vui-slider id="volume" label="Громкость" value="40" hint="Одно значение"></vui-slider>
            <vui-slider label="Диапазон" value="20" value-end="70"></vui-slider>
            <vui-checkbox-group label="Каналы" value="mail">
              <vui-checkbox value="mail" checked>Почта</vui-checkbox>
              <vui-checkbox value="push">Push</vui-checkbox>
            </vui-checkbox-group>
            <vui-field-group label="Адрес" hint="Группа полей">
              <vui-input label="Город" value="Казань"></vui-input>
              <vui-input label="Улица" value="Баумана"></vui-input>
            </vui-field-group>
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
              <vui-alert variant="neutral" banner>Полоса на всю ширину страницы.</vui-alert>
              <vui-empty heading="Нет записей" label="Пусто">
                Измените фильтр.
                <vui-button slot="action" variant="secondary" size="small">Сбросить</vui-button>
              </vui-empty>
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
          <vui-hstack gap="sm" wrap>
            <vui-button id="open-dialog">Открыть диалог</vui-button>
            <vui-button id="open-drawer" variant="secondary">Открыть панель</vui-button>
          </vui-hstack>
          <p class="demo-note">Escape, кнопка закрытия и щелчок по фону закрывают окно. Фокус остаётся внутри.</p>
          <pre class="code">&lt;vui-dialog label="Сохранить изменения"&gt;
  &lt;p&gt;Текст диалога&lt;/p&gt;
  &lt;div slot="footer"&gt;
    &lt;vui-button&gt;Сохранить&lt;/vui-button&gt;
  &lt;/div&gt;
&lt;/vui-dialog&gt;</pre>
        </vui-panel>
        <vui-panel heading="Context menu">
          <vui-button id="open-menu" variant="secondary">Открыть меню</vui-button>
          <div id="menu-target" class="menu-target" tabindex="0">Правый щелчок или Shift+F10</div>
          <p id="menu-result" class="demo-note">Команда file.save ещё не выполнялась. Ctrl+S выполняет её в этом showcase.</p>
          <vui-menu id="demo-menu" label="Файл">
            <vui-menu-item label="Сохранить" command="file.save"></vui-menu-item>
            <vui-menu-item label="Удалить" command="file.delete"></vui-menu-item>
            <vui-menu-item label="Поделиться">
              <vui-menu slot="submenu" label="Поделиться">
                <vui-menu-item label="Копировать ссылку" command="file.copyLink"></vui-menu-item>
              </vui-menu>
            </vui-menu-item>
          </vui-menu>
          <div class="row-gap">
            <div id="drag-source" class="drag-chip" tabindex="0">Перетащить</div>
            <div id="drop-target" class="drop-well">Отпустите здесь</div>
          </div>
          <p id="drop-result" class="demo-note">Перенос ещё не завершён.</p>
          <pre class="code">&lt;vui-menu label="Файл"&gt;
  &lt;vui-menu-item label="Сохранить" command="file.save"&gt;&lt;/vui-menu-item&gt;
&lt;/vui-menu&gt;</pre>
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
        <vui-drawer id="demo-drawer" label="Фильтры" close-label="Закрыть">
          <vui-input label="Статус" placeholder="Любой"></vui-input>
          <vui-button id="drawer-close" slot="footer" variant="secondary">Закрыть</vui-button>
        </vui-drawer>
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

          <vui-panel heading="Navigation">
            <vui-nav label="Разделы">
              <vui-nav-item href="#components" selected>Компоненты</vui-nav-item>
              <vui-nav-item href="#patterns">Patterns</vui-nav-item>
              <vui-nav-item href="#shell">Shell</vui-nav-item>
            </vui-nav>
            <vui-stepper label="Шаги" value="review">
              <vui-step value="draft">Черновик</vui-step>
              <vui-step value="review" selected>Проверка</vui-step>
              <vui-step value="done">Готово</vui-step>
            </vui-stepper>
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
          <vui-list label="Состав" value="button">
            <vui-list-item value="button" selected>Button</vui-list-item>
            <vui-list-item value="field">Field</vui-list-item>
            <vui-list-item value="shell">Shell</vui-list-item>
          </vui-list>
          <vui-properties label="Inspector">
            <vui-property label="Name">Button</vui-property>
            <vui-property label="Family">Action</vui-property>
          </vui-properties>
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
            <vui-window label="button.ts">
              <vui-icon-button slot="controls" name="x" label="Закрыть"></vui-icon-button>
              <p>Заголовок и слот controls. Это не окно операционной системы.</p>
            </vui-window>
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

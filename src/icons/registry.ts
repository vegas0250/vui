import {
  Bell,
  Check,
  CircleAlert,
  CircleCheck,
  Columns2,
  Command,
  Contrast,
  Copy,
  Eye,
  EyeOff,
  File,
  FileCode,
  Folder,
  FolderOpen,
  GripVertical,
  House,
  Info,
  LoaderCircle,
  Menu,
  Monitor,
  Moon,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Play,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sun,
  Table,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide';

type IconNode = ReadonlyArray<readonly [string, Record<string, string | number>]>;

const builtins: Record<string, IconNode> = {
  bell: Bell as IconNode,
  check: Check as IconNode,
  'circle-alert': CircleAlert as IconNode,
  'circle-check': CircleCheck as IconNode,
  'columns-2': Columns2 as IconNode,
  command: Command as IconNode,
  contrast: Contrast as IconNode,
  copy: Copy as IconNode,
  eye: Eye as IconNode,
  'eye-off': EyeOff as IconNode,
  file: File as IconNode,
  'file-code': FileCode as IconNode,
  folder: Folder as IconNode,
  'folder-open': FolderOpen as IconNode,
  'grip-vertical': GripVertical as IconNode,
  house: House as IconNode,
  info: Info as IconNode,
  loader: LoaderCircle as IconNode,
  menu: Menu as IconNode,
  monitor: Monitor as IconNode,
  moon: Moon as IconNode,
  'more-horizontal': MoreHorizontal as IconNode,
  'panel-left': PanelLeft as IconNode,
  pencil: Pencil as IconNode,
  play: Play as IconNode,
  'refresh-cw': RefreshCw as IconNode,
  save: Save as IconNode,
  search: Search as IconNode,
  settings: Settings as IconNode,
  sun: Sun as IconNode,
  table: Table as IconNode,
  'trash-2': Trash2 as IconNode,
  'triangle-alert': TriangleAlert as IconNode,
  x: X as IconNode,
};

const customIcons = new Map<string, string>();

export const iconNames: readonly string[] = Object.keys(builtins).sort();

/** Registers an additional icon without exposing the underlying icon library. */
export function registerIcon(name: string, svg: string): void {
  customIcons.set(name, svg);
}

export function renderIcon(host: HTMLElement, name: string): void {
  host.replaceChildren();
  const custom = customIcons.get(name);
  if (custom) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = custom;
    const svg = wrapper.querySelector('svg');
    if (svg) host.append(svg);
    return;
  }

  const node = builtins[name];
  if (!node) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  for (const [tag, attrs] of node) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
    svg.append(element);
  }
  host.append(svg);
}

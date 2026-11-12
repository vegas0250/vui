import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Columns2,
  Command,
  Contrast,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FilePlay,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  FormInput,
  Globe,
  Hash,
  GripVertical,
  HardDrive,
  House,
  Images,
  Info,
  Layers,
  LayoutTemplate,
  LoaderCircle,
  Menu,
  Minus,
  Monitor,
  Moon,
  MoreHorizontal,
  Palette,
  PanelLeft,
  Pencil,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Network,
  Server,
  Settings,
  Shield,
  Square,
  Star,
  Sun,
  Table,
  Terminal,
  Trash2,
  Type,
  Waypoints,
  TriangleAlert,
  X,
} from 'lucide';

type IconNode = ReadonlyArray<readonly [string, Record<string, string | number>]>;

const builtins: Record<string, IconNode> = {
  'arrow-left': ArrowLeft as IconNode,
  'arrow-right': ArrowRight as IconNode,
  'arrow-up': ArrowUp as IconNode,
  bell: Bell as IconNode,
  check: Check as IconNode,
  'chevron-down': ChevronDown as IconNode,
  'chevron-left': ChevronLeft as IconNode,
  'chevron-right': ChevronRight as IconNode,
  'circle-alert': CircleAlert as IconNode,
  'circle-check': CircleCheck as IconNode,
  'columns-2': Columns2 as IconNode,
  command: Command as IconNode,
  clock: Clock as IconNode,
  contrast: Contrast as IconNode,
  copy: Copy as IconNode,
  download: Download as IconNode,
  eye: Eye as IconNode,
  'eye-off': EyeOff as IconNode,
  file: File as IconNode,
  'file-archive': FileArchive as IconNode,
  'file-audio': FileAudio as IconNode,
  'file-code': FileCode as IconNode,
  'file-image': FileImage as IconNode,
  'file-play': FilePlay as IconNode,
  'file-text': FileText as IconNode,
  folder: Folder as IconNode,
  'folder-open': FolderOpen as IconNode,
  'folder-plus': FolderPlus as IconNode,
  'form-input': FormInput as IconNode,
  globe: Globe as IconNode,
  'grip-vertical': GripVertical as IconNode,
  hash: Hash as IconNode,
  'hard-drive': HardDrive as IconNode,
  house: House as IconNode,
  images: Images as IconNode,
  info: Info as IconNode,
  layers: Layers as IconNode,
  'layout-template': LayoutTemplate as IconNode,
  loader: LoaderCircle as IconNode,
  menu: Menu as IconNode,
  minus: Minus as IconNode,
  monitor: Monitor as IconNode,
  moon: Moon as IconNode,
  'more-horizontal': MoreHorizontal as IconNode,
  palette: Palette as IconNode,
  'panel-left': PanelLeft as IconNode,
  pencil: Pencil as IconNode,
  pin: Pin as IconNode,
  play: Play as IconNode,
  plus: Plus as IconNode,
  'refresh-cw': RefreshCw as IconNode,
  save: Save as IconNode,
  network: Network as IconNode,
  search: Search as IconNode,
  server: Server as IconNode,
  settings: Settings as IconNode,
  shield: Shield as IconNode,
  square: Square as IconNode,
  star: Star as IconNode,
  sun: Sun as IconNode,
  terminal: Terminal as IconNode,
  waypoints: Waypoints as IconNode,
  table: Table as IconNode,
  'trash-2': Trash2 as IconNode,
  'triangle-alert': TriangleAlert as IconNode,
  type: Type as IconNode,
  x: X as IconNode,
};

/** Organized gallery groups for documentation. Names must exist in builtins or customIcons. */
export const iconGroups: ReadonlyArray<{ id: string; label: [string, string]; icons: readonly string[] }> = [
  { id: 'navigation', label: ['Навигация', 'Navigation'], icons: ['arrow-left', 'arrow-right', 'arrow-up', 'chevron-down', 'chevron-left', 'chevron-right', 'house', 'menu', 'panel-left', 'waypoints'] },
  { id: 'actions', label: ['Действия', 'Actions'], icons: ['plus', 'minus', 'pencil', 'trash-2', 'copy', 'save', 'download', 'search', 'refresh-cw', 'play', 'pin', 'command', 'more-horizontal'] },
  { id: 'files', label: ['Файлы', 'Files'], icons: ['file', 'file-text', 'file-code', 'file-image', 'file-audio', 'file-play', 'file-archive', 'folder', 'folder-open', 'folder-plus'] },
  { id: 'status', label: ['Статус', 'Status'], icons: ['check', 'circle-check', 'circle-alert', 'triangle-alert', 'info', 'bell', 'loader', 'eye', 'eye-off', 'shield', 'star'] },
  { id: 'chrome', label: ['Интерфейс', 'Chrome'], icons: ['settings', 'sun', 'moon', 'contrast', 'monitor', 'palette', 'terminal', 'globe', 'hash', 'grip-vertical', 'columns-2', 'table', 'square', 'x', 'clock'] },
  { id: 'catalog', label: ['Каталог', 'Catalog'], icons: ['play', 'form-input', 'layers', 'waypoints', 'bell', 'type', 'palette', 'layout-template', 'monitor', 'table', 'images', 'network', 'server', 'hard-drive'] },
];

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

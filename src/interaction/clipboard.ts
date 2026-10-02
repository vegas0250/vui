export interface ClipboardPayload {
  text?: string;
  /** Structured values kept by VUI. The platform clipboard receives text. */
  items?: Record<string, unknown>;
}

let memoryText = '';
const memoryItems = new Map<string, unknown>();

async function writeSystemText(value: string): Promise<void> {
  const clipboard = navigator.clipboard;
  if (!clipboard?.writeText) return;
  try {
    await clipboard.writeText(value);
  } catch {
    // The in-memory copy remains available when the platform clipboard refuses.
  }
}

async function readSystemText(): Promise<string | null> {
  const clipboard = navigator.clipboard;
  if (!clipboard?.readText) return null;
  try {
    return await clipboard.readText();
  } catch {
    return null;
  }
}

export async function writeClipboard(payload: ClipboardPayload): Promise<void> {
  if (payload.text !== undefined) {
    memoryText = payload.text;
    await writeSystemText(payload.text);
  }
  if (payload.items) {
    for (const [key, value] of Object.entries(payload.items)) memoryItems.set(key, value);
  }
}

export async function readClipboard(): Promise<Required<Pick<ClipboardPayload, 'text'>> & ClipboardPayload> {
  const system = await readSystemText();
  return {
    text: system && system.length > 0 ? system : memoryText,
    items: Object.fromEntries(memoryItems),
  };
}

export function copyText(text: string): Promise<void> {
  return writeClipboard({ text });
}

/** Writes `text`. The caller removes the original; VUI does not know what was cut. */
export function cutText(text: string): Promise<void> {
  return writeClipboard({ text });
}

export async function pasteText(): Promise<string> {
  return (await readClipboard()).text;
}

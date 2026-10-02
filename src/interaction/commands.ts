export interface Command {
  /** Stable id such as `file.save`. VUI does not invent application commands. */
  id: string;
  label: string;
  description?: string;
  icon?: string;
  /** Defaults to true. The same object can be updated later. */
  enabled?: boolean;
  /** Defaults to true. */
  visible?: boolean;
  checked?: boolean;
  /** Display metadata. The shortcut registry binds the keys. */
  shortcut?: string;
  execute: () => void;
}

/** Application-owned registry. There is no global command list. */
export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  register(command: Command): () => void {
    if (this.commands.has(command.id)) {
      throw new Error(`Command "${command.id}" is already registered`);
    }
    if (command.enabled === undefined) command.enabled = true;
    if (command.visible === undefined) command.visible = true;
    this.commands.set(command.id, command);
    return () => {
      if (this.commands.get(command.id) === command) this.commands.delete(command.id);
    };
  }

  get(id: string): Command | undefined {
    return this.commands.get(id);
  }

  list(): readonly Command[] {
    return [...this.commands.values()];
  }

  /** Runs the command when it exists, is visible, and is enabled. */
  execute(id: string): boolean {
    const command = this.commands.get(id);
    if (!command || command.enabled === false || command.visible === false) return false;
    command.execute();
    return true;
  }
}

/**
 * Interaction → command → component action.
 * A component calls this instead of keeping its own shortcut table.
 */
export function runCommand(registry: CommandRegistry | null | undefined, id: string | null | undefined): boolean {
  if (!registry || !id) return false;
  return registry.execute(id);
}

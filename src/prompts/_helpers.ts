import * as p from "@clack/prompts";

/**
 * Shared primitives every per-command prompt module uses. Wraps @clack/prompts
 * with our conventions: consistent cancel handling (Ctrl+C exits cleanly with
 * code 0), typed options, and a single place to switch the underlying
 * prompt library if we ever swap it out.
 */

export interface HasInteractivityFlags {
  nonInteractive?: boolean;
}

/**
 * True when we should present interactive prompts:
 *   - --non-interactive / -y NOT passed
 *   - AND stdout is a real TTY (i.e. running from a terminal, not piped)
 *
 * When false, callers should fall back to defaults or --flag values.
 */
export function shouldPrompt(flags: HasInteractivityFlags): boolean {
  if (flags.nonInteractive) return false;
  return Boolean(process.stdout.isTTY);
}

export interface OptionEntry<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export async function askMultiselect<T extends string>(opts: {
  message: string;
  options: Array<OptionEntry<T>>;
  defaults?: T[];
  required?: boolean;
}): Promise<T[]> {
  const result = await p.multiselect({
    message: opts.message,
    // @clack/prompts' Option type is slightly stricter than our OptionEntry,
    // but the runtime shape is identical.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @clack/prompts Option<T> shape mismatch, runtime is identical
    options: opts.options as any,
    initialValues: opts.defaults ?? [],
    required: opts.required ?? true,
  });
  if (p.isCancel(result)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return result as T[];
}

export async function askSelect<T extends string>(opts: {
  message: string;
  options: Array<OptionEntry<T>>;
  defaultValue?: T;
}): Promise<T> {
  const result = await p.select({
    message: opts.message,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @clack/prompts Option<T> shape mismatch, runtime is identical
    options: opts.options as any,
    initialValue: opts.defaultValue,
  });
  if (p.isCancel(result)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return result as T;
}

export async function askConfirm(opts: {
  message: string;
  defaultValue?: boolean;
}): Promise<boolean> {
  const result = await p.confirm({
    message: opts.message,
    initialValue: opts.defaultValue ?? false,
  });
  if (p.isCancel(result)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return result;
}

export async function askText(opts: {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
}): Promise<string> {
  const result = await p.text({
    message: opts.message,
    placeholder: opts.placeholder,
    initialValue: opts.defaultValue,
    validate: opts.validate
      ? (value) => opts.validate!(value ?? "")
      : undefined,
  });
  if (p.isCancel(result)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return result as string;
}

export const intro = p.intro;
export const outro = p.outro;
export const note = p.note;

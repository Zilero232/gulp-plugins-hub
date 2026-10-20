import type { RunContentHookInput } from './hooks.types';

/**
 * Runs an optional content hook and checks what it returns: a hook written in JavaScript that forgets to return
 * the text would otherwise end as an obscure `Buffer.from(undefined)` error. Without a hook, the text is returned.
 */
export const runContentHook = async ({ name, hook, content, file }: RunContentHookInput): Promise<string> => {
  if (!hook) {
    return content;
  }

  const result: unknown = await hook({ content, file });

  if (typeof result !== 'string') {
    throw new TypeError(`${name} must return the text as a string, got ${result === null ? 'null' : typeof result}`);
  }

  return result;
};

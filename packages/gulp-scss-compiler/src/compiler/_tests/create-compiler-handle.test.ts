import { describe, expect, it, vi } from 'vitest';

import type { SassCompiler } from '..';

import { createCompilerHandle } from '..';

const fakeCompiler = () => {
  const dispose = vi.fn(async () => {});
  const compiler: SassCompiler = { dispose, compileStringAsync: vi.fn() };

  return { dispose, compiler };
};

describe('createCompilerHandle', () => {
  it('starts one compiler for every acquire and stops it on dispose', async () => {
    const { dispose, compiler } = fakeCompiler();
    const init = vi.fn(async () => compiler);
    const handle = createCompilerHandle({ init });

    await handle.acquire();
    await handle.acquire();
    await handle.dispose();

    expect(init).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('never rejects on dispose, even after a failed start', async () => {
    const handle = createCompilerHandle({ init: async () => Promise.reject(new Error('no binary')) });

    await handle.acquire().catch(() => {});

    await expect(handle.dispose()).resolves.toBeUndefined();
  });

  it('refuses to start a compiler after dispose', async () => {
    const init = vi.fn();
    const handle = createCompilerHandle({ init });

    await handle.dispose();

    await expect(handle.acquire()).rejects.toThrow('stopped with the stream');
    expect(init).not.toHaveBeenCalled();
  });
});

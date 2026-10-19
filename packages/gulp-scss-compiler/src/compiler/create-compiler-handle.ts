import { initAsyncCompiler } from 'sass-embedded';

import type { CompilerHandle, CreateCompilerHandleInput, SassCompiler } from './compiler.types';

/**
 * One Sass compiler process for a whole stream: started with the first file, stopped when the stream ends or
 * is destroyed, so no process outlives the build.
 */
export const createCompilerHandle = ({ init = initAsyncCompiler }: CreateCompilerHandleInput = {}): CompilerHandle => {
  let compiler: Promise<SassCompiler> | undefined;
  let disposed = false;

  return {
    acquire: async () => {
      if (disposed) {
        throw new Error('The Sass compiler was stopped with the stream');
      }

      compiler ??= init();

      return compiler;
    },
    dispose: async () => {
      disposed = true;

      const running = compiler;
      compiler = undefined;

      try {
        await (await running)?.dispose();
      } catch {
        // A compiler that failed to start has nothing to stop; its error was reported by acquire.
      }
    }
  };
};

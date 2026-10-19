import type { AsyncCompiler } from 'sass-embedded';

/** What the plugin uses of sass-embedded's AsyncCompiler. */
export type SassCompiler = Pick<AsyncCompiler, 'compileStringAsync' | 'dispose'>;

export type CreateCompilerHandleInput = {
  /** Starts a compiler; sass-embedded's `initAsyncCompiler` unless a test passes its own. */
  init?: () => Promise<SassCompiler>;
};

export type CompilerHandle = {
  /** The compiler, started on the first call. A failed start fails the file, which ends the stream. */
  acquire: () => Promise<SassCompiler>;
  /** Stops the compiler, if it started, and refuses to start another. Never rejects. */
  dispose: () => Promise<void>;
};

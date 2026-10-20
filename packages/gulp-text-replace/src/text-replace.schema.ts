import { isFunction } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { FileText, Replacer } from './text-replace.types';

const ruleSchema = z
  .object({
    /** A string matches literally, everywhere it occurs; a RegExp follows JavaScript: add `g` for every match. */
    search: z.union([z.string().min(1, 'Expected the text to search for'), z.instanceof(RegExp)]),
    /** The replacement: a string (`$1` and `$<name>` work with a RegExp), or a function of the match. */
    replace: z.union([z.string(), z.custom<Replacer>(isFunction, 'Expected a string or a function')])
  })
  .strict();

const fileTextSchema = z.union([z.string(), z.custom<FileText>(isFunction, 'Expected a string or a function')]);

export const textReplaceOptionsSchema = z
  .object({
    /** One rule or several, applied in order. */
    rules: z.union([ruleSchema, z.array(ruleSchema).min(1, 'Add at least one rule')]).optional(),
    /** Added at the start of every file, after the rules: a license banner, `'use strict'`. */
    header: fileTextSchema.optional(),
    /** Added at the end of every file, after the rules. */
    footer: fileTextSchema.optional(),
    /** Leave files that contain a NUL byte (images, fonts, archives) untouched. Default true. */
    skipBinary: z.boolean().default(true)
  })
  .strict()
  .refine(
    ({ rules, header, footer }) => rules !== undefined || header !== undefined || footer !== undefined,
    'Set at least one of rules, header or footer'
  );

/** One `{ search, replace }` rule. */
export type ReplaceRule = z.input<typeof ruleSchema>;

export type TextReplaceOptions = z.input<typeof textReplaceOptionsSchema>;

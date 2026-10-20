import type { StandardSchemaV1 } from '@standard-schema/spec';

import PluginError from 'plugin-error';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseOptions } from '../..';

const schema = z
  .object({
    name: z.string().default('app'),
    level: z.number().int().min(1).optional(),
    nested: z.object({ flag: z.boolean() }).optional()
  })
  .strict();

describe('parseOptions', () => {
  it('returns the parsed options with defaults applied', () => {
    expect(parseOptions({ name: 'gulp-test', schema, options: { level: 2 } })).toEqual({ name: 'app', level: 2 });
  });

  it('throws a PluginError listing every issue with its path', () => {
    const parse = () =>
      parseOptions({ name: 'gulp-test', schema, options: { level: 0, nested: { flag: 'yes' }, extra: true } });

    expect(parse).toThrow(PluginError);
    expect(parse).toThrow(/^Invalid options:\n {4}• level: .+\n {4}• nested\.flag: .+\n {4}• .*extra/);
  });

  it('names the options object itself when it is not an object', () => {
    expect(() => parseOptions({ name: 'gulp-test', schema, options: 'nope' })).toThrow(
      'Invalid options:\n    • Invalid input: expected object, received string'
    );
  });

  it('prefixes the error with the plugin name', () => {
    expect(() => parseOptions({ name: 'gulp-test', schema, options: { level: 'x' } })).toThrow(
      expect.objectContaining({ plugin: 'gulp-test' })
    );
  });

  it('accepts any Standard Schema and its path segments', () => {
    const custom: StandardSchemaV1<unknown, string> = {
      '~standard': {
        version: 1,
        vendor: 'custom',
        validate: () => ({ issues: [{ message: 'bad', path: [{ key: 'deep' }, 0] }] })
      }
    };

    expect(() => parseOptions({ name: 'gulp-test', schema: custom, options: {} })).toThrow('• deep.0: bad');
  });

  it('rejects asynchronous schemas', () => {
    const asyncSchema: StandardSchemaV1<unknown, string> = {
      '~standard': { version: 1, vendor: 'custom', validate: async () => ({ value: 'x' }) }
    };

    expect(() => parseOptions({ name: 'gulp-test', schema: asyncSchema, options: {} })).toThrow(
      'The options schema must be synchronous'
    );
  });
});

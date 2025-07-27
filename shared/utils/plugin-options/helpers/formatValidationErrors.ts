import { z } from 'zod';
import chalk from 'chalk';

export const formatValidationErrors = (error: z.ZodIssue): string => {
  const path = error.path.join('.');

  switch (error.code) {
    case 'invalid_union': {
      const validIssues = error.unionErrors
        .flatMap(({ issues }) => issues)
        .filter((issue) => issue.code === 'invalid_type');

      const expectedTypes = validIssues
        .map(({ expected }) => expected)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(' or ');

      const received = validIssues[0]?.received ?? 'unknown';

      return [
        'Validation failed:',
        `  Path: ${chalk.gray(path)}`,
        `  Expected: ${chalk.green(expectedTypes)}`,
        `  Received: ${chalk.yellow(received)}`
      ].join('\n');
    }

    case 'invalid_type': {
      return [
        'Validation failed:',
        `  Path: ${chalk.gray(path)}`,
        `  Expected: ${chalk.green(error.expected)}`,
        `  Received: ${chalk.yellow(error.received)}`
      ].join('\n');
    }

    case 'unrecognized_keys': {
      return [
        'Found extra keys:',
        ...error.keys.map(key => `  • ${chalk.yellow(key)}`)
      ].join('\n');
    }

    default: {
      return [
        error.message,
        `  Path: ${chalk.gray(path)}`
      ].join('\n');
    }
  }
}

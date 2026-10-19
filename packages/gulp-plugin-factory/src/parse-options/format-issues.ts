import type { StandardSchemaV1 } from '@standard-schema/spec';

const formatPath = (path: StandardSchemaV1.Issue['path']): string =>
  (path ?? []).map((segment) => String(typeof segment === 'object' ? segment.key : segment)).join('.');

/**
 * One line per issue: `• path: message`, or just the message for the options object itself. The lines are
 * indented like the first line of a PluginError message, so gulp prints them aligned.
 */
export const formatIssues = (issues: readonly StandardSchemaV1.Issue[]): string =>
  issues
    .map((issue) => {
      const path = formatPath(issue.path);

      return path ? `    • ${path}: ${issue.message}` : `    • ${issue.message}`;
    })
    .join('\n');

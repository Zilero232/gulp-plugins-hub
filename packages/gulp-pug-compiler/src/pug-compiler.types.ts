import type { Vinyl } from '@zilero/gulp-plugin-factory';

/** The locals a template is rendered with. */
export type TemplateData = Record<string, unknown>;

/** Returns the locals for one file: front matter, a JSON file next to it, … */
export type TemplateDataFunction = (input: { file: Vinyl }) => Promise<TemplateData> | TemplateData;

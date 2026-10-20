import type { FileHookInput } from '@zilero/gulp-plugin-factory';

/** The locals a template is rendered with. */
export type TemplateData = Record<string, unknown>;

/** What a `data` function receives: the file about to be rendered. */
export type TemplateDataInput = FileHookInput;

/** Returns the locals for one file: front matter, a JSON file next to it, … */
export type TemplateDataFunction = (input: TemplateDataInput) => Promise<TemplateData> | TemplateData;

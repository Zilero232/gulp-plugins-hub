import MagicString, { Bundle } from 'magic-string';

import type { CreateBundleInput, ResolveBundleTextInput } from './bundle.types';

import { getSourceName } from './get-source-name';

const resolveBundleText = async ({ text, files }: ResolveBundleTextInput): Promise<string | undefined> =>
  typeof text === 'function' ? text({ files }) : text;

/** The files joined with the separator, between the header and the footer; it can generate a source map. */
export const createBundle = async ({ files, base, separator, header, footer }: CreateBundleInput): Promise<Bundle> => {
  const bundle = new Bundle({ separator });

  for (const file of files) {
    bundle.addSource({
      filename: getSourceName({ base, filePath: file.path }),
      content: new MagicString(file.contents.toString())
    });
  }

  const headerText = await resolveBundleText({ text: header, files });
  const footerText = await resolveBundleText({ text: footer, files });

  if (headerText) {
    bundle.prepend(headerText);
  }

  if (footerText) {
    bundle.append(footerText);
  }

  return bundle;
};

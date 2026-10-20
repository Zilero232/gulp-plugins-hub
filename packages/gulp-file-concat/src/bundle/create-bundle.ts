import MagicString, { Bundle } from 'magic-string';
import { isString } from 'remeda';

import type { CreateBundleInput, ResolveBundleTextInput } from './bundle.types';

const resolveBundleText = async ({ text, files }: ResolveBundleTextInput): Promise<string | undefined> =>
  text === undefined || isString(text) ? text : text({ files });

/** The inputs joined with the separator, between the header and the footer; it can generate a source map. */
export const createBundle = async ({ sources, separator, header, footer }: CreateBundleInput): Promise<Bundle> => {
  const bundle = new Bundle({ separator });
  const files = sources.map(({ file }) => file);

  for (const { name, content } of sources) {
    bundle.addSource({ filename: name, content: new MagicString(content) });
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

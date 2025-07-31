import type { Transform } from 'stream';

type PluginDesc = (...args: any[]) => Transform;

export interface GlyphPluginOptions {
  /**
   * use this text to generate compressed font
   */
  text: string;
  /**
   * add basic chars to glyph, default false
   * @example "!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}"
   */
  basicText?: boolean;
  /**
   * keep gylph hinting, defaul true
   */
  hinting?: boolean;
  /**
   * use other plugin
   */
  use?: PluginDesc;
}

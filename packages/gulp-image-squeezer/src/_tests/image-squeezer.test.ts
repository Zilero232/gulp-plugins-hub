import type { Vinyl } from '@zilero/gulp-plugin-factory';

import { PluginError } from '@zilero/gulp-plugin-factory';
import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import sharp from 'sharp';
import { beforeAll, describe, expect, it } from 'vitest';

import imageSqueezer from '..';

let photo: Buffer;

beforeAll(async () => {
  // A noisy image, so the encoders have something to compress.
  const pixels = Buffer.alloc(400 * 200 * 3, 0).map((_, index) => (index * 7919) % 256);

  photo = await sharp(pixels, { raw: { width: 400, height: 200, channels: 3 } })
    .png({ compressionLevel: 0 })
    .toBuffer();
});

const metadata = async (file: Vinyl | undefined) => sharp(getContents(file)).metadata();

const squeeze = (
  options: Parameters<typeof imageSqueezer>[0],
  file = createFile({ path: 'img/photo.png', contents: photo })
) => runPlugin(imageSqueezer(options), [file]);

describe('imageSqueezer', () => {
  it('re-encodes in the original format and keeps the name', async () => {
    const [output] = await squeeze({});

    expect(getRelativePath(output)).toBe('img/photo.png');
    expect((await metadata(output)).format).toBe('png');
    expect(getContents(output).length).toBeLessThan(photo.length);
  });

  it('writes every requested format', async () => {
    const output = await squeeze({ formats: ['webp', 'avif', 'jpeg'] });

    expect(output.map(({ basename }) => basename)).toEqual(['photo.webp', 'photo.avif', 'photo.jpg']);

    expect(await Promise.all(output.map(async (file) => (await metadata(file)).format))).toEqual([
      'webp',
      'heif',
      'jpeg'
    ]);
  });

  it('resizes to every width without enlarging, naming each file after its real width', async () => {
    const output = await squeeze({ formats: ['original', 'webp'], widths: [100, 800, 1600] });

    expect(output.map(({ basename }) => basename)).toEqual([
      'photo-100w.png',
      'photo-100w.webp',
      'photo-400w.png',
      'photo-400w.webp'
    ]);

    expect((await metadata(output[0])).width).toBe(100);
    expect((await metadata(output[2])).width).toBe(400);
  });

  it('caps widths at the upright width of a rotated photo', async () => {
    const sideways = await sharp({ create: { width: 40, height: 20, channels: 3, background: '#0f0' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const output = await squeeze({ widths: [10, 30] }, createFile({ path: 'phone.jpg', contents: sideways }));

    expect(output.map(({ basename }) => basename)).toEqual(['phone-10w.jpg', 'phone-20w.jpg']);
  });

  it('keeps PNG lossless by default', async () => {
    // A smooth gradient with far more than 256 colors: a palette would band it.
    const pixels = Buffer.alloc(256 * 64 * 3).map((_, index) => {
      const pixel = Math.floor(index / 3);
      const channel = index % 3;

      return channel === 0 ? pixel % 256 : channel === 1 ? Math.floor(pixel / 256) * 4 : (pixel * 3) % 256;
    });

    const gradient = await sharp(pixels, { raw: { width: 256, height: 64, channels: 3 } })
      .png({ compressionLevel: 0 })
      .toBuffer();

    const [output] = await squeeze({ quality: 50 }, createFile({ path: 'gradient.png', contents: gradient }));
    const decode = async (image: Buffer) => sharp(image).raw().toBuffer();

    expect((await metadata(output)).isPalette).toBe(false);
    expect((await decode(getContents(output))).equals(await decode(gradient))).toBe(true);
  });

  it('quantizes PNG to a palette, with quality, only when asked', async () => {
    const [output] = await squeeze({ quality: { png: 60 }, encoderOptions: { png: { palette: true } } });

    expect((await metadata(output)).isPalette).toBe(true);
  });

  it('treats the source format as original: extension kept and keepSmaller applied', async () => {
    const tiny = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#000' } })
      .jpeg()
      .toBuffer();

    const [output] = await squeeze(
      { formats: 'jpeg', encoderOptions: { jpeg: { quality: 100, mozjpeg: false } } },
      createFile({ path: 'dot.jpeg', contents: tiny })
    );

    expect(output!.basename).toBe('dot.jpeg');
    expect(getContents(output)).toEqual(tiny);
  });

  it('applies quality and encoder options', async () => {
    const [low] = await squeeze({ formats: 'jpeg', quality: 10 });
    const [high] = await squeeze({ formats: 'jpeg', quality: { jpeg: 95 } });
    const [lossless] = await squeeze({ formats: 'webp', encoderOptions: { webp: { lossless: true } } });

    expect(getContents(low).length).toBeLessThan(getContents(high).length);
    expect((await metadata(lossless)).format).toBe('webp');
  });

  it('keeps the source when re-encoding makes it bigger, unless keepSmaller is false', async () => {
    const tiny = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#000' } })
      .png()
      .toBuffer();

    const file = () => createFile({ path: 'dot.png', contents: tiny });
    const heavy = { encoderOptions: { png: { compressionLevel: 0 } } };

    expect(getContents((await squeeze(heavy, file()))[0])).toEqual(tiny);
    expect(getContents((await squeeze({ ...heavy, keepSmaller: false }, file()))[0])).not.toEqual(tiny);
  });

  it('gives the first frame of an animation to still formats and keeps every frame in WebP', async () => {
    const frame = async (background: string) =>
      sharp({ create: { width: 20, height: 10, channels: 3, background } })
        .png()
        .toBuffer();

    const frames = await Promise.all(['#f00', '#0f0', '#00f'].map(frame));

    const gif = await sharp(frames, { join: { animated: true } })
      .gif()
      .toBuffer();

    const [still, webp] = await squeeze({ formats: ['png', 'webp'] }, createFile({ path: 'anim.gif', contents: gif }));

    expect(await metadata(still)).toMatchObject({ width: 20, height: 10 });
    expect(await sharp(getContents(webp), { animated: true }).metadata()).toMatchObject({ pages: 3, pageHeight: 10 });
  });

  it('keeps every page of a TIFF in TIFF and gives the first one to other formats', async () => {
    const page = async (background: string) =>
      sharp({ create: { width: 8, height: 8, channels: 3, background } })
        .png()
        .toBuffer();

    const pages = await Promise.all(['#f00', '#0f0', '#00f'].map(page));

    const tiff = await sharp(pages, { join: { animated: true } })
      .tiff()
      .toBuffer();

    const [kept, webp] = await squeeze(
      { formats: ['original', 'webp'] },
      createFile({ path: 'doc.tiff', contents: tiff })
    );

    expect((await sharp(getContents(kept), { pages: -1 }).metadata()).pages).toBe(3);
    expect((await sharp(getContents(webp), { animated: true }).metadata()).pages ?? 1).toBe(1);
  });

  it('gives transparent pixels a white background in JPEG', async () => {
    const transparent = await sharp({
      create: { width: 2, height: 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .png()
      .toBuffer();

    const [jpeg] = await squeeze({ formats: 'jpeg' }, createFile({ path: 'clear.png', contents: transparent }));
    const { data } = await sharp(getContents(jpeg)).raw().toBuffer({ resolveWithObject: true });

    expect([...data.subarray(0, 3)].every((channel) => channel > 250)).toBe(true);
  });

  it('turns photos upright from their EXIF orientation', async () => {
    // 40×20 pixels stored, shown as 20×40 (orientation 6: rotate 90°).
    const sideways = await sharp({ create: { width: 40, height: 20, channels: 3, background: '#0f0' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const [output] = await squeeze({ formats: 'webp' }, createFile({ path: 'phone.jpg', contents: sideways }));

    expect(await metadata(output)).toMatchObject({ width: 20, height: 40 });
  });

  it('writes the source format once when it is asked for twice', async () => {
    const output = await squeeze({ formats: ['original', 'png'] });

    expect(output.map(({ basename }) => basename)).toEqual(['photo.png']);
  });

  it('processes uppercase extensions', async () => {
    const [output] = await squeeze({ formats: 'webp' }, createFile({ path: 'PHOTO.PNG', contents: photo }));

    expect(output!.basename).toBe('PHOTO.webp');
  });

  it('leaves SVG and other files alone', async () => {
    const [svg] = await squeeze({ formats: 'webp' }, createFile({ path: 'logo.svg', contents: '<svg/>' }));

    expect(svg!.basename).toBe('logo.svg');
  });

  it('explains how to fix an image read as UTF-8', async () => {
    const run = squeeze({}, createFile({ path: 'img/photo.png', contents: Buffer.from(photo.toString('utf8')) }));

    await expect(run).rejects.toBeInstanceOf(PluginError);
    await expect(run).rejects.toThrow('img/photo.png was read as UTF-8 text');
  });

  it('rejects unknown encoders and encoder options that are not objects', () => {
    // @ts-expect-error: not an encoder
    expect(() => imageSqueezer({ encoderOptions: { jpg: {} } })).toThrow(/Invalid options/);
    // @ts-expect-error: not an object
    expect(() => imageSqueezer({ encoderOptions: { png: 9 } })).toThrow('Expected an object of sharp options');
  });

  it('rejects an out-of-range quality and empty lists', () => {
    expect(() => imageSqueezer({ quality: 0 })).toThrow(/Invalid options/);
    expect(() => imageSqueezer({ formats: [] })).toThrow('Add at least one format');
    expect(() => imageSqueezer({ widths: [] })).toThrow('Add at least one width');
  });
});

import type {
	AvifOptions,
	BlurOptions,
	Color,
	FlattenOptions,
	GifOptions,
	HeifOptions,
	Jp2Options,
	JpegOptions,
	JxlOptions,
	Kernel,
	NegateOptions,
	NormaliseOptions,
	OverlayOptions,
	PngOptions,
	Region,
	ResizeOptions,
	RotateOptions,
	Sharp,
	SharpenOptions,
	SharpOptions,
	ThresholdOptions,
	TiffOptions,
	TileOptions,
	TimeoutOptions,
	TrimOptions,
	WebpOptions,
} from 'sharp';

// Main sharp object type definition.
export type InitialSharp = Sharp;

// Declaring keys as supported transforms.
export enum SupportedTransformMethod {
	Format = 'format',
	Formats = 'formats',
	Resize = 'resize',
	Tile = 'tile',
	Timeout = 'timeout',
	Flip = 'flip',
	Flop = 'flop',
	Median = 'median',
	Grayscale = 'grayscale',
	Negate = 'negate',
	Tint = 'tint',
	Extract = 'extract',
	Trim = 'trim',
	Composite = 'composite',
	EnsureAlpha = 'ensureAlpha',
	RemoveAlpha = 'removeAlpha',
	Convolve = 'convolve',
	Flatten = 'flatten',
	Normalise = 'normalise',
	Rotate = 'rotate',
	Sharpen = 'sharpen',
	Blur = 'blur',
	Threshold = 'threshold',
	Gamma = 'gamma',
}

// Declaring keys as supported formats.
export enum SupportedFormatMethod {
	Jpeg = 'jpeg',
	Png = 'png',
	Webp = 'webp',
	Avif = 'avif',
	Heif = 'heif',
	Gif = 'gif',
	Jxl = 'jxl',
	Jp2 = 'jp2',
	Tiff = 'tiff',
}

// Defines available format options for image output.
export interface FormatOptions {
	[SupportedFormatMethod.Jpeg]?: JpegOptions; // JPEG-specific encoding options.
	[SupportedFormatMethod.Png]?: PngOptions; // PNG-specific encoding options.
	[SupportedFormatMethod.Webp]?: WebpOptions; // WebP-specific encoding options.
	[SupportedFormatMethod.Avif]?: AvifOptions; // AVIF-specific encoding options.
	[SupportedFormatMethod.Heif]?: HeifOptions; // HEIF-specific encoding options.
	[SupportedFormatMethod.Gif]?: GifOptions; // GIF-specific encoding options.
	[SupportedFormatMethod.Jxl]?: JxlOptions; // JPEG XL-specific encoding options.
	[SupportedFormatMethod.Jp2]?: Jp2Options; // JPEG 2000-specific encoding options.
	[SupportedFormatMethod.Tiff]?: TiffOptions; // TIFF-specific encoding options.
}

// Complete set of options for configuring image processing in Gulp.
export interface GulpSharperOptions extends SharpOptions {
	[SupportedTransformMethod.Format]?: SupportedFormatMethod; // Specifies the output format (e.g., jpeg, png).
	[SupportedTransformMethod.Resize]?: ResizeOptions; // Resizing options such as width, height, and aspect ratio.
	[SupportedTransformMethod.Formats]?: FormatOptions; // Advanced format-specific options for each image type.
	[SupportedTransformMethod.Tile]?: TileOptions; // Tiling options for creating zoomable images.
	[SupportedTransformMethod.Timeout]?: TimeoutOptions; // Sets a timeout for the operation.
	[SupportedTransformMethod.Flip]?: boolean; // Whether to flip the image vertically.
	[SupportedTransformMethod.Flop]?: boolean; // Whether to flop the image horizontally.
	[SupportedTransformMethod.Median]?: number; // Applies a median filter to reduce noise.
	[SupportedTransformMethod.Grayscale]?: boolean; // Converts the image to grayscale.
	[SupportedTransformMethod.Negate]?: boolean | NegateOptions; // Inverts the colors of the image.
	[SupportedTransformMethod.Tint]?: Color; // Applies a tint to the image with a specific color.
	[SupportedTransformMethod.Extract]?: Region; // Extracts a region of the image.
	[SupportedTransformMethod.Trim]?: TrimOptions; // Trims edges of the image.
	[SupportedTransformMethod.Composite]?: OverlayOptions[]; // Composite multiple images over each other.
	[SupportedTransformMethod.EnsureAlpha]?: number; // Ensures that the image contains an alpha channel (transparency).
	[SupportedTransformMethod.RemoveAlpha]?: boolean; // Removes the alpha channel from the image.
	[SupportedTransformMethod.Convolve]?: Kernel; // Applies a custom kernel for image filtering.
	[SupportedTransformMethod.Flatten]?: boolean | FlattenOptions; // Flattens the image, removing transparency and filling with a color.
	[SupportedTransformMethod.Normalise]?: NormaliseOptions; // Normalizes the image for consistent brightness and contrast.
	[SupportedTransformMethod.Sharpen]?: SharpenOptions; // Applies a sharpening effect to the image.
	[SupportedTransformMethod.Rotate]?: {
		// Rotates the image with optional angle and settings.
		angle?: number; // The angle to rotate the image.
		options?: RotateOptions; // Additional options for rotation.
	};
	[SupportedTransformMethod.Blur]?: {
		// Applies a blur effect to the image.
		sigma?: number | boolean | BlurOptions; // The intensity of the blur, or a boolean to enable/disable.
	};
	[SupportedTransformMethod.Threshold]?: {
		// Applies a threshold to the image.
		threshold?: number; // Threshold value for binary conversion.
		options?: ThresholdOptions; // Additional options for thresholding.
	};
	[SupportedTransformMethod.Gamma]?: {
		// Adjusts gamma correction.
		gamma?: number; // Gamma correction value.
		gammaOut?: number; // Gamma output value.
	};
	enableFileLogging?: boolean; // Enables logging for individual file processing.
	enableFinalLogging?: boolean; // Enables logging for final processing summary.
}

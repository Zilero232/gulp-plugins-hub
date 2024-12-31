import { InvalidFormatError } from '@shared/utils';
import { isObject } from '@shared/helpers/typeHelpers';

import isValidTransformMethod from '../../helpers/isValidTransformMethod';
import createTransformMethod from '../../helpers/createTransformMethod';

import type { GulpSharperOptions, InitialSharp } from '../../types';
import { SupportedTransformMethod } from '../../types';

interface CreateSharpTransformationsProps {
	pipeline: InitialSharp;
	transformations: GulpSharperOptions;
}

/**
 * Applies transformations to the sharp pipeline.
 *
 * This function takes a pipeline and a transformation options, and applies each transformation to the pipeline.
 * If the transformation options are empty, it returns the pipeline immediately.
 *
 * @param {InitialSharp} pipeline - The sharp pipeline to be transformed.
 * @param {GulpSharperOptions} transformations - The transformation options to be applied to the pipeline.
 *
 * @returns {InitialSharp} - The modified sharp pipeline.
 */

export const createSharpTransformations = ({ pipeline, transformations }: CreateSharpTransformationsProps): InitialSharp => {
	if (!transformations) {
		return pipeline;
	}

	if (!isObject(transformations)) {
		throw new InvalidFormatError({
			fieldName: 'CreateSharpTransformations',
			receivedValue: transformations,
			expectedType: 'GulpSharperOptions',
		});
	}

	// Through each format and call the appropriate processing.
	(Object.keys(transformations) as SupportedTransformMethod[]).forEach((key) => {
		// If key is formats, skip it, because we already processed it.
		if (SupportedTransformMethod.Formats === key) {
			return;
		}

		// Add warning if the key is not a valid transform method.
		if (!isValidTransformMethod(key)) {
			return;
		}

		const options = transformations[key];

		switch (key) {
			case SupportedTransformMethod.Rotate:
				const { angle = 0, options: rotateOptions } = (options as GulpSharperOptions['rotate']) ?? {};

				pipeline.rotate(angle, rotateOptions);

				break;
			case SupportedTransformMethod.Threshold:
				const { threshold: thresholdValue, options: thresholdOptions } = (options as GulpSharperOptions['threshold']) ?? {};

				pipeline.threshold(thresholdValue, thresholdOptions);

				break;
			case SupportedTransformMethod.Gamma:
				const { gamma, gammaOut } = (options as GulpSharperOptions['gamma']) ?? {};

				pipeline.gamma(gamma, gammaOut);

				break;
			case SupportedTransformMethod.Blur:
				const { sigma } = (options as GulpSharperOptions['blur']) ?? {};

				pipeline.blur(sigma);

				break;
			default:
				createTransformMethod({
					pipeline,
					options,
					method: key, // Dynamic method transfer.
					expectedType: 'object',
				});

				break;
		}
	});

	return pipeline;
};

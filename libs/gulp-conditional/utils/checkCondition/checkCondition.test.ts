import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { checkCondition, validateCondition } from '../';

import type { Condition } from '../../types';

import { PLUGIN_NAME } from '../../constants';

jest.mock('../', () => ({
	validateCondition: jest.fn(),
}));

jest.mock('@zilero/gulp-winston-logger', () => jest.fn());

describe('checkCondition', () => {
	const mockFile = { path: 'test/file.txt' } as FileVinyl;

	const mockCondition: Condition = {
		extensions: ['.txt'],
		minSize: 10,
	};

	beforeEach(() => {
		jest.clearAllMocks(); // We reset the mock before each test.
	});

	it('should throw an error if file is not provided or if condition is not object', () => {
		const errorMessage = 'Condition must be a boolean or an object with condition options.';

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => checkCondition({ file: null as any, condition: mockCondition })).toThrow(errorMessage);

		// Check that GulpWinstonLogger is called with the correct arguments.
		expect(GulpWinstonLogger).toHaveBeenCalledWith({
			pluginName: PLUGIN_NAME,
			message: errorMessage,
		});
	});

	it('should return the boolean condition directly if condition is a boolean (true)', () => {
		const result = checkCondition({ file: mockFile, condition: true });

		expect(result).toBe(true);
	});

	it('should return the boolean condition directly if condition is a boolean (false)', () => {
		const result = checkCondition({ file: mockFile, condition: false });

		expect(result).toBe(false);
	});

	it('should call validateCondition with correct arguments when condition is an object', () => {
		(validateCondition as jest.Mock).mockReturnValue(true);

		const result = checkCondition({ file: mockFile, condition: mockCondition });

		// Check that the validate Condition was called with the correct arguments.
		expect(validateCondition).toHaveBeenCalledWith({ file: mockFile, condition: mockCondition });

		expect(result).toBe(true);
	});

	it('should return false if validateCondition returns false', () => {
		(validateCondition as jest.Mock).mockReturnValue(false);

		const result = checkCondition({ file: mockFile, condition: mockCondition });

		expect(result).toBe(false);
	});
});

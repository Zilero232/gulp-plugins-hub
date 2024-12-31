import Vinyl from 'vinyl';

import { validateCondition } from '../';

import {
	fileContainsContent,
	filePathContains,
	getFileCreationDate,
	getFileExtension,
	getFileModificationDate,
	getFileName,
	getFileSize,
} from '../../helpers';

import type { ConditionOptions } from '../../types';

jest.mock('../../helpers', () => ({
	getFileExtension: jest.fn(),
	getFileCreationDate: jest.fn(),
	getFileModificationDate: jest.fn(),
	getFileName: jest.fn(),
	getFileSize: jest.fn(),
	fileContainsContent: jest.fn(),
	filePathContains: jest.fn(),
}));

describe('validateCondition with real Vinyl file', () => {
	const realFile = new Vinyl({
		cwd: '',
		base: '',
		path: 'test/file.txt',
		contents: Buffer.from('Test file content\n Another line'),
	});

	const condition: ConditionOptions = {
		extensions: ['.txt'],
		namesContains: ['file'],
		namesEquals: ['file.txt'],
		minSize: 10,
		maxSize: 1000,
		modifiedAfter: '2024-01-01',
		modifiedBefore: '2025-01-01',
		createdAfter: '2024-01-01',
		createdBefore: '2025-01-01',
		containsContent: 'file content',
		pathContains: 'test',
		lineCount: 2,
		sizeInKB: 1,
		customFileFilter: jest.fn().mockReturnValue(true),
	};

	beforeEach(() => {
		(getFileExtension as jest.Mock).mockReturnValue('.txt');
		(getFileName as jest.Mock).mockReturnValue('file.txt');
		(getFileSize as jest.Mock).mockReturnValue(1024); // 1 KB
		(fileContainsContent as jest.Mock).mockReturnValue(true);
		(filePathContains as jest.Mock).mockReturnValue(true);
		(getFileCreationDate as jest.Mock).mockReturnValue(new Date('2024-01-02'));
		(getFileModificationDate as jest.Mock).mockReturnValue(new Date('2024-01-02'));
	});

	it('should return true if all conditions are met', () => {
		expect(validateCondition({ file: realFile, condition })).toBe(true);
	});

	it('should return false if file extension does not match', () => {
		(getFileExtension as jest.Mock).mockReturnValue('.md');

		expect(validateCondition({ file: realFile, condition })).toBe(false);
	});
});

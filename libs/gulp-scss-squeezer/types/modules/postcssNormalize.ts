export interface NormalizeOptions {
	options?: {
		/**
		 * @default false
		 */
		allowDuplicates?: boolean | undefined;

		/**
		 * @default null
		 */
		forceImport?: boolean | string | undefined;

		/**
		 * @default null
		 */
		browsers?: string | undefined;
	};
}

export const checkIsFile = (value: unknown): value is File => {
	return value instanceof Object;
};

// Type guard to check if an object is of type File.
export const checkIsFile = (obj: unknown): obj is FileVinyl => {
	return obj instanceof File;
};

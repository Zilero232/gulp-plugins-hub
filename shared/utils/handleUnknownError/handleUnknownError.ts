import GulpWinstonLogger from "@zilero/gulp-winston-logger";

import { InvalidFormatError } from "@shared/utils";
import { isFunction } from "@shared/helpers/typeHelpers";

interface HandleUnknownError<TErrorResult = unknown, TSuccessResult = unknown> {
  pluginName: string;
  message?: string;
  error: Error | unknown;
  onError?: (error: NodeJS.ErrnoException) => TErrorResult; // Function for error handling
  onSuccess?: () => TSuccessResult; // Function to execute in the absence of an error.
}

/**
 * Handles an unknown error by passing it to the GulpWinstonLogger plugin
 * for logging and error handling. If the error is not an instance of the
 * Error class, a generic error message is logged.
 */
export function handleUnknownError<TErrorResult, TSuccessResult>({
  pluginName,
  message,
  error,
  onError,
  onSuccess,
}: HandleUnknownError<TErrorResult, TSuccessResult>): TErrorResult | TSuccessResult | void {
  if (onError && !isFunction(onError)) {
    throw new InvalidFormatError({
      fieldName: "handleUnknownError: onError",
      receivedValue: onError,
      expectedType: "function",
    });
  }

  if (onSuccess && !isFunction(onSuccess)) {
    throw new InvalidFormatError({
      fieldName: "handleUnknownError: onSuccess",
      receivedValue: onSuccess,
      expectedType: "function",
    });
  }

  if (error instanceof Error) {
    const typedError = error as NodeJS.ErrnoException;

    GulpWinstonLogger({
      pluginName,
      message,
      error,
    });

    // Executing the function passed for error handling.
    if (onError) {
      return onError(typedError);
    }
  } else {
    GulpWinstonLogger({
      pluginName,
      message: message || "An unknown error occurred",
    });

    // If there is no error, we execute onSuccess, if it is passed.
    if (onSuccess) {
      return onSuccess();
    }
  }
}

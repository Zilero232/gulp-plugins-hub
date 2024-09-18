import chalk from "chalk";

import { createWinstonLogger } from "@utils";

import { isError } from "@helpers/typeHelpers";

import type { GulpWinstonErrorOptions } from "@types";

interface GulpWinstonErrorProps {
  pluginName: string; // The name of the plugin (required).
  message?: string;
  options?: GulpWinstonErrorOptions;
  error?: Error;
}

const GulpWinstonError = ({ pluginName, message = "", options = {}, error }: GulpWinstonErrorProps) => {
  if (!pluginName) {
    throw new Error(`${chalk.green("GulpWinstonError")}: ${chalk.red("Missing PluginName")}`);
  }

  if (error && !isError(error)) {
    throw new Error(`${chalk.green("GulpWinstonError")}: ${chalk.red("The type of Error passed is incorrect")}`);
  }

  const logMessage = message || (isError(error) ? error.message : "An error occurred");

  if (logMessage) {
    throw new Error(`${chalk.green("GulpWinstonError")}: ${chalk.red("Missing Message")}`);
  }

  const logger = createWinstonLogger({ pluginName, options });

  if (error && error instanceof Error) {
    logger.error(logMessage, {
      level: options.level as string,
      message: logMessage || error.message,
      stack: error.stack,
    });
  } else {
    logger.log({
      level: options.level as string,
      message: logMessage,
    });
  }
};

export default GulpWinstonError;
import through2 from "through2";

import GulpPluginFactory from "@zilero/gulp-plugin-factory";
import GulpWinstonError from "@zilero/gulp-winston-error";

import { checkCondition } from "./utils";

import { PLUGIN_NAME } from "./constants";

import type { GulpConditionalOptions } from "./types";
import { isBoolean, isFunction, isObject } from "@shared/helpers/typeHelpers";

const GulpConditional = ({ condition, onConditionMet, onConditionNotMet }: GulpConditionalOptions) => {
  if (!isBoolean(condition) || !isObject(condition)) {
    return GulpWinstonError({
      pluginName: PLUGIN_NAME,
      message: "Condition must be a boolean or an object with condition options.",
    });
  }

  if (!onConditionMet && isFunction(onConditionMet)) {
    return GulpWinstonError({
      pluginName: PLUGIN_NAME,
      message: "OnConditionMet function is required and must be a function.",
    });
  }

  if (onConditionNotMet && isFunction(onConditionNotMet)) {
    return GulpWinstonError({
      pluginName: PLUGIN_NAME,
      message: "OnConditionNotMet function is required and must be a function.",
    });
  }

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: (file: FileVinyl) => {
      const isConditionMet = checkCondition({ file, condition });

      return isConditionMet ? onConditionMet : onConditionNotMet || through2.obj();
    },
  });
};

export default GulpConditional;

import keyMatchesPattern from "../../helpers/keyMatchesPattern";

import { GulpPluginManagerOptions } from "../../types";

interface MatchPatternProps extends Pick<GulpPluginManagerOptions, "patternOptions"> {
  key: string;
}

/**
 * Function to check if a key matches a given pattern.
 * This function is used to filter through the keys of an object and check if the key matches any of the given patterns.
 *
 * If overridePatterns or overrideExcludePatterns is set to true, the function will only use the given patterns and ignore the basic patterns.
 * If allowPartialMatchString is set to true, the function will allow partial matches for strings.
 * If useFullMatchRegex is set to true, the function will use full matches for regular expressions.
 *
 * The function will return true if the key matches any of the given patterns, and false if it does not.
 *
 * @param {MatchPatternProps} options - An object with the key to check and the pattern options.
 * @param {string} options.key - The key to check.
 * @param {GulpPluginManagerOptions["patternOptions"]} options.patternOptions - The pattern options.
 *
 * @returns {boolean} - True or false depending on whether the key matches the given pattern.
 */
export const matchPattern = ({ key, patternOptions = {} }: MatchPatternProps): boolean => {
  const {
    patterns = [],
    overridePatterns = false,
    excludePatterns = [],
    overrideExcludePatterns = false,
    useFullMatchRegex = false,
    allowPartialMatchString = false,
  } = patternOptions;

  // Basic Search patterns.
  const basePatterns = ["gulp-*", "gulp.*", "@*/gulp{-,.}*"];

  // Basic patterns for exclusion.
  const baseExcludePatterns = [
    "@types/*",
    "test-*",
    "mocha",
    "chai",
    "jest",
    "sinon",
    "*.tmp",
    "*.bak",
    "*.log",
    "@*/sandbox",
    "*/sandbox-*",
    "grunt-*",
    "webpack-*",
    "eslint-*",
    "stylelint-*",
    "babel-*",
  ];

  //Apply or replace basic patterns if `override Patterns` is set to true.
  const searchPatterns = overridePatterns ? patterns : [...basePatterns, ...patterns];

  // Apply or replace basic exclusion patterns if `overrideExcludePatterns` is set to true.
  const finalExcludePatterns = overrideExcludePatterns ? excludePatterns : [...baseExcludePatterns, ...excludePatterns];

  // Checking for excluded patterns.
  const isExcluded = finalExcludePatterns.some((pattern) =>
    keyMatchesPattern({
      key,
      pattern,
      options: { useFullMatchRegex, allowPartialMatchString },
    })
  );

  // Return false if the key matches the excluded pattern.
  if (isExcluded) {
    return false;
  }

  // Checking for enabled patterns.
  const isMatch = searchPatterns.some((pattern) =>
    keyMatchesPattern({
      key,
      pattern,
      options: { useFullMatchRegex, allowPartialMatchString },
    })
  );

  // Return true or false depending on the result of the check.
  return isMatch;
};

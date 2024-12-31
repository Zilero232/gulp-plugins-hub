// eslint-disable-next-line @typescript-eslint/no-require-imports
const { composePlugins, withNx } = require("@nx/webpack");

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
      assert: require.resolve("assert/"),
      util: require.resolve("util/"),
      url: require.resolve("url/"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      zlib: require.resolve("browserify-zlib"),
      stream: require.resolve("stream-browserify"),
      tty: require.resolve("tty-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      fs: false,
    },
  };

  return config;
});

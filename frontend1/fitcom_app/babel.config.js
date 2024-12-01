module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // plugins: [
    //   [
    //     "module-resolver",
    //     {
    //       root: ["./"],
    //       alias: {
    //         "@": "./", // This matches the alias defined in your tsconfig.json
    //       },
    //     },
    //   ],
    // ],
  };
};

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "prettier",
  ],
  globals: {
    $nuxt: true,
  },
  parserOptions: {
    parser: "babel-eslint",
  },
};

module.exports = {
  rules: {
    eqeqeq: "off",
    quotes: "off",
    "comma-dangle": 0,
    indent: ["error", 2],
    "no-multiple-empty-lines": "error",
    "semi-style": ["error", "last"],
    "space-before-blocks": ["error", "always"],
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
  env: {
    es6: true,
  },
};

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
      "react",
      "@typescript-eslint",
  ],
  extends: [
      "airbnb",
      "airbnb-typescript",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/jsx-runtime",
      "plugin:@next/next/recommended"
  ],
  parserOptions: {
      project: "./tsconfig.json"
  },
  "rules": {
      "import/extensions": [
          "error",
          "ignorePackages",
          {
              "js": "never",
              "jsx": "never",
              "ts": "never",
              "tsx": "never"
          }
      ],
      "react/function-component-definition": [1, {
              "namedComponents": "arrow-function"
      }],
      "react/jsx-props-no-spreading": [1, {
          "html": "ignore",
      }],
      "no-use-before-define": "off",
      "arrow-body-style": ["error", "as-needed"],
      "@typescript-eslint/no-use-before-define": ["error"],
      "@typescript-eslint/explicdit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/semi": ["error", "never"],
      "react/jsx-filename-extension": [
          1,
          { "extensions": [".js", ".jsx", ".ts", ".tsx"] }
      ]
  },
  "settings": {
      "import/resolver": {
          "node": {
              "extensions": [".js", ".jsx", ".ts", ".tsx"]
          }
      }
  }
};
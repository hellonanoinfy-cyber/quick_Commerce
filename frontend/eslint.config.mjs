import nextVitals from "eslint-config-next/core-web-vitals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginPrettier from "eslint-plugin-prettier";
import pluginImport from "eslint-plugin-import";

const eslintConfig = [
  ...nextVitals,

  // Global ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "*.min.js",
      "*.config.js",
    ],
  },

  // ===================================================
  // JS RULES
  // ===================================================
  {
    files: ["**/*.js", "**/*.jsx"],
    plugins: {
      prettier: pluginPrettier,
      "react-hooks": pluginReactHooks,
      import: pluginImport,
    },
    rules: {
      // Prettier
      "prettier/prettier": "error",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // React 19 rule: too aggressive for prop-sync patterns; revisit per file.
      "react-hooks/set-state-in-effect": "warn",

      // Import
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-unresolved": [
        "error",
        {
          ignore: ["^@/"],
        },
      ],
      "import/named": "error",
      "import/default": "error",

      // React
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-filename-extension": ["error", { extensions: [".jsx", ".js"] }],
      "react/button-has-type": "warn",

      // General JS
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-var": "error",
      "prefer-const": "error",
      "object-shorthand": "error",
      "quote-props": ["error", "as-needed"],
    },
  },

  // ===================================================
  // TYPESCRIPT RULES (if using TS later)
  // ===================================================
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // ===================================================
  // TEST FILES
  // ===================================================
  {
    files: ["**/*.test.js", "**/*.test.jsx", "**/*.spec.js", "**/*.spec.jsx"],
    rules: {
      "no-undef": "off",
    },
  },
];

export default eslintConfig;
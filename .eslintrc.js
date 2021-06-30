module.exports = {
  overrides: [
    {
      files: ['**/*.js'],
      parserOptions: {
        ecmaVersion: 2020,
      },
      extends: ['standard', 'plugin:node/recommended'],
      plugins: ['promise', 'jest'],
      env: {
        browser: true,
        'jest/globals': true,
      },
      rules: {
        'brace-style': ['error', '1tbs'],
        'comma-dangle': ['error', 'always-multiline'],
        indent: ['error', 2, {
          SwitchCase: 1,
        }],
        'jsx-quotes': ['error', 'prefer-single'],
        'key-spacing': ['warn', {
          mode: 'minimum',
        }],
        'max-len': ['warn', {
          code: 120,
          tabWidth: 2,
          ignoreComments: true,
        }],
        'no-unused-vars': ['warn', {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
        }],
        'no-var': 'error',
        'object-curly-spacing': ['error', 'always'],
        'prefer-const': ['warn', {
          destructuring: 'any',
          ignoreReadBeforeAssign: true,
        }],
        semi: ['error', 'never'],
        'space-in-parens': ['error', 'never'],
        'space-before-function-paren': ['error', {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always',
        }],
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser', // Specifies the ESLint parser
      parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
      },
      extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      ],
      rules: {
        'brace-style': ['error', '1tbs'],
        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        indent: ['error', 2, {
          SwitchCase: 1,
        }],
        quotes: ['error', 'single'],
        'jsx-quotes': ['error', 'prefer-single'],
        'key-spacing': ['warn', {
          mode: 'minimum',
        }],
        '@typescript-eslint/type-annotation-spacing': ['warn'],
        'max-len': ['warn', {
          code: 120,
          tabWidth: 2,
          ignoreComments: true,
        }],
        'object-curly-spacing': 'off',
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        'prefer-const': ['warn', {
          destructuring: 'any',
          ignoreReadBeforeAssign: true,
        }],
        semi: 'off',
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/member-delimiter-style': ['error', {
          multiline: {
            delimiter: 'none',
          },
          singleline: {
            delimiter: 'comma',
          },
        }],
        'space-in-parens': ['error', 'never'],
        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': ['error', {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always',
        }],
      },
    },
  ],
}

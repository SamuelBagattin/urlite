module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: { "project": ["./tsconfig.json"] },
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],

    rules: {
        '@typescript-eslint/typedef': [
            'error',
            {
                arrayDestructuring: true,
                arrowParameter: true,
                memberVariableDeclaration: true,
                objectDestructuring: true,
                parameter: true,
                propertyDeclaration: true,
                variableDeclaration: true,
                variableDeclarationIgnoreFunction: true,
            },
        ],
        '@typescript-eslint/explicit-function-return-type': [
            'error',
            {
                allowExpressions: false,
                allowTypedFunctionExpressions: false,
                allowHigherOrderFunctions: false,
                allowConciseArrowFunctionExpressionsStartingWithVoid: false,
            },
        ],
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    },
};

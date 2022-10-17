// Copyright (c) Bentley Systems

module.exports = (tsconfigRootDir, isReactApp = false, additionalRules = {}, otherSettings = {}) => ({
    parser: '@typescript-eslint/parser',
    plugins: ['@bentley', 'eslint-plugin-tsdoc', "header", "filename-rules"],
    extends: [getBentleyEslintPlugin(isReactApp), 'prettier'],
    env: {
        node: true,
        jest: true
    },
    parserOptions: getParserOptions(tsconfigRootDir, isReactApp),
    settings: getSettings(isReactApp),
    rules: getRules(additionalRules),
    ...otherSettings
});

const getBentleyEslintPlugin = (isReactApp) => {
    if(isReactApp) {
        return "plugin:@bentley/ui";
    }

    return "plugin:@bentley/imodeljs-recommended";
}

const getParserOptions = (tsconfigRootDir, isReactApp) => {
    if(isReactApp){
        return {
            ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
            sourceType: "module", // Allows for the use of imports
            ecmaFeatures: {
                jsx: true // Allows for the parsing of JSX
            },
            tsconfigRootDir,
            extraFileExtensions: ['.json'],
        }
    }

    return {
        // project: "./tsconfig.spec.json",
        tsconfigRootDir,
        extraFileExtensions: ['.json'],

    }
}

const getSettings = (isReactApp) => {
    if(isReactApp) {
        return {
            react: {
              version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
            }
        };
    }
    return {};
}

const getRules = (additionalRules) => {
    const rules = {
        // 'tsdoc/syntax': 'warn',
        // 'filename-rules/match': [2, { '.ts': 'kebab-case', '.tsx': 'PascalCase' }],
        'header/header': [
            'error',
            'line',
            copyrightHeader
        ],
        "@typescript-eslint/quotes": "off",
        "quote-props": "off",
        "radix": "off",
        "deprecation/deprecation": "off",
        "@typescript-eslint/comma-dangle": ["error", {
          "arrays": "ignore",
          "objects": "ignore",
          "imports": "never",
          "exports": "never",
          "functions": "ignore"
        }], // dangling commas better for history comparisons so extra line does not change
        "react/jsx-key": "off",
        "@typescript-eslint/no-var-requires": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-autofocus": "off",
        "jsx-a11y/interactive-supports-focus": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        "react-hooks/exhaustive-deps": "off",
        "jsx-a11y/anchor-is-valid": "off",
        "@bentley/react-set-state-usage": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
        "react/display-name": "off",
        "no-console": "off",
        "@bentley/prefer-get": "off",
        "jsx-a11y/no-onchange": "off",
        "jsx-a11y/alt-text": "off",
        "jsx-a11y/label-has-associated-control": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off"


    };
    return {...rules, ...additionalRules};
}

const copyrightHeader = [" Copyright (c) Bentley Systems"];

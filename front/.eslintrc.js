module.exports = {
  root         : true,
  env          : {
    node: true
  },
  extends      : [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules        : {
    'no-console'                        : process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger'                       : process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-empty'                          : 'off',
    'no-extra-semi'                     : 'off',
    'no-extra-parens'                   : 'off',
    'no-extra-boolean-cast'             : 'off',
    'no-func-assign'                    : 'off',
    'no-unexpected-multiline'           : 'off',
    'no-unreachable'                    : 'off',
    'no-constant-condition'             : 'off',
    'no-cond-assign'                    : 'off',
    'no-multi-spaces'                   : 'off',
    'key-spacing'                       : 'off',
    'indent'                            : 'off',
    'space-before-function-paren'       : 'off',
    'semi'                              : 'off',
    'lines-between-class-members'       : 'off',
    'object-property-newline'           : 'off',
    'camelcase'                         : 'off',
    'spaced-comment'                    : 'off',
    'no-control-regex'                  : 'off',
    'keyword-spacing'                   : 'off',
    'no-tabs'                           : 'off',
    'no-lone-blocks'                    : 'off',
    'brace-style'                       : 'off',
    'block-spacing'                     : 'off',
    'space-infix-ops'                   : 'off',
    'space-before-block'                : 'off',
    'space-after-block'                 : 'off',
    'comma-spacing'                     : 'off',
    'arrow-spacing'                     : 'off',
    'comma-dangle'                      : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'object-curly-spacing'              : 'off',
    'no-trailing-spaces'                : 'off',
    '@typescript-eslint/no-unused-vars' : 'off',
    '@typescript-eslint/no-var-requires': 'off',
  }
}

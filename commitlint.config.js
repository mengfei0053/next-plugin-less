module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', Infinity],
    'subject-case': [
      2,
      'never',
      [
        'snake-case', // snake_case
      ],
    ],
  },
};

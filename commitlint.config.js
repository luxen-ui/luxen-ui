export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'css',
        'elements',
        'docs',
        'deps',
        'monorepo',
      ],
    ],
    'scope-empty': [0],
    'subject-case': [2, 'always', 'lower-case'],
  },
};

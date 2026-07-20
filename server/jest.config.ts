import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/modules/auth/**/*.ts',
    'src/modules/user/**/*.ts',
    'src/modules/role/**/*.ts',
    'src/modules/permission/**/*.ts',
    'src/modules/organization/**/*.ts',
    'src/core/security/**/*.ts',
    'src/core/utils/duration.ts',
    '!src/modules/auth/index.ts',
    '!src/modules/user/index.ts',
    '!src/modules/role/index.ts',
    '!src/modules/permission/index.ts',
    '!src/modules/organization/index.ts',
  ],
  coverageDirectory: 'coverage',
  setupFiles: ['<rootDir>/tests/setup/env.setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
};

export default config;

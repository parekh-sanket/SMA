/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  // The build tsconfig uses node16 modules; Jest needs CommonJS, so compile
  // tests as commonjs here (independent of the tsconfig used by `tsc`).
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { module: 'commonjs', moduleResolution: 'node' } },
    ],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/**/*.d.ts'],
  clearMocks: true,
};

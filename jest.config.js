'use strict'

module.exports = {
  roots: ['<rootDir>'],
  testTimeout: 10000,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/node_modules/**"
  ],
  coverageReporters: ['json', 'html']
}

// @ts-check

// Base configuration for all packages
/** @type {import('jest').Config} */
module.exports = {
  transform: { '^.+\\.(t|j)s$': '@swc/jest' },
  // Jest requires all ESM dependencies to be transpiled (even if they are
  // dynamically import()ed).
  transformIgnorePatterns: [
    `/node_modules/.pnpm/(?!(get-port|lande|toygrad)@)`,
  ],
  testTimeout: 60000,
  setupFiles: [`${__dirname}/jest.setup.ts`],
}

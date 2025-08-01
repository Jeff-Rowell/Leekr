import type { Config } from 'jest';

const config: Config = {
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(object-sha)/)'
    ],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    testMatch: ['<rootDir>/**/*.test.{ts,tsx}'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(svg)$': 'jest-transform-stub',
        '\\.(png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js',

    },
    silent: true,
};

export default config;

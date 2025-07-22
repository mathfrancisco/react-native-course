module.exports = {
  preset: 'react-native',
  
  // Diretórios de teste
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // Extensões de arquivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transformações
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Path mapping (alias)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@business/(.*)$': '<rootDir>/src/business/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/setupTests.ts'
  ],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
    '!src/shared/data/json/**',
    '!src/shared/data/mock/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Timeouts
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
};
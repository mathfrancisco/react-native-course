import 'react-native-gesture-handler/jestSetup';

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
    },
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock do console para testes limpos
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Helpers globais para testes
global.testUtils = {
  // Função para aguardar promises
  flushPromises: () => new Promise(resolve => setImmediate(resolve)),
  
  // Função para criar delay
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Função para capturar console calls
  captureConsole: () => {
    const originalLog = console.log;
    const logs: any[] = [];
    
    console.log = (...args) => {
      logs.push(args);
      originalLog(...args);
    };
    
    return {
      logs,
      restore: () => { console.log = originalLog; }
    };
  }
};

// Limpa todos os mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
});
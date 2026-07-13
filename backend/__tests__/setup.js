// Increase Jest timeout for async operations
jest.setTimeout(30000);

// Suppress console warnings during tests for cleaner output
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('MongoMemoryServer')) {
    return; // Suppress MongoMemoryServer warnings
  }
  originalWarn(...args);
};

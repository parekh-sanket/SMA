import '@testing-library/jest-dom';

// jsdom lacks ResizeObserver, which Recharts' ResponsiveContainer relies on.
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver as unknown as typeof globalThis.ResizeObserver;

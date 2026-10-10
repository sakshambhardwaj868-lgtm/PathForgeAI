import '@testing-library/jest-dom';

// ResizeObserver mock for JSDOM
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// SVG element mocks for React Flow in JSDOM
if (typeof window !== 'undefined') {
  window.DOMMatrixReadOnly = window.DOMMatrixReadOnly || class DOMMatrixReadOnly {};
}

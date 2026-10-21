import '@testing-library/jest-dom';

// Mock navigator.vibrate for haptic feedback tests
Object.defineProperty(window.navigator, 'vibrate', {
  writable: true,
  value: () => {}
});

// Mock crypto.randomUUID if not available in jsdom
if (!crypto.randomUUID) {
  (global as any).crypto = {
    ...((global as any).crypto || {}),
    randomUUID: () => Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 10)
  };
}

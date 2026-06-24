import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Proper EventSource mock implementation
class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;
  readyState: number = 0;
  CONNECTING = 0;
  OPEN = 1;
  CLOSED = 2;
  
  private listeners: Map<string, ((event: MessageEvent) => void)[]> = new Map();

  constructor(url: string) {
    this.url = url;
    
    // Bind methods to ensure they work correctly
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.close = this.close.bind(this);
    
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = this.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const index = typeListeners.indexOf(listener);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    }
  }

  close(): void {
    this.readyState = this.CLOSED;
  }

  // Helper method for tests to simulate events
  simulateMessage(type: string, data: any): void {
    const event = new MessageEvent('message', { data: JSON.stringify(data) });
    
    // Call specific event listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener(event));
    }
    
    // Call generic onmessage handler
    if (this.onmessage) {
      this.onmessage(event);
    }
  }

  simulateError(): void {
    const event = new Event('error');
    if (this.onerror) {
      this.onerror(event);
    }
  }
}

// Create a constructor function that returns MockEventSource instances
const EventSourceInstances: MockEventSource[] = [];

// Create the mock constructor
function MockEventSourceConstructor(url: string) {
  const instance = new MockEventSource(url);
  EventSourceInstances.push(instance);
  return instance;
}

// Add static properties to the constructor
MockEventSourceConstructor.CONNECTING = 0;
MockEventSourceConstructor.OPEN = 1;
MockEventSourceConstructor.CLOSED = 2;

// Replace global EventSource with our mock
global.EventSource = vi.fn(MockEventSourceConstructor) as any;

// Helper to get the latest EventSource instance for tests
(global as any).getLatestEventSourceInstance = () => {
  return EventSourceInstances[EventSourceInstances.length - 1];
};

// Helper to clear instances between tests
(global as any).clearEventSourceInstances = () => {
  EventSourceInstances.length = 0;
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia for JSDOM / responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for JSDOM / charts
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as any;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
  // Clear EventSource instances between tests
  (global as any).clearEventSourceInstances?.();
});

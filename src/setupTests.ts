// Jest setup file
import '@testing-library/jest-dom';

// Mock dla requestAnimationFrame i cancelAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
};

// Mock dla ResizeObserver (używany przez niektóre komponenty)
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock dla IntersectionObserver
//@ts-expect-error weird
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock dla scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock dla getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: jest.fn()
}));

// Mock dla getComputedStyle
global.getComputedStyle = jest.fn(() => ({
    getPropertyValue: jest.fn(() => ''),
    setProperty: jest.fn(),
    removeProperty: jest.fn(),
    getPropertyPriority: jest.fn(() => ''),
    length: 0,
    parentRule: null,
    cssFloat: '',
    cssText: '',
    item: jest.fn(() => ''),
    [Symbol.iterator]: jest.fn()
})) as any;

// Mock dla window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Zwiększ domyślny timeout dla async testów
jest.setTimeout(10000);

// Globalne mock dla console.error żeby nie zaśmiecać output testów
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is deprecated')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
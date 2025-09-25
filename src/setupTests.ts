// src/setupTests.ts
import '@testing-library/jest-dom';
import React from 'react';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock IntersectionObserver
//@ts-expect-error weird
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock createPortal for React portals
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node: React.ReactNode) => node,
}));

// DODAJ TE MOCKI dla GuideMeFast:

// Mock getBoundingClientRect
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
    writable: true,
    value: jest.fn(() => ({
        top: 100,
        left: 200,
        width: 150,
        height: 50,
        right: 350,
        bottom: 150,
        x: 200,
        y: 100,
        toJSON: jest.fn(),
    })),
});

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
    return setTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn((id) => {
    clearTimeout(id);
});

// Cleanup after each test
afterEach(() => {
    // Clean up timers
    jest.clearAllTimers();
    // Clean up mocks
    jest.clearAllMocks();
});
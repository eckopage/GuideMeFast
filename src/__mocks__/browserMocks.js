// Browser API mocks for Jest testing environment

// Mock requestAnimationFrame
global.requestAnimationFrame = global.requestAnimationFrame || function (cb) {
    return setTimeout(cb, 16);
};

global.cancelAnimationFrame = global.cancelAnimationFrame || function (id) {
    clearTimeout(id);
};

// Mock HTMLElement methods that may not exist in jsdom
HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || function() {};

// Mock getBoundingClientRect
HTMLElement.prototype.getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect || function() {
    return {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0
    };
};

// Mock for window.getComputedStyle
window.getComputedStyle = window.getComputedStyle || function() {
    return {
        getPropertyValue: function() { return ''; }
    };
};

// Mock for CSS.supports (may be used by Material-UI)
if (typeof CSS === 'undefined') {
    global.CSS = {
        supports: function() { return false; }
    };
}

// Mock for window.matchMedia
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {},
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function() { return true; }
    };
};

// Mock for ResizeObserver
global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock for IntersectionObserver
global.IntersectionObserver = global.IntersectionObserver || class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock console methods to avoid noise in tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = function(...args) {
    // Filter out specific warnings we don't care about in tests
    const message = args[0];
    if (typeof message === 'string' && (
        message.includes('componentWillReceiveProps') ||
        message.includes('componentWillUpdate') ||
        message.includes('ReactDOM.render is deprecated')
    )) {
        return;
    }
    originalWarn.apply(console, args);
};

console.error = function(...args) {
    // Filter out specific errors we don't care about in tests
    const message = args[0];
    if (typeof message === 'string' && (
        message.includes('Warning: ReactDOM.render is deprecated') ||
        message.includes('Warning: componentWillReceiveProps')
    )) {
        return;
    }
    originalError.apply(console, args);
};
// Create a proper Element mock
class MockElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this._classList = new Set();
        this.children = [];
        this.style = {};
    }

    get classList() {
        return {
            add: (className) => this._classList.add(className),
            remove: (className) => this._classList.delete(className),
            contains: (className) => this._classList.has(className)
        };
    }

    addEventListener() { jest.fn() }
    removeEventListener() { jest.fn() }
    setAttribute() { jest.fn() }
    getAttribute() { jest.fn() }
    appendChild(child) { 
        this.children.push(child);
        return child;
    }
}

// Mock document methods
document.createElement = jest.fn((tag) => {
    return new MockElement(tag);
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock querySelector and querySelectorAll
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn(() => []);

// Mock other DOM APIs that might be needed
global.DOMRect = class {
    constructor() {
        this.top = 0;
        this.left = 0;
        this.bottom = 0;
        this.right = 0;
        this.width = 0;
        this.height = 0;
    }
};

// Mock Event
global.Event = class {
    constructor(type) {
        this.type = type;
    }
    preventDefault() {}
    stopPropagation() {}
};

// Mock KeyboardEvent
global.KeyboardEvent = class extends Event {
    constructor(type, options = {}) {
        super(type);
        this.key = options.key || '';
        this.keyCode = options.keyCode || 0;
    }
};
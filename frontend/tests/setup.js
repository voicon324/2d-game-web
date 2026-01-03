// In setup.js we can add global mocks if needed, but per-test file is cleaner for now.
// Just ensuring it imports jest-dom
import '@testing-library/jest-dom';

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = function() {};

import '@testing-library/jest-dom';

// Mock CSS and static asset imports for tests
jest.mock('react-day-picker/style.css', () => ({}), { virtual: true });

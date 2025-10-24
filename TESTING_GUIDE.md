# 🧪 CortexBuild Testing Guide

## Overview

This guide covers the testing framework setup and best practices for CortexBuild.

---

## 📦 Testing Stack

- **Test Runner:** Jest
- **Testing Library:** React Testing Library
- **Coverage:** Jest Coverage
- **Mocking:** Jest Mocks

---

## 🚀 Getting Started

### Installation

Testing dependencies are already installed. To verify:

```bash
npm list jest @testing-library/react
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

---

## 📁 Test Structure

Tests are organized alongside components:

```
components/
├── screens/
│   ├── admin/
│   │   ├── UnifiedAdminDashboard.tsx
│   │   └── __tests__/
│   │       └── UnifiedAdminDashboard.test.tsx
│   └── company/
│       ├── CompanyAdminDashboard.tsx
│       └── __tests__/
│           └── CompanyAdminDashboard.test.tsx
├── ui/
│   ├── Card.tsx
│   └── __tests__/
│       └── Card.test.tsx
└── __tests__/
    ├── integration/
    │   └── DashboardRouting.integration.test.tsx
    └── utils/
        └── testUtils.tsx
```

---

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
import { render, screen } from '@testing-library/react';
import UnifiedDashboardScreen from '../UnifiedDashboardScreen';

describe('Dashboard Routing', () => {
  it('routes super_admin to correct dashboard', () => {
    const user = { role: 'super_admin', id: '1' };
    render(<UnifiedDashboardScreen currentUser={user} />);
    expect(screen.getByTestId('unified-admin-dashboard')).toBeInTheDocument();
  });
});
```

---

## 🛠️ Test Utilities

Use provided test utilities in `components/__tests__/utils/testUtils.tsx`:

```typescript
import { mockUsers, mockCompanies, renderWithProviders } from '../utils/testUtils';

describe('MyComponent', () => {
  it('works with mock data', () => {
    const user = mockUsers.superAdmin;
    render(<MyComponent user={user} />);
    expect(screen.getByText(user.name)).toBeInTheDocument();
  });
});
```

---

## 📊 Coverage Goals

Current coverage thresholds:

- **Branches:** 50%
- **Functions:** 50%
- **Lines:** 50%
- **Statements:** 50%

View coverage report:

```bash
npm run test:coverage
```

---

## 🎯 Testing Priorities

### Priority 1: Critical Components

- ✅ UnifiedAdminDashboard
- ✅ CompanyAdminDashboard
- ✅ UnifiedDashboardScreen (routing)
- ✅ Auth Service
- ✅ UI Components (Card, StatusBadge)

### Priority 2: Integration Tests

- ✅ Dashboard Routing
- [ ] User Management Flow
- [ ] Company Management Flow
- [ ] Billing Flow

### Priority 3: E2E Tests

- [ ] Complete user workflows
- [ ] Multi-step processes
- [ ] Error scenarios

---

## 🔍 Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ Good - Tests behavior
it('displays user name when logged in', () => {
  render(<Dashboard user={mockUser} />);
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
});

// ❌ Bad - Tests implementation
it('calls setUserName function', () => {
  const setUserName = jest.fn();
  render(<Dashboard setUserName={setUserName} />);
  expect(setUserName).toHaveBeenCalled();
});
```

### 2. Use Semantic Queries

```typescript
// ✅ Good - Semantic queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// ❌ Bad - Implementation details
screen.getByTestId('submit-btn');
container.querySelector('.email-input');
```

### 3. Mock External Dependencies

```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { signIn: jest.fn() },
  })),
}));
```

### 4. Clean Up After Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

---

## 🐛 Debugging Tests

### Run Single Test File

```bash
npm test -- UnifiedAdminDashboard.test.tsx
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="renders without crashing"
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📝 Test Checklist

Before committing code:

- [ ] All tests pass: `npm test`
- [ ] Coverage meets thresholds: `npm run test:coverage`
- [ ] No console errors
- [ ] No console warnings
- [ ] Tests are isolated (no dependencies between tests)
- [ ] Mocks are properly cleaned up

---

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 📞 Support

For testing questions or issues:

1. Check existing tests for examples
2. Review test utilities in `components/__tests__/utils/testUtils.tsx`
3. Refer to Jest and React Testing Library documentation

---

*Last Updated: October 24, 2025*
